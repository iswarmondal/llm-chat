"use client";

import { useEffect, useState } from "react";
import { Button } from "@/app/_brutalComponents";
import classNames from "classnames";
import localDB from "@/lib/dexie/init";
import { type DX_Thread, type DX_Message } from "@/lib/dexie/init";
import { Message, useChat } from "@ai-sdk/react";
import { auth } from "@/lib/firebase/init";
import { ChatSidebar } from "./_components/ChatSidebar";
import { ChatMessages } from "./_components/ChatMessages";
import { ChatInput } from "./_components/ChatInput";
import { EmptyState } from "./_components/EmptyState";

const ChatPage = () => {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [threads, setThreads] = useState<DX_Thread[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userAuthToken, setUserAuthToken] = useState<string | null>(null);

  const selectedThread =
    threads.find((thread) => thread.id === selectedThreadId) || null;

  const { messages, input, setInput, append, status, setMessages } = useChat({
    headers: {
      Authorization: `Bearer ${userAuthToken}`,
    },
    body: {
      threadId: selectedThreadId,
    },
    onFinish: async (message: Message) => {
      // Save messages to local DB when the stream is finished
      if (!selectedThreadId) return;

      const userMessage: DX_Message = {
        content: input.trim(),
        role: "user",
        createdAt: new Date().getMilliseconds(),
        threadId: selectedThreadId,
      };

      const assistantMessage: DX_Message = {
        content: message.content,
        role: "assistant",
        createdAt: new Date().getMilliseconds(),
        threadId: selectedThreadId,
      };

      await localDB.addMessage(userMessage, selectedThreadId);
      await localDB.addMessage(assistantMessage, selectedThreadId);

      if (selectedThread?.title === "New Chat") {
        await localDB.updateThreadTitle(
          selectedThreadId,
          userMessage.content.slice(0, 20)
        );
      }

      setThreads((prevThreads) =>
        prevThreads.map((thread) =>
          thread.id === selectedThreadId
            ? {
                ...thread,
                lastMessageId: assistantMessage.id ?? "",
                title: userMessage.content.slice(0, 20),
                updatedAt: new Date(),
              }
            : thread
        )
      );
    },
  });

  const createNewChat = async () => {
    try {
      const newThread: DX_Thread = {
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
        lastMessageId: "",
        title: "New Chat",
      };

      await localDB.addThread(newThread);

      setThreads((prevThreads) => [newThread, ...prevThreads]);
      setSelectedThreadId(newThread.id);
      setMessages([]);
    } catch (error) {
      console.error(error);
    }
  };

  const reloadThreadsAndMessages = async () => {
    const threads = await localDB.getRecentThreads();
    setThreads(threads);
    if (threads.length > 0) {
      setSelectedThreadId(threads[0].id);
      const localMessages = await localDB.getMessages(threads[0].id);

      // Convert local messages to messages format
      const messages = localMessages.map((message) => ({
        id: message.id ?? crypto.randomUUID(),
        content: message.content,
        role: message.role,
        createdAt: new Date(message.createdAt),
      }));
      setMessages(messages);
    }
  };

  // Load initial data and set up auth token
  useEffect(() => {
    const fetchUserAuthToken = async () => {
      const token = await auth.currentUser?.getIdToken();
      if (token) {
        setUserAuthToken(token);
      }
    };
    fetchUserAuthToken();
    reloadThreadsAndMessages();
  });

  // Load messages when selected thread changes
  useEffect(() => {
    const loadMessagesForThread = async () => {
      if (!selectedThreadId) return;

      const localMessages = await localDB.getMessages(selectedThreadId);
      const messages = localMessages.map((message) => ({
        id: message.id ?? crypto.randomUUID(),
        content: message.content,
        role: message.role,
        createdAt: new Date(message.createdAt),
      }));
      setMessages(messages);
    };

    loadMessagesForThread();
  }, [selectedThreadId, setMessages]);

  const handleSubmit = () => {
    append({ content: input, role: "user" });
    setInput("");
  };

  return (
    <div className="flex min-h-screen bg-gray-200 relative pb-16">
      {/* Sidebar Toggle Button */}
      <Button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={classNames("absolute top-4 left-4 z-50 max-w-12 h-12", {
          "left-[260px]": isSidebarOpen,
        })}
        buttonText={isSidebarOpen ? "←" : "→"}
        buttonType="secondary"
        size="sm"
      />

      <ChatSidebar
        threads={threads}
        selectedThreadId={selectedThreadId}
        isSidebarOpen={isSidebarOpen}
        onThreadSelect={setSelectedThreadId}
        onNewChat={createNewChat}
        onCloseSidebar={() => setIsSidebarOpen(false)}
      />

      {/* Chat Area */}
      <div
        className={classNames(
          "flex-1 flex flex-col transition-all duration-300",
          {
            "ml-64": isSidebarOpen,
            "ml-0": !isSidebarOpen,
          }
        )}
      >
        <div className="flex flex-col flex-1">
          {selectedThread ? (
            <>
              <ChatMessages messages={messages} />
              <ChatInput
                input={input}
                onInputChange={setInput}
                onSubmit={handleSubmit}
                isSidebarOpen={isSidebarOpen}
                isLoading={status === "streaming" || status === "submitted"}
              />
            </>
          ) : (
            <EmptyState onNewChat={createNewChat} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
