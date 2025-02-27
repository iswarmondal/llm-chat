"use client";
import React, { useEffect, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { auth } from "@/lib/firebase/init";

export default function Page() {
  const [userAuthToken, setUserAuthToken] = useState<string | null>(null);
  const { messages, input, setInput, append } = useChat({
    headers: {
      Authorization: `Bearer ${userAuthToken}`,
    },
  });

  useEffect(() => {
    const fetchUserAuthToken = async () => {
      const token = await auth.currentUser?.getIdToken();
      if (token) {
        setUserAuthToken(token);
      }
    };
    fetchUserAuthToken();
  }, []);

  return (
    <div className="min-h-screen pt-16 border-4 border-black flex flex-col">
      {messages.map((message, index) => (
        <div key={index}>{message.content}</div>
      ))}
      <input
        className="border-4 border-black"
        value={input}
        onChange={(event) => {
          setInput(event.target.value);
        }}
        onKeyDown={async (event) => {
          if (event.key === "Enter") {
            append({ content: input, role: "user" });
          }
        }}
      />
    </div>
  );
}
