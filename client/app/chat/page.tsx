"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Container,
  HeadingText,
  ExpandableTextarea,
} from "@/app/_brutalComponents";
import classNames from "classnames";
import localDB from "@/lib/dexie/init";
import { type DX_Thread, type DX_Message } from "@/lib/dexie/init";
import { Message, useChat } from "@ai-sdk/react";
import { auth } from "@/lib/firebase/init";

const ChatPage = () => {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [threads, setThreads] = useState<DX_Thread[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userAuthToken, setUserAuthToken] = useState<string | null>(null);

  const selectedThread =
    threads.find((thread) => thread.id === selectedThreadId) || null;

  const {
    messages,
    input,
    setInput,
    append,
    status,
    setMessages,
  } = useChat({
    headers: {
      Authorization: `Bearer ${userAuthToken}`,
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const reloadThreadsAndMessages = async () => {
    const threads = await localDB.getRecentThreads();
    setThreads(threads);
    if (threads.length > 0) {
      setSelectedThreadId(threads[0].id);
      const localMessages = await localDB.getMessages(threads[0].id);

      // Convert local messages to messages format
      const messages = localMessages.map((message) => ({
        id: message.id ?? crypto.randomUUID(), // Ensure id is always present
        content: message.content,
        role: message.role,
        createdAt: new Date(message.createdAt),
      }));
      setMessages(messages);
    }
  };

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

  return (
    <div className="flex h-screen bg-gray-200 relative">
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

      {/* Overlay when sidebar is open on mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={classNames(
          "w-64 h-screen flex flex-col border-r-4 border-black bg-white transition-transform duration-300 fixed left-0 top-0 z-30",
          {
            "translate-x-0": isSidebarOpen,
            "-translate-x-full": !isSidebarOpen,
          }
        )}
      >
        <div className="p-4 border-b-4 border-black">
          <HeadingText level={3}>Chat History</HeadingText>
          <Button
            buttonText="New Chat"
            buttonType="primary"
            size="full"
            onClick={createNewChat}
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {threads.map((thread) => (
            <div
              key={thread.id}
              className={classNames(
                "p-3 border-b-2 border-black cursor-pointer hover:bg-gray-700 hover:text-white transition-colors",
                { "bg-gray-900 text-white": selectedThreadId === thread.id }
              )}
              onClick={() => setSelectedThreadId(thread.id)}
            >
              <div className="font-bold truncate">
                {thread.title ?? "New Chat"}
              </div>
              <div className="text-sm ">{formatDate(thread.updatedAt)}</div>
            </div>
          ))}
        </div>
      </div>

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
              {/* Chat Header */}
              {/* <Container className="px-4 py-2 rounded-none border-b-4 border-l-0 border-r-0 border-t-0">
                <HeadingText level={3}>{selectedThread.title}</HeadingText>
              </Container> */}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={classNames(
                      "max-w-3xl",
                      {"ml-auto": message.role === "user"}
                    )}
                  >
                    <Container
                      bgColor={message.role === "user" ? "green" : "white"}
                      shadowSize="none"
                      className="p-3"
                    >
                      <div className="font-bold mb-1">{message.role}</div>
                      <div>{message.content}</div>
                    </Container>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div
                className={classNames("p-1 fixed bottom-0 left-0 right-0", {
                  "left-[260px]": isSidebarOpen,
                })}
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    append({ content: input, role: "user" });
                    setInput("");
                  }}
                  className="flex gap-2"
                >
                  <div className="flex-1">
                    <ExpandableTextarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type your message here..."
                      minRows={1}
                      maxRows={6}
                      size="full"
                    />
                  </div>
                  <Button
                    buttonText={
                      status === "streaming" || status === "submitted"
                        ? "Sending..."
                        : "Send"
                    }
                    buttonType="primary"
                    onClick={() => {
                      append({ content: input, role: "user" });
                      setInput("");
                    }}
                    disabled={
                      !input.trim() ||
                      status === "streaming" ||
                      status === "submitted"
                    }
                  />
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <Container className="p-8 max-w-md">
                <HeadingText level={2} className="mb-4">
                  Welcome to Chat
                </HeadingText>
                <p className="mb-6">
                  Select a conversation from the sidebar or start a new chat.
                </p>
                <Button
                  buttonText="New Chat"
                  buttonType="primary"
                  size="full"
                  onClick={createNewChat}
                />
              </Container>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
