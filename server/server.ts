import express, { type Request, type Response } from "express";
import cors from "cors";
import admin from "firebase-admin";
import { verifyFirebaseAuth } from "./middlewares/auth";
import { handleLLMRequest, handleLLMRequestStream } from "./services/AISdk";
import { google } from "@ai-sdk/google";
import { streamText, type UIMessage } from "ai";

const app = express();
const corsOptions = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
const port = 8080;

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(
  process.env.FIREBASE_ADMIN_SDK_CREDENTIALS || "{}"
);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.use(express.json());

app.post(
  "/api/llm",
  verifyFirebaseAuth,
  async (req: Request, res: Response) => {
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
  async (req: Request, res: Response) => {
    try {
      const userMessages = req.body.messages as UIMessage[];

      if (!userMessages || userMessages.length === 0) {
        return res.status(400).send("Bad Request: Missing prompt");
      }

      // Stream the response using our AI service
      // await handleLLMRequestStream(messages, res);

      const result = streamText({
        model: google("gemini-2.0-flash", {
          useSearchGrounding: true,
        }),
        messages: userMessages,
        onError: (error) => {
          console.error("Error in handleLLMRequest:", error);
        },
      });
      result.toDataStreamResponse();
    } catch (error) {
      console.error("Error in /api/llm/stream:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

// token verify endpoint
app.get("/auth/verify", async (req: Request, res: Response) => {
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

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.get("/health", (req: Request, res: Response) => {
  res.send("OK");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
