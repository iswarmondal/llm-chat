import { Dexie, type Table } from "dexie";

export interface DX_Message {
  id: string;
  threadId: string;
  content: string;
  role: "user" | "assistant";
  createdAt: Date;
}

export interface DX_Thread {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessageId: string;
  title: string;
}

class LocalDB extends Dexie {
  messages!: Table<DX_Message>;
  threads!: Table<DX_Thread>;

  constructor() {
    super("localDB");
    this.version(1).stores({
      messages: "++id, threadId, content, role, createdAt",
      threads: "++id, title, createdAt, updatedAt, lastMessageId",
    });
  }

  async addMessage(message: DX_Message, threadId: string) {
    await this.messages.add({
      ...message,
      threadId,
    });
  }

  async addThread(thread: DX_Thread) {
    await this.threads.add(thread);
  }

  async getThread(id: string) {
    return await this.threads.get(id);
  }

  async getRecentThreads() {
    return await this.threads
      .orderBy("updatedAt")
      .reverse()
      .limit(10)
      .toArray();
  }

  async updateThreadTitle(threadId: string, title: string) {
    await this.threads.update(threadId, { title });
  }

  async getMessages(threadId: string) {
    return await this.messages
      .where("threadId")
      .equals(threadId)
      .sortBy("createdAt");
  }
}

const localDB = new LocalDB();

export default localDB;
