import { streamText, UIMessage } from "ai";
import { google } from "@ai-sdk/google";
import admin, { verifyIdToken } from "@/lib/firebase/admin";
import { getFirestore } from "firebase-admin/firestore";

interface Usage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");
  const { threadId, messages }: { threadId: string; messages: UIMessage[] } =
    await req.json();
  if (!authHeader) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!threadId) {
    return new Response("Bad Request: Missing threadId", { status: 400 });
  }

  const token = authHeader.split(" ")[1];
  const decodedToken = await verifyIdToken(token);
  const userId = decodedToken.uid;

  try {
    if (!messages || !Array.isArray(messages)) {
      return new Response("Bad Request: Invalid messages format", {
        status: 400,
      });
    }

    const storeUsage = async (
      userId: string,
      threadId: string,
      usage: Usage
    ) => {
      const db = getFirestore(admin);
      const threadRef = db
        .collection("users")
        .doc(userId)
        .collection("threads")
        .doc(threadId);

      const threadDoc = await threadRef.get();
      const currentUsage = threadDoc.data()?.tokenUsage || {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      };

      const updatedUsage = {
        promptTokens: currentUsage.promptTokens + usage.promptTokens,
        completionTokens:
          currentUsage.completionTokens + usage.completionTokens,
        totalTokens: currentUsage.totalTokens + usage.totalTokens,
      };

      await threadRef.update({
        tokenUsage: updatedUsage,
        updatedAt: new Date(),
      });
      console.log("Usage stored:", updatedUsage);
    };

    const result = streamText({
      model: google("gemini-2.0-flash"),
      system: "You are a helpful assistant.",
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      onFinish: async (completion) => {
        try {
          await storeUsage(userId, threadId, completion.usage);
          console.log("Usage stored successfully after completion");
        } catch (error) {
          console.error("Error storing usage:", error);
        }
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API error: ", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
