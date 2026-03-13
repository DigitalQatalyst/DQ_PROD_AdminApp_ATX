import { useEffect, useState } from "react";
import type { ConversationSummary } from "../services/ChatSupportService";
import type { Message } from "../types";
import { ConnectionStatus } from "../types";
import { chatService } from "../services/ChatService";

export function useChatSubscriptions(args: {
  userRole: string | undefined;
  accountId: string | null | undefined;
  userDep?: unknown;
}) {
  const { userRole, accountId, userDep } = args;

  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    ConnectionStatus.IDLE
  );
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [showEmptyState, setShowEmptyState] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);

  // Initialize messages from service and subscribe to updates
  useEffect(() => {
    let isCancelled = false;

    const loadMessages = async () => {
      try {
        // Conversations/messages are tied to the authenticated Supabase user.
        // Role and accountId are optional enrichment and must never block rendering.
        if (!isCancelled) setIsLoadingConversations(true);

        // If the service has an async initializer, use it
        if ("initialize" in chatService && typeof chatService.initialize === "function") {
          await chatService.initialize(userRole, accountId ?? null);
        }

        const initialMessages = chatService.getMessages();
        if (!isCancelled) setMessages(initialMessages);

        const initialConversations = chatService.getConversations();
        if (!isCancelled) setConversations(initialConversations);

        // For demo purposes, show empty state if configured
        if (!isCancelled) setShowEmptyState(initialMessages.length === 0);
      } catch (err: any) {
        console.error("ChatInterface load error:", err);
        if (!isCancelled) setConnectionError(err.message || "Failed to load chat");
      } finally {
        // Never keep the UI stuck in loading, even if role/accountId are missing
        // or initialization fails for any reason.
        if (!isCancelled) setIsLoadingConversations(false);
      }
    };

    loadMessages();

    // Subscribe to message updates
    const unsubscribeMessages = chatService.subscribeToMessages((updatedMessages) => {
      setMessages(updatedMessages);
      if (updatedMessages.length > 0) {
        setShowEmptyState(false);
      }
    });
    const unsubscribeConversations = chatService.subscribeToConversations(
      (updatedConversations) => {
        setConversations(updatedConversations);
        // Don't set loading to false here - it's handled after initialize()
      }
    );
    // Subscribe to typing status updates
    const unsubscribeTyping = chatService.subscribeToTypingStatus((typingStatus) => {
      setIsTyping(typingStatus);
    });
    // Subscribe to connection status updates
    const unsubscribeConnection = chatService.subscribeToConnectionStatus((status) => {
      setConnectionStatus(status);
      // If status is connected, clear error
      if (status === ConnectionStatus.CONNECTED) {
        setConnectionError(null);
      } else if (status === ConnectionStatus.ERROR) {
        const lastErr = chatService.getLastError();
        if (lastErr) setConnectionError(lastErr);
      }
    });
    // Subscribe to presence updates
    const unsubscribePresence = chatService.subscribeToPresenceChanges((users) => {
      setOnlineUsers(users);
    });

    // Cleanup subscriptions when component unmounts
    return () => {
      isCancelled = true;
      unsubscribeMessages();
      unsubscribeConversations();
      unsubscribeTyping();
      unsubscribeConnection();
      unsubscribePresence();
      chatService.cleanup();
    };
  }, [userRole, accountId, userDep]);

  return {
    messages,
    setMessages,
    conversations,
    setConversations,
    isTyping,
    connectionStatus,
    onlineUsers,
    showEmptyState,
    setShowEmptyState,
    connectionError,
    isLoadingConversations,
  };
}

