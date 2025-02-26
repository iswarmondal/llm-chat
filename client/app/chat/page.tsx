"use client";

import { useState } from "react";
import {
  Button,
  Container,
  HeadingText,
  ExpandableTextarea,
} from "@/app/_brutalComponents";
import classNames from "classnames";

// Mock data types
type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
};

type ChatThread = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
};

// Mock data
const mockChatThreads: ChatThread[] = [
  {
    id: "1",
    title: "How to build a website",
    messages: [
      {
        id: "m1",
        content: "How do I build a website from scratch?",
        role: "user",
        timestamp: new Date("2023-05-15T10:30:00"),
      },
      {
        id: "m2",
        content:
          "Building a website from scratch involves several steps. First, you'll need to decide on the technologies you want to use. For a simple website, you might start with HTML, CSS, and JavaScript. For more complex applications, you might consider frameworks like React, Vue, or Angular for the frontend, and Node.js, Django, or Ruby on Rails for the backend...",
        role: "assistant",
        timestamp: new Date("2023-05-15T10:31:00"),
      },
    ],
    createdAt: new Date("2023-05-15T10:30:00"),
    updatedAt: new Date("2023-05-15T10:31:00"),
  },
  {
    id: "2",
    title: "Learning JavaScript basics",
    messages: [
      {
        id: "m3",
        content: "What are the basics of JavaScript I should learn?",
        role: "user",
        timestamp: new Date("2023-05-16T14:20:00"),
      },
      {
        id: "m4",
        content:
          "JavaScript basics include understanding variables, data types, functions, control flow (if/else statements, loops), and DOM manipulation. Start by learning how to declare variables with let and const, work with strings, numbers, and arrays, and write simple functions...",
        role: "assistant",
        timestamp: new Date("2023-05-16T14:21:00"),
      },
    ],
    createdAt: new Date("2023-05-16T14:20:00"),
    updatedAt: new Date("2023-05-16T14:21:00"),
  },
  {
    id: "3",
    title: "React vs Vue comparison",
    messages: [
      {
        id: "m5",
        content: "What are the main differences between React and Vue?",
        role: "user",
        timestamp: new Date("2023-05-17T09:15:00"),
      },
      {
        id: "m6",
        content:
          "React and Vue are both popular JavaScript frameworks for building user interfaces, but they have some key differences. React uses JSX and a more JavaScript-centric approach, while Vue uses templates that are closer to HTML. Vue has a gentler learning curve and more built-in features, while React is more minimal and flexible...",
        role: "assistant",
        timestamp: new Date("2023-05-17T09:16:00"),
      },
    ],
    createdAt: new Date("2023-05-17T09:15:00"),
    updatedAt: new Date("2023-05-17T09:16:00"),
  },
];

const ChatPage = () => {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(
    mockChatThreads[0]?.id || null
  );
  const [message, setMessage] = useState("");
  const [threads, setThreads] = useState<ChatThread[]>(mockChatThreads);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const selectedThread =
    threads.find((thread) => thread.id === selectedThreadId) || null;

  const handleSendMessage = (content: string) => {
    if (!selectedThreadId || !content.trim()) return;

    const newMessage: Message = {
      id: `m${Date.now()}`,
      content,
      role: "user",
      timestamp: new Date(),
    };

    // Mock assistant response
    const assistantResponse: Message = {
      id: `m${Date.now() + 1}`,
      content:
        "This is a mock response from the assistant. In a real application, this would be the response from the LLM API.",
      role: "assistant",
      timestamp: new Date(),
    };

    setThreads((prevThreads) =>
      prevThreads.map((thread) =>
        thread.id === selectedThreadId
          ? {
              ...thread,
              messages: [...thread.messages, newMessage, assistantResponse],
              updatedAt: new Date(),
            }
          : thread
      )
    );

    setMessage("");
  };

  const createNewChat = () => {
    const newThread: ChatThread = {
      id: `thread-${Date.now()}`,
      title: "New conversation",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setThreads((prevThreads) => [newThread, ...prevThreads]);
    setSelectedThreadId(newThread.id);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="flex h-screen bg-gray-100 relative">
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
              <div className="font-bold truncate">{thread.title}</div>
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
        <div>
          {selectedThread ? (
            <>
              {/* Chat Header */}
              {/* <Container className="px-4 py-2 rounded-none border-b-4 border-l-0 border-r-0 border-t-0">
                <HeadingText level={3}>{selectedThread.title}</HeadingText>
              </Container> */}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedThread.messages.map((message) => (
                  <div
                    key={message.id}
                    className={classNames("max-w-3xl", {
                      "ml-auto": message.role === "user",
                    })}
                  >
                    <Container
                      bgColor={message.role === "user" ? "yellow" : "white"}
                      shadowSize="none"
                      className="p-3"
                    >
                      <div className="font-bold mb-1">
                        {message.role === "user" ? "You" : "Assistant"}
                      </div>
                      <div>{message.content}</div>
                    </Container>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-1 fixed bottom-0 left-0 right-0">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <ExpandableTextarea
                      value={message}
                      onChange={setMessage}
                      onSubmit={handleSendMessage}
                      placeholder="Type your message here..."
                      minRows={1}
                      maxRows={5}
                      className="h-full"
                    />
                  </div>
                  <Button
                    buttonText="Send"
                    buttonType="primary"
                    onClick={() => handleSendMessage(message)}
                    disabled={!message.trim()}
                  />
                </div>
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
