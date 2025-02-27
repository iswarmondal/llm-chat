import { google } from "@ai-sdk/google";
import { streamText, generateText } from "ai";
import { type Response } from "express";
// Function to handle LLM requests
export async function handleLLMRequestStream(messages: any, res: Response) {
  const result = streamText({
    model: google("gemini-2.0-flash", {
      useSearchGrounding: true,
    }),
    messages,
    onError: (error) => {
      console.error("Error in handleLLMRequest:", error);
    },
    onFinish: () => {
      console.log("Stream finished");
      res.end();
    },
  });
  result.pipeTextStreamToResponse(res);
}

export async function handleLLMRequest(messages: any) {
  const result = await generateText({
    model: google("gemini-2.0-flash", {
      useSearchGrounding: true,
    }),
    messages,
  });
  return result.text;
}
