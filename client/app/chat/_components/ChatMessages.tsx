"use client";

import { marked } from "marked";
import { Message } from "@ai-sdk/react";

interface ChatMessagesProps {
  messages: Message[];
}

export const ChatMessages = ({ messages }: ChatMessagesProps) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`relative max-w-[80%] p-5 ${
              message.role === "user"
                ? "bg-black text-white -rotate-1"
                : "bg-white text-black rotate-1"
            } 
            shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
            border-2 border-black
            transition-transform hover:-translate-y-0.5`}
          >
            {message.role === "assistant" ? (
              <div
                className="prose prose-stone prose-sm max-w-none
                prose-headings:font-bold prose-headings:text-black
                prose-p:text-black prose-p:mb-4
                prose-code:text-black prose-code:bg-gray-200 prose-code:px-1 prose-code:rounded
                prose-pre:bg-gray-800 prose-pre:text-white prose-pre:p-4 prose-pre:border-2 prose-pre:border-black
                prose-a:text-blue-600 prose-a:font-bold prose-a:no-underline hover:prose-a:underline
                prose-strong:text-black prose-strong:font-bold
                prose-ul:list-disc prose-ul:pl-5
                prose-ol:list-decimal prose-ol:pl-5
                prose-li:text-black overflow-scroll"
                dangerouslySetInnerHTML={{
                  __html: marked(message.content, {
                    breaks: true,
                    gfm: true,
                  }),
                }}
              />
            ) : (
              <p className="whitespace-pre-wrap font-medium">
                {message.content}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
