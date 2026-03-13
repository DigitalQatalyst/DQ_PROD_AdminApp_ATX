import React from "react";
import type { AdvisorUser } from "../services/ChatSupportService";
import type { Message, ReplyingTo } from "../types";
import { ConnectionStatus } from "../types";
import { ChatInput } from "./ChatInput";
import { ConversationHeader } from "./ConversationHeader";
import { MessageArea } from "./MessageArea";
import {
  ConnectionErrorBanner,
  CopyToast,
  LoadingOverlay,
  OfflineOverlay,
  UndoDeleteToast,
} from "./Overlays";
import { SearchModal } from "./SearchModal";
import { CustomReportModal } from "./CustomReportModal";

export function ConversationPane({
  mobileView,
  hasSelection,
  onBack,
  selectedAdvisor,
  headerDisplayName,
  headerDisplayRole,
  headerInitial,
  connectionStatus,
  isCounterpartOnline,
  onlineUsersCount,
  onReconnect,
  onSearchClick,
  onMenuClick,
  isMenuOpen,
  menuRef,
  isMuted,
  onToggleMuteNotifications,
  onOpenReportModal,
  crmUserRole,
  showConfirmClear,
  onClearChat,
  onCancelClear,
  showEmptyState,
  messagesLength,
  deletedMessage,
  onUndoDelete,
  showCopyNotification,
  shouldShowSelectPrompt,
  isLoadingMessages,
  visibleMessages,
  onRetryMessage,
  onReply,
  getReplyMessage,
  onDeleteMessage,
  onEditMessage,
  onCopyMessage,
  isTyping,
  messagesEndRef,
  conversationsLength,
  isAdvisor,
  onStartConversation,
  onSendMessage,
  isInputDisabled,
  replyingTo,
  onCancelReply,
  isOffline,
  connectionError,
  isSearchOpen,
  searchModalRef,
  messages,
  searchQuery,
  setSearchQuery,
  searchResults,
  setSearchResults,
  onCloseSearch,
  showCustomReportModal,
  customReportModalRef,
  customReportReason,
  setCustomReportReason,
  onCancelCustomReport,
  onSubmitCustomReport,
}: {
  mobileView: "list" | "conversation";
  hasSelection: boolean;
  onBack: () => void;
  selectedAdvisor: AdvisorUser | null;
  headerDisplayName: string;
  headerDisplayRole: string;
  headerInitial: string;
  connectionStatus: ConnectionStatus;
  isCounterpartOnline: boolean;
  onlineUsersCount: number;
  onReconnect: () => void;
  onSearchClick: () => void;
  onMenuClick: () => void;
  isMenuOpen: boolean;
  menuRef: React.RefObject<HTMLDivElement>;
  isMuted: boolean;
  onToggleMuteNotifications: () => void;
  onOpenReportModal: () => void;
  crmUserRole: string | undefined;
  showConfirmClear: boolean;
  onClearChat: () => void;
  onCancelClear: () => void;
  showEmptyState: boolean;
  messagesLength: number;
  deletedMessage:
    | { message: Message; deleteForEveryone: boolean; timeoutId: NodeJS.Timeout | null }
    | null;
  onUndoDelete: () => void;
  showCopyNotification: boolean;
  shouldShowSelectPrompt: boolean;
  isLoadingMessages: boolean;
  visibleMessages: Message[];
  onRetryMessage: (messageId: string) => void;
  onReply: (messageId: string) => void;
  getReplyMessage: (messageId?: string) => Message | null;
  onDeleteMessage: (messageId: string, deleteForEveryone: boolean) => void;
  onEditMessage: (messageId: string, newContent: string) => void;
  onCopyMessage: (content: string) => void;
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  conversationsLength: number;
  isAdvisor: boolean;
  onStartConversation: () => void;
  onSendMessage: (
    content: string,
    attachment?: any,
    replyToId?: string,
    voiceMessage?: { duration: number; audioUrl?: string }
  ) => void;
  isInputDisabled: boolean;
  replyingTo: ReplyingTo | null;
  onCancelReply: () => void;
  isOffline: boolean;
  connectionError: string | null;
  isSearchOpen: boolean;
  searchModalRef: React.RefObject<HTMLDivElement>;
  messages: Message[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchResults: Message[];
  setSearchResults: (results: Message[]) => void;
  onCloseSearch: () => void;
  showCustomReportModal: boolean;
  customReportModalRef: React.RefObject<HTMLDivElement>;
  customReportReason: string;
  setCustomReportReason: (reason: string) => void;
  onCancelCustomReport: () => void;
  onSubmitCustomReport: () => void;
}) {
  return (
    <div
      className={`flex-1 flex-col relative ${
        mobileView === "conversation" ? "flex" : "hidden"
      } lg:flex`}
    >
      <ConversationHeader
        hasSelection={hasSelection}
        onBack={onBack}
        selectedAdvisor={selectedAdvisor}
        headerDisplayName={headerDisplayName}
        headerDisplayRole={headerDisplayRole}
        headerInitial={headerInitial}
        connectionStatus={connectionStatus}
        isCounterpartOnline={isCounterpartOnline}
        onlineUsersCount={onlineUsersCount}
        onReconnect={onReconnect}
        onSearchClick={onSearchClick}
        onMenuClick={onMenuClick}
        isMenuOpen={isMenuOpen}
        menuRef={menuRef}
        isMuted={isMuted}
        onToggleMuteNotifications={onToggleMuteNotifications}
        onOpenReportModal={onOpenReportModal}
        crmUserRole={crmUserRole}
        showConfirmClear={showConfirmClear}
        onClearChat={onClearChat}
        onCancelClear={onCancelClear}
      />

      <ConnectionErrorBanner
        connectionStatus={connectionStatus}
        onReconnect={onReconnect}
      />

      <LoadingOverlay
        connectionStatus={connectionStatus}
        hasSelection={hasSelection}
        showEmptyState={showEmptyState}
        messagesLength={messagesLength}
      />

      <UndoDeleteToast deletedMessage={deletedMessage} onUndo={onUndoDelete} />
      <CopyToast show={showCopyNotification} />

      <MessageArea
        shouldShowSelectPrompt={shouldShowSelectPrompt}
        showEmptyState={showEmptyState}
        isLoadingMessages={isLoadingMessages}
        visibleMessages={visibleMessages}
        onRetryMessage={onRetryMessage}
        onReply={onReply}
        getReplyMessage={getReplyMessage}
        onDeleteMessage={onDeleteMessage}
        onEditMessage={onEditMessage}
        onCopyMessage={onCopyMessage}
        isTyping={isTyping}
        hasSelection={hasSelection}
        messagesEndRef={messagesEndRef}
        conversationsLength={conversationsLength}
        isAdvisor={isAdvisor}
        onStartConversation={onStartConversation}
      />

      {hasSelection && (
        <div className="flex-shrink-0">
          <ChatInput
            onSendMessage={onSendMessage}
            isDisabled={isInputDisabled}
            replyingTo={replyingTo}
            onCancelReply={onCancelReply}
          />
        </div>
      )}

      <OfflineOverlay
        isOffline={isOffline}
        connectionError={connectionError}
        onReconnect={onReconnect}
      />

      <SearchModal
        isOpen={isSearchOpen}
        searchModalRef={searchModalRef}
        messages={messages}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchResults={searchResults}
        setSearchResults={setSearchResults}
        onClose={onCloseSearch}
      />

      <CustomReportModal
        isOpen={showCustomReportModal}
        customReportModalRef={customReportModalRef}
        customReportReason={customReportReason}
        setCustomReportReason={setCustomReportReason}
        onCancel={onCancelCustomReport}
        onSubmit={onSubmitCustomReport}
      />
    </div>
  );
}

