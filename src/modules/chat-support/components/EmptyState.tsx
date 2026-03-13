import React from "react";
import { MessageCircleIcon } from "lucide-react";

export function EmptyState({
  hasSelection,
  conversationsLength,
  isAdvisor,
  onStartConversation,
}: {
  hasSelection: boolean;
  conversationsLength: number;
  isAdvisor: boolean;
  onStartConversation: () => void;
}) {
  if (!hasSelection && conversationsLength > 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center text-gray-600 space-y-3">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <MessageCircleIcon size={28} className="text-gray-400" />
        </div>
        <p className="text-base font-medium text-gray-700">
          Select a conversation
        </p>
        <p className="text-sm text-gray-500">
          Choose a conversation from the left to view details.
        </p>
      </div>
    );
  }

  if (isAdvisor) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <MessageCircleIcon size={32} className="text-blue-500" />
        </div>
        <h3 className="text-md font-small text-gray-600 mb-2">
          No messages yet
        </h3>
        <p className="text-sm text-gray-500">
          New conversations will appear here when initiated.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
        <MessageCircleIcon size={32} className="text-blue-500" />
      </div>
      <h3 className="text-md font-small text-gray-600 mb-2">No messages yet</h3>
      <button
        onClick={onStartConversation}
        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Start Conversation
      </button>
    </div>
  );
}

