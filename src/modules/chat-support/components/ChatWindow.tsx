import { useState, useEffect, useRef, useCallback } from "react";
import { MessageBubble } from "./MessageBubble";
import Button from "../../../components/ui/ButtonComponent";
import Skeleton from "../../../components/ui/SkeletonComponent";
import { ArrowLeft, Send } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  sender?: {
    id: string;
    username: string | null;
    avatar_url: string | null;
  };
}

export interface ChatWindowProps {
  readonly conversationId: string;
  readonly isOnline: boolean;
  readonly onBack?: () => void;
  readonly refreshTrigger?: number;
  readonly initialConversationInfo?: any;
  readonly messages?: Message[];
  readonly isLoading?: boolean;
  readonly onSendMessage?: (content: string, attachment?: any) => Promise<void>;
}

// Sub-component: Loading skeleton that simulates a chat conversation
function ChatLoadingSkeleton() {
  const messagePattern = [false, true, false, true, false];

  return (
    <div className="flex flex-col h-full">
      {/* Header skeleton */}
      <div className="border-b border-gray-200 p-4 flex items-center gap-3 h-[72px]">
        <Skeleton className="h-10 w-10 rounded-full bg-gray-200" />
        <Skeleton className="h-5 w-32 bg-gray-200" />
      </div>

      {/* Messages area skeleton */}
      <div className="flex-1 p-4 space-y-4 overflow-hidden">
        {messagePattern.map((isOwn, i) => (
          <div
            key={i}
            className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
            >
              <Skeleton
                className={`h-10 rounded-xl bg-gray-200 ${
                  isOwn ? "w-48" : i % 2 === 0 ? "w-56" : "w-40"
                }`}
              />
              <Skeleton className="h-3 w-16 mt-1 bg-gray-100" />
            </div>
          </div>
        ))}
      </div>

      {/* Input area skeleton */}
      <div className="p-4 border-t border-gray-200 flex items-center gap-2">
        <Skeleton className="h-10 flex-1 rounded-full bg-gray-200" />
        <Skeleton className="h-10 w-10 rounded-full bg-gray-200" />
      </div>
    </div>
  );
}

export function ChatWindow({
  conversationId,
  isOnline,
  onBack,
  refreshTrigger,
  initialConversationInfo,
  messages: externalMessages,
  isLoading: externalLoading,
  onSendMessage: externalSendMessage,
}: Readonly<ChatWindowProps>) {
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [conversationInfo, setConversationInfo] = useState<any>(
    initialConversationInfo || null,
  );
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const messages = externalMessages || [];
  const loading = externalLoading !== undefined ? externalLoading : false;
  // Use a constant ID for comparison since messages use dummy IDs
  const currentUserId = "current-user";

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    setConversationInfo(initialConversationInfo || null);
    setTimeout(scrollToBottom, 100);
  }, [conversationId, initialConversationInfo, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !isOnline || sending) return;

    if (externalSendMessage) {
      const messageContent = newMessage.trim();
      setNewMessage(""); // Clear immediately for optimistic UX
      setSending(true);
      try {
        await externalSendMessage(messageContent);
      } catch (e) {
        // Restore message on error so user can retry
        setNewMessage(messageContent);
      } finally {
        setSending(false);
      }
      return;
    }
  };

  const otherUser = conversationInfo?.other_user;
  const displayName =
    otherUser?.username ||
    conversationInfo?.counterpart_name ||
    conversationInfo?.name ||
    conversationInfo?.subject ||
    "Chat";

  // Button styling - explicit blue colors
  const sendButtonClass = `transition-all duration-200 flex-shrink-0  ${
    newMessage.trim() && isOnline && !sending
      ? "bg-blue-700 hover:bg-blue-800 text-black"
      : "bg-transparent text-gray-900"
  }`;

  const sendIconClass = `h-4 w-4 transition-transform duration-200 ${
    newMessage.trim() && isOnline && !sending ? "scale-110" : ""
  }`;

  if (loading) {
    return <ChatLoadingSkeleton />;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* Header - Clean and simple */}
      <div className="border-b border-gray-200 p-4 flex items-center gap-3 h-[72px] flex-shrink-0">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="lg:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold flex-shrink-0">
            {displayName.slice(0, 1).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate text-gray-900">
              {displayName}
            </h3>
            {/* 
            Activity status
            <p className="text-xs text-gray-500">
              {isOnline ? "Online" : "Offline"}
            </p> */}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 "
        ref={scrollAreaRef}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <p>No messages yet</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender_id === currentUserId;
            return (
              <MessageBubble
                key={message.id}
                message={message}
                isOwnMessage={isOwnMessage}
              />
            );
          })
        )}
      </div>

      {/* Input Area - Clean and simple */}
      <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            className="flex-1 p-2 border rounded"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={!isOnline || sending}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!newMessage.trim() || !isOnline || sending}
            className={sendButtonClass}
          >
            <Send className={sendIconClass} />
          </Button>
        </form>
      </div>
    </div>
  );
}
