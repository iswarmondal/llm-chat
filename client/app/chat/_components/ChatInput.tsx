"use client";

import { Button, ExpandableTextarea } from "@/app/_brutalComponents";
import classNames from "classnames";

interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  isSidebarOpen: boolean;
  isLoading: boolean;
}

export const ChatInput = ({
  input,
  onInputChange,
  onSubmit,
  isSidebarOpen,
  isLoading,
}: ChatInputProps) => {
  return (
    <div
      className={classNames("p-1 fixed bottom-0 left-0 right-0", {
        "left-[260px]": isSidebarOpen,
      })}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="flex gap-2"
      >
        <div className="flex-1">
          <ExpandableTextarea
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Type your message here..."
            minRows={1}
            maxRows={6}
            size="full"
          />
        </div>
        <Button
          buttonText={isLoading ? "Sending..." : "Send"}
          buttonType="primary"
          onClick={onSubmit}
          disabled={!input.trim() || isLoading}
        />
      </form>
    </div>
  );
};
