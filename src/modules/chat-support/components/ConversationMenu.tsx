import React from "react";
import { BellOffIcon, FlagIcon, TrashIcon, VolumeXIcon } from "lucide-react";

export function ConversationMenu({
  isOpen,
  hasSelection,
  menuRef,
  isMuted,
  onToggleMuteNotifications,
  onOpenReportModal,
  crmUserRole,
  showConfirmClear,
  onClearChat,
  onCancelClear,
}: {
  isOpen: boolean;
  hasSelection: boolean;
  menuRef: React.RefObject<HTMLDivElement>;
  isMuted: boolean;
  onToggleMuteNotifications: () => void;
  onOpenReportModal: () => void;
  crmUserRole: string | undefined;
  showConfirmClear: boolean;
  onClearChat: () => void;
  onCancelClear: () => void;
}) {
  if (!isOpen || !hasSelection) return null;

  return (
    <div
      ref={menuRef}
      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200"
    >
      {/* Mute Notifications */}
      {/* <button
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        onClick={onToggleMuteNotifications}
      >
        {isMuted ? (
          <>
            <BellOffIcon size={16} className="mr-2 text-gray-500" />
            Unmute Notifications
          </>
        ) : (
          <>
            <VolumeXIcon size={16} className="mr-2 text-gray-500" />
            Mute Notifications
          </>
        )}
      </button> */}

      {/* Report option */}
      {/* <button
        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
        onClick={onOpenReportModal}
      >
        <FlagIcon size={16} className="mr-2" />
        Report
      </button> */}

      {/* <div className="border-t border-gray-100 my-1"></div> */}

      {/* Clear Chat - only visible for admin role */}
      {crmUserRole === "admin" &&
        (!showConfirmClear ? (
          <button
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            onClick={onClearChat}
          >
            <TrashIcon size={16} className="mr-2" />
            Clear Chat
          </button>
        ) : (
          <div className="px-4 py-2 text-sm">
            <p className="text-gray-700 mb-2">Clear this conversation?</p>
            <div className="flex space-x-2">
              <button
                className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                onClick={onClearChat}
              >
                Clear
              </button>
              <button
                className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                onClick={onCancelClear}
              >
                Cancel
              </button>
            </div>
          </div>
        ))}
    </div>
  );
}
