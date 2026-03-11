import React from "react";
import { ArrowLeftIcon, MoreVerticalIcon, SearchIcon } from "lucide-react";
import { ConnectionStatus } from "../types";
import { ConnectionStatusIndicator } from "./ConnectionStatusIndicator";
import { ConversationMenu } from "./ConversationMenu";
import type {
  AdvisorUser,
  ConversationSummary,
} from "../services/ChatSupportService";

export function ConversationHeader({
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
}: {
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
}) {
  if (!hasSelection) return null;

  return (
    <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
      <div className="flex gap-3 items-center">
        {/* Back button for mobile */}
        <button
          onClick={onBack}
          className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Back to conversations"
        >
          <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
        </button>

        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full overflow-hidden mr-3 relative bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">
            {selectedAdvisor?.avatar_url ? (
              <img
                src={selectedAdvisor.avatar_url}
                alt={headerDisplayName || "Advisor"}
                className="w-full h-full object-cover"
              />
            ) : (
              headerInitial
            )}
            {connectionStatus === ConnectionStatus.CONNECTED &&
              isCounterpartOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white transform translate-x-1/3 translate-y-1/3 z-10"></div>
              )}
            {connectionStatus === ConnectionStatus.CONNECTED &&
              !isCounterpartOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-gray-400 rounded-full border-2 border-white transform translate-x-1/3 translate-y-1/3 z-10"></div>
              )}
            {connectionStatus === ConnectionStatus.ERROR && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white transform translate-x-1/3 translate-y-1/3 z-10"></div>
            )}
          </div>
          <div>
            <h2 className="text-base font-medium text-gray-800">
              {headerDisplayName}
            </h2>
            <div className="flex items-center">
              <span className="text-xs text-gray-500 mr-2">
                {headerDisplayRole}
              </span>
              {/* <ConnectionStatusIndicator
                connectionStatus={connectionStatus}
                onlineUsersCount={onlineUsersCount}
                onReconnect={onReconnect}
              /> */}
            </div>
          </div>
        </div>
      </div>
      <div className="flex space-x-3">
        <button
          className="text-gray-400 hover:text-gray-600"
          onClick={onSearchClick}
          disabled={!hasSelection}
        >
          <SearchIcon size={20} />
        </button>
        <div className="relative">
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={onMenuClick}
            disabled={!hasSelection}
          >
            <MoreVerticalIcon size={20} />
          </button>

          {/* Dropdown Menu */}
          <ConversationMenu
            isOpen={isMenuOpen}
            hasSelection={hasSelection}
            menuRef={menuRef}
            isMuted={isMuted}
            onToggleMuteNotifications={onToggleMuteNotifications}
            onOpenReportModal={onOpenReportModal}
            crmUserRole={crmUserRole}
            showConfirmClear={showConfirmClear}
            onClearChat={onClearChat}
            onCancelClear={onCancelClear}
          />
        </div>
      </div>
    </div>
  );
}
