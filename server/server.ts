import express, { type Request, type Response } from "express";
import admin from "firebase-admin";
import { verifyFirebaseAuth } from "./middlewares/auth";
import { handleLLMRequest, handleLLMRequestStream } from "./services/AISdk";

const app = express();
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
      const { prompt } = req.body;
      if (!prompt.trim()) {
        return res.status(400).send("Bad Request: Missing prompt");
      }

      // Format messages for the LLM
      const messages = [{ role: "user", content: prompt }];

      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });

      // Stream the response using our AI service
      await handleLLMRequestStream(messages, res);
    } catch (error) {
      console.error("Error in /api/llm/stream:", error);
      res.status(500).send("Internal Server Error");
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
