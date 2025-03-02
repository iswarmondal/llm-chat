import { initializeApp, cert, getApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

interface Usage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

if (!process.env.FIREBASE_ADMIN_SDK_CREDENTIALS) {
  throw new Error("Firebase credentials not found in environment variables");
}

const admin =
  getApps().length === 0
    ? initializeApp(
        {
          credential: cert(
            JSON.parse(process.env.FIREBASE_ADMIN_SDK_CREDENTIALS)
          ),
        },
        "chat-api"
      )
    : getApp("chat-api");

export const verifyIdToken = async (token: string) => {
  if (!token) {
    throw new Error("No token provided");
  }
  try {
    const decodedToken = await getAuth(admin).verifyIdToken(token);
    if (!decodedToken) {
      throw new Error("Invalid token");
    }
    return decodedToken;
  } catch (error) {
    console.error("Error verifying token:", error);
    throw new Error("Invalid token");
  }
};

export const storeUsage = async (
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
    completionTokens: currentUsage.completionTokens + usage.completionTokens,
    totalTokens: currentUsage.totalTokens + usage.totalTokens,
  };

  await threadRef.update({
    tokenUsage: updatedUsage,
    updatedAt: new Date(),
  });
};

export default admin;
