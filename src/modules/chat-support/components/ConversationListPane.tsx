import React from "react";
import type { ConversationSummary } from "../services/ChatSupportService";

export function ConversationListPane({
  mobileView,
  crmRoleLabel,
  isAdvisor,
  isCreatingConversation,
  onStartConversation,
  isLoadingConversations,
  conversations,
  selectedConversationId,
  onSelectConversation,
  resolveRoleLabel,
  formatTime,
}: {
  mobileView: "list" | "conversation";
  crmRoleLabel: string;
  isAdvisor: boolean;
  isCreatingConversation: boolean;
  onStartConversation: () => void;
  isLoadingConversations: boolean;
  conversations: ConversationSummary[];
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string | null) => void;
  resolveRoleLabel: (role?: string | null) => string;
  formatTime: (dateStr?: string) => string;
}) {
  return (
    <div
      className={`w-full lg:w-80 border-r border-gray-200 flex-col ${
        mobileView === "list" ? "flex" : "hidden"
      } lg:flex`}
    >
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Conversations</h2>
          <p className="text-xs text-gray-500">{crmRoleLabel}</p>
        </div>
        {!isAdvisor && (
          <button
            onClick={onStartConversation}
            disabled={isCreatingConversation}
            className={`text-sm px-3 py-1 rounded-md ${
              isCreatingConversation
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isCreatingConversation ? "Starting..." : "New"}
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoadingConversations ? (
          <div className="divide-y divide-gray-100">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="px-4 py-3 animate-pulse">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                    <div className="h-4 w-14 bg-gray-100 rounded" />
                  </div>
                  <div className="h-3 w-12 bg-gray-100 rounded" />
                </div>
                <div className="h-3 w-48 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">No conversations yet</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {conversations.map((conv) => {
              const hasUnread = (conv.unread_count ?? 0) > 0;
              const isSelected = selectedConversationId === conv.id;

              return (
                <li key={conv.id}>
                  <button
                    onClick={() => onSelectConversation(conv.id)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                      isSelected ? "bg-blue-50 border-l-2 border-blue-600" : ""
                    } ${hasUnread && !isSelected ? "bg-blue-50/50" : ""}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span
                          className={`text-sm truncate ${
                            hasUnread
                              ? "font-semibold text-gray-900"
                              : "font-medium text-gray-800"
                          }`}
                        >
                          {conv.counterpart_name || conv.subject || "Support Chat"}
                        </span>
                        {conv.counterpart_role && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded flex-shrink-0">
                            {resolveRoleLabel(conv.counterpart_role)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span className="text-[10px] text-gray-400">
                          {formatTime(conv.updated_at)}
                        </span>
                        {hasUnread && (
                          <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-blue-600 text-white rounded-full">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                    <p
                      className={`text-xs truncate ${
                        hasUnread ? "text-gray-700 font-medium" : "text-gray-500"
                      }`}
                    >
                      {conv.last_message || "No messages yet"}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

