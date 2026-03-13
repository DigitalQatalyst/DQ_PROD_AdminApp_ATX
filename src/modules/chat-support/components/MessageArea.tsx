import React from "react";
import type { Message } from "../types";
import { MessageBubble } from "./MessageBubble";
import { EmptyState } from "./EmptyState";
import { TypingIndicator } from "./TypingIndicator";

export function MessageArea({
  shouldShowSelectPrompt,
  showEmptyState,
  isLoadingMessages,
  visibleMessages,
  onRetryMessage,
  onReply,
  getReplyMessage,
  onDeleteMessage,
  onEditMessage,
  onCopyMessage,
  isTyping,
  hasSelection,
  messagesEndRef,
  conversationsLength,
  isAdvisor,
  onStartConversation,
}: {
  shouldShowSelectPrompt: boolean;
  showEmptyState: boolean;
  isLoadingMessages: boolean;
  visibleMessages: Message[];
  onRetryMessage: (messageId: string) => void;
  onReply: (messageId: string) => void;
  getReplyMessage: (messageId?: string) => Message | null;
  onDeleteMessage: (messageId: string, deleteForEveryone: boolean) => void;
  onEditMessage: (messageId: string, newContent: string) => void;
  onCopyMessage: (content: string) => void;
  isTyping: boolean;
  hasSelection: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  conversationsLength: number;
  isAdvisor: boolean;
  onStartConversation: () => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50" id="message-container">
      {shouldShowSelectPrompt || showEmptyState ? (
        <EmptyState
          hasSelection={hasSelection}
          conversationsLength={conversationsLength}
          isAdvisor={isAdvisor}
          onStartConversation={onStartConversation}
        />
      ) : isLoadingMessages ? (
        <div className="space-y-4 animate-pulse">
          {/* Incoming message skeleton */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
            <div className="space-y-2">
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="h-16 w-64 bg-gray-200 rounded-lg" />
            </div>
          </div>
          {/* Outgoing message skeleton */}
          <div className="flex items-start gap-3 justify-end">
            <div className="space-y-2 flex flex-col items-end">
              <div className="h-4 w-16 bg-gray-200 rounded" />
              <div className="h-12 w-48 bg-blue-100 rounded-lg" />
            </div>
          </div>
          {/* Another incoming */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-20 w-72 bg-gray-200 rounded-lg" />
            </div>
          </div>
        </div>
      ) : (
        <>
          {visibleMessages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onRetry={() => onRetryMessage(message.id)}
              onReply={onReply}
              replyMessage={getReplyMessage(message.replyTo)}
              onDeleteMessage={onDeleteMessage}
              onEditMessage={onEditMessage}
              onCopyMessage={onCopyMessage}
            />
          ))}
          {isTyping && hasSelection && <TypingIndicator />}
        </>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

