export enum MessageStatus {
  SENDING = "sending",
  SENT = "sent",
  DELIVERED = "delivered",
  READ = "read",
  ERROR = "error",
}

export enum ConnectionStatus {
  IDLE = "idle",
  CONNECTING = "connecting",
  CONNECTED = "connected",
  ERROR = "error",
  CREATING = "creating",
}

export interface FileAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
}

export interface VoiceMessage {
  duration: number; // Duration in seconds
  audioUrl?: string; // URL to the audio file
  isPlaying?: boolean;
  progress?: number; // Progress percentage (0-100)
}

export interface Message {
  id: string;
  content: string;
  sender: "me" | "them";
  timestamp: Date;
  status: MessageStatus;
  attachment?: FileAttachment;
  avatar?: string;
  name?: string;
  usertype?: "sender" | "receiver"; // Added for compatibility with requested structure
  replyTo?: string; // ID of the message being replied to
  voiceMessage?: VoiceMessage; // Voice message data
  isEdited?: boolean; // Flag to indicate if the message has been edited
  isDeletedForMe?: boolean; // Flag to indicate if the message has been deleted for the current user
}

export interface ReplyingTo {
  messageId: string;
  content: string;
  sender: "me" | "them";
  name?: string;
}

// File upload restrictions
export const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "application/zip",
  "application/x-rar-compressed",
] as const;

export const MAX_FILE_SIZE = 1024;
export const MAX_RECORDING_TIME = 120; // 2 minutes in seconds

