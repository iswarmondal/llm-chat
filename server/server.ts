import express, { type Request, type Response } from "express";
import cors from "cors";
import admin from "firebase-admin";
import { verifyFirebaseAuth, type CustomRequest } from "./middlewares/auth";
import { handleLLMRequest } from "./services/AISdk";
import { google } from "@ai-sdk/google";
import { streamText, type UIMessage } from "ai";
import {
  createIntentSession,
  handleWebhookEvent,
  verifyIntentSession,
} from "./services/stripe";
import Stripe from "stripe";
import { updateUsage } from "./services/firebase/firestore";
import { corsOptions, serviceAccount, port } from "./config";
const app = express();

app.use(cors(corsOptions));

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.use(express.json());

// Special raw body parser for Stripe webhooks
const stripeWebhookMiddleware = express.raw({ type: "application/json" });

app.post(
  "/api/llm",
  verifyFirebaseAuth,
  async (req: CustomRequest, res: Response) => {
    try {
      const { prompt } = req.body;
      if (!prompt.trim()) {
        return res.status(400).send("Bad Request: Missing prompt");
      }

      // Format messages for the LLM
      const messages = [{ role: "user", content: prompt }];

      // Stream the response using our AI service
      const stream = await handleLLMRequest(messages);
      return res.json({ response: stream });
    } catch (error) {
      console.error("Error in /api/llm:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

app.post(
  "/api/llm/stream",
  verifyFirebaseAuth,
  async (req: CustomRequest, res: Response) => {
    try {
      if (!req.decodedToken?.uid) {
        return res.status(401).json({ error: "Unauthorized: Missing user ID" });
      }
      const userMessages = req.body.messages as UIMessage[];
      const threadId = req.body.threadId as string;

      if (!userMessages || userMessages.length === 0) {
        return res.status(400).send("Bad Request: Missing prompt");
      }

      const result = streamText({
        model: google("gemini-2.0-flash", {
          useSearchGrounding: true,
        }),
        messages: userMessages,
        onError: (error) => {
          console.error("Error in handleLLMRequest:", error);
        },
      });

      // Get usage before returning stream
      const usage = await result.usage;
      await updateUsage(threadId, req.decodedToken.uid, usage);

      console.log("usage", usage);

      // Return stream last since it ends the response
      return result.toDataStreamResponse();
    } catch (error) {
      console.error("Error in /api/llm/stream:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

// token verify endpoint
app.get("/auth/verify", async (req: CustomRequest, res: Response) => {
  console.log("auth verify");
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized: Missing auth token" });
  }

  try {
    const token = authHeader.split(" ")[1];
    await admin.auth().verifyIdToken(token);
    return res.status(200).json({ status: "valid" });
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(401).json({ error: "Unauthorized: Invalid auth token" });
  }
});

// Stripe payment endpoints
app.post(
  "/api/payment/create-intent-session",
  verifyFirebaseAuth,
  async (req: CustomRequest, res: Response) => {
    try {
      if (!req.decodedToken?.uid) {
        return res.status(401).json({ error: "Unauthorized: Missing user ID" });
      }

      // Create checkout session
      const { intent } = await createIntentSession(req.decodedToken.uid);

      return res.json({
        intent,
      });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      return res
        .status(500)
        .json({ error: "Failed to create checkout session" });
    }
  }
);

// Verify checkout session endpoint
app.get(
  "/api/payment/verify-intent",
  verifyFirebaseAuth,
  async (req: CustomRequest, res: Response) => {
    try {
      const { sessionId, intentId } = req.query;

      if (!sessionId && !intentId) {
        return res.status(400).json({ error: "Missing sessionId or intentId" });
      }

      let status: string;

      if (sessionId) {
        // Verify checkout session
        status = await verifyIntentSession(sessionId as string);
      } else {
        // Verify setup intent
        const intent = await stripe.setupIntents.retrieve(intentId as string);
        status = intent.status;
      }

      return res.json({ status });
    } catch (error) {
      console.error("Error verifying payment:", error);
      return res.status(500).json({ error: "Failed to verify payment" });
    }
  }
);

// Charge customer endpoint
app.post(
  "/api/payment/charge",
  verifyFirebaseAuth,
  async (req: CustomRequest, res: Response) => {
    try {
      if (!req.decodedToken?.uid) {
        return res.status(401).json({ error: "Unauthorized: Missing user ID" });
      }

      const { amount } = req.body;
      if (!amount || typeof amount !== "number" || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }

      // Convert dollars to cents for Stripe
      const amountInCents = Math.round(amount * 100);

      // Charge the customer
      const paymentIntent = await chargeCustomer(
        req.decodedToken.uid,
        amountInCents,
        `Token purchase - $${amount.toFixed(2)}`
      );

      return res.json({
        success: true,
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
        },
      });
    } catch (error) {
      console.error("Error charging customer:", error);
      return res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to process payment",
      });
    }
  }
);

// Stripe webhook endpoint - no auth required, but uses Stripe signature verification
app.post(
  "/api/webhooks/stripe",
  stripeWebhookMiddleware,
  async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      return res.status(500).json({ error: "Webhook secret not configured" });
    }

    let event: Stripe.Event;

    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      await handleWebhookEvent(event);
      res.json({ received: true });
    } catch (error) {
      console.error("Error handling webhook event:", error);
      res.status(500).json({ error: "Failed to process webhook" });
    }
  }
);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.get("/health", (req: Request, res: Response) => {
  res.send("OK");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
