"use client";

import { Button, Container, HeadingText } from "@/app/_brutalComponents";

interface EmptyStateProps {
  onNewChat: () => void;
}

export const EmptyState = ({ onNewChat }: EmptyStateProps) => {
  return (
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
          onClick={onNewChat}
        />
      </Container>
    </div>
  );
};
