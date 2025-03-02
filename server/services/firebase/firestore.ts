import admin from "firebase-admin";

interface Usage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export const getThread = async (userId: string, threadId: string) => {
  const db = admin.firestore();
  const threadRef = db
  .collection("users")
  .doc(userId)
  .collection("threads")
  .doc(threadId);
  const thread = await threadRef.get();
  return thread.data();
};

export const createThread = async (threadId: string, userId: string) => {
  const db = admin.firestore();
  const threadRef = db
  .collection("users")
  .doc(userId)
  .collection("threads")
  .doc(threadId);
  await threadRef.set({
    createdAt: new Date(),
    updatedAt: new Date(),
    tokenUsage: {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    },
    messages: [],
  });
};

export const updateUsage = async (
  threadId: string,
  userId: string,
  usage: Usage
) => {
  const db = admin.firestore();
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
