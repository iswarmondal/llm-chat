"use client";

import { Button, HeadingText } from "@/app/_brutalComponents";
import { type DX_Thread } from "@/lib/dexie/init";
import classNames from "classnames";

interface ChatSidebarProps {
  threads: DX_Thread[];
  selectedThreadId: string | null;
  isSidebarOpen: boolean;
  onThreadSelect: (threadId: string) => void;
  onNewChat: () => void;
  onCloseSidebar: () => void;
}

export const ChatSidebar = ({
  threads,
  selectedThreadId,
  isSidebarOpen,
  onThreadSelect,
  onNewChat,
  onCloseSidebar,
}: ChatSidebarProps) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <>
      {/* Overlay when sidebar is open on mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onCloseSidebar}
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
            onClick={onNewChat}
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
              onClick={() => onThreadSelect(thread.id)}
            >
              <div className="font-bold truncate">
                {thread.title ?? "New Chat"}
              </div>
              <div className="text-sm ">{formatDate(thread.updatedAt)}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
