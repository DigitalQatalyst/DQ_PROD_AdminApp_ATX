import React from "react";
import { LoaderIcon, WifiIcon, WifiOffIcon } from "lucide-react";
import { ConnectionStatus } from "../types";

export function ConnectionStatusIndicator({
  connectionStatus,
  onlineUsersCount,
  onReconnect,
}: {
  connectionStatus: ConnectionStatus;
  onlineUsersCount: number;
  onReconnect: () => void;
}) {
  switch (connectionStatus) {
    case ConnectionStatus.CONNECTING:
      return (
        <div className="flex items-center text-amber-500">
          <LoaderIcon size={14} className="animate-spin mr-1" />
          <span className="text-xs">Connecting...</span>
        </div>
      );
    case ConnectionStatus.CREATING:
      return (
        <div className="flex items-center text-blue-500">
          <LoaderIcon size={14} className="animate-spin mr-1" />
          <span className="text-xs">Creating...</span>
        </div>
      );
    case ConnectionStatus.CONNECTED:
      // Show presence status when connected
      if (onlineUsersCount > 1) {
        return (
          <div className="flex items-center text-green-500">
            <WifiIcon size={14} className="mr-1" />
            <span className="text-xs">Online</span>
          </div>
        );
      }
      return (
        <div className="flex items-center text-gray-500">
          <WifiIcon size={14} className="mr-1" />
          <span className="text-xs">Away</span>
        </div>
      );
    case ConnectionStatus.ERROR:
      return (
        <div
          className="flex items-center text-red-500 cursor-pointer"
          onClick={onReconnect}
        >
          <WifiOffIcon size={14} className="mr-1" />
          <span className="text-xs">Offline - Tap to reconnect</span>
        </div>
      );
    default:
      return (
        <div className="flex items-center text-gray-500">
          <span className="text-xs">Offline</span>
        </div>
      );
  }
}

