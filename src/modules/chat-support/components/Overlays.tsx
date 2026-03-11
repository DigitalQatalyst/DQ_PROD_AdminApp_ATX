import React from "react";
import {
  AlertCircleIcon,
  CheckCircleIcon,
  CloudOffIcon,
  UndoIcon,
} from "lucide-react";
import { ConnectionStatus } from "../types";
import type { Message } from "../types";

export function ConnectionErrorBanner({
  connectionStatus,
  onReconnect,
}: {
  connectionStatus: ConnectionStatus;
  onReconnect: () => void;
}) {
  if (connectionStatus !== ConnectionStatus.ERROR) return null;

  return (
    <div className="bg-red-50 px-4 py-2 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center text-red-600">
        <AlertCircleIcon size={16} className="mr-2" />
        <span className="text-sm">
          Connection lost. Messages may not be delivered.
        </span>
      </div>
      <button
        className="text-sm font-medium text-red-600 hover:text-red-800"
        onClick={onReconnect}
      >
        Reconnect
      </button>
    </div>
  );
}

export function LoadingOverlay({
  connectionStatus,
  hasSelection,
  showEmptyState,
  messagesLength,
}: {
  connectionStatus: ConnectionStatus;
  hasSelection: boolean;
  showEmptyState: boolean;
  messagesLength: number;
}) {
  const shouldShow =
    (connectionStatus === ConnectionStatus.IDLE ||
      connectionStatus === ConnectionStatus.CONNECTING) &&
    hasSelection &&
    !showEmptyState &&
    messagesLength === 0;

  if (!shouldShow) return null;

  return (
    <div className="absolute inset-0 bg-white z-20 flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-500">Connecting to support...</p>
    </div>
  );
}

export function UndoDeleteToast({
  deletedMessage,
  onUndo,
}: {
  deletedMessage:
    | { message: Message; deleteForEveryone: boolean; timeoutId: NodeJS.Timeout | null }
    | null;
  onUndo: () => void;
}) {
  if (!deletedMessage) return null;

  return (
    <div className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between animate-fade-in flex-shrink-0">
      <span className="text-sm">Message deleted</span>
      <button
        onClick={onUndo}
        className="flex items-center text-sm font-medium text-blue-400 hover:text-blue-300"
      >
        <UndoIcon size={16} className="mr-1" />
        Undo
      </button>
    </div>
  );
}

export function CopyToast({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 bg-green-100 border border-green-200 text-green-700 px-4 py-2 rounded-md shadow-md flex items-center z-50">
      <CheckCircleIcon size={16} className="mr-2" />
      <span>Message copied to clipboard</span>
    </div>
  );
}

export function OfflineOverlay({
  isOffline,
  connectionError,
  onReconnect,
}: {
  isOffline: boolean;
  connectionError: string | null;
  onReconnect: () => void;
}) {
  if (!isOffline) return null;

  return (
    <div className="absolute inset-0 bg-gray-900 bg-opacity-50 z-30 flex flex-col items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 text-center shadow-lg">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500">
            <CloudOffIcon size={32} />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          You're offline
        </h3>
        <p className="text-gray-600 mb-4">
          Check your internet connection and try again. Your messages will be
          sent when you're back online.
        </p>
        {connectionError && (
          <p className="text-red-500 text-sm mb-4 bg-red-50 p-2 rounded">
            Error Detail: {connectionError}
          </p>
        )}
        <button
          onClick={onReconnect}
          className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

