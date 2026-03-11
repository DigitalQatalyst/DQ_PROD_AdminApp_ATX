import {
  Message,
  MessageStatus,
  ConnectionStatus,
  FileAttachment,
  VoiceMessage,
} from "../types";
import {
  ChatSupportService,
  SupportMessage,
  ConversationSummary,
  AdvisorUser,
  CustomerUser,
} from "./ChatSupportService";

// Define callback types
type MessageListener = (messages: Message[]) => void;
type TypingStatusListener = (isTyping: boolean) => void;
type ConnectionStatusListener = (status: ConnectionStatus) => void;
type PresenceListener = (onlineUsers: string[]) => void;

class ChatService {
  private messages: Message[] = [];
  private messageListeners: MessageListener[] = [];
  private typingStatusListeners: TypingStatusListener[] = [];
  private connectionStatusListeners: ConnectionStatusListener[] = [];
  private conversationListeners: Array<(convs: ConversationSummary[]) => void> =
    [];
  private presenceListeners: PresenceListener[] = [];

  // Backend State
  private conversations: ConversationSummary[] = [];
  private activeConversationId: string | null = null;
  private currentUserId: string | null = null;
  private userRole: string | undefined = undefined;
  private organizationId: string | null = null;
  private currentChatAdvisor: AdvisorUser | null = null;
  private currentChatCustomer: CustomerUser | null = null;
  private isInitialized = false;

  // Realtime State
  private messageSubscription: { unsubscribe: () => void } | null = null;
  private presenceSubscription:
    | { channel: any; unsubscribe: () => void }
    | null = null;
  private onlineUsers: string[] = [];

  // Legacy Mock State (preserved for fallback/demo)
  private isAdvisorTyping = false;
  private connectionStatus: ConnectionStatus = ConnectionStatus.IDLE;
  private automaticResponsesEnabled = false;

  constructor() {
    // Initial connection status
    this.connectionStatus = ConnectionStatus.IDLE;
  }

  /**
   * Initialize the service - authenticates and loads backend data
   * @param userRole - User's role from CRM (e.g., 'advisor', 'member')
   * @param organizationId - User's organization ID from CRM
   * @param retryCount - Number of retry attempts (internal use)
   */
  async initialize(
    userRole?: string,
    organizationId?: string | null,
    retryCount = 0
  ) {
    if (this.isInitialized) {
      return;
    }

    // Store user context for later use
    this.userRole = userRole;
    this.organizationId = organizationId ?? null;

    this.setConnectionStatus(ConnectionStatus.CONNECTING);
    const getCurrentUserId = (): string | null => {
      return localStorage.getItem('supabase_user_id');
    };
    try {
      // Use getCurrentUserId for RLS-based auth projects
      this.currentUserId = getCurrentUserId();

      if (!this.currentUserId) {
        if (retryCount < 5) {
          setTimeout(
            () => this.initialize(userRole, organizationId, retryCount + 1),
            1000
          );
          return;
        }
        this.lastError = "Authentication failed. User session not found.";
        this.setConnectionStatus(ConnectionStatus.ERROR);
        return;
      }

      // DISABLED: Realtime presence (causing connection issues)
      // this.subscribeToPresence();

      await this.refreshConversations();

      // Don't auto-select conversation to avoid marking messages as read automatically
      // User must explicitly select a conversation
      this.messages = [];
      this.activeConversationId = null;
      console.log("[ChatService] Initialized in empty state");
      this.setConnectionStatus(ConnectionStatus.CONNECTED);
      this.isInitialized = true;

      // Start polling for conversation list updates (unread counts)
      this.startConversationPolling();
    } catch (error: any) {
      console.error("[ChatService] Initialization failed:", error);
      this.lastError = error.message || "Unknown init error";
      this.setConnectionStatus(ConnectionStatus.ERROR);
    }
  }

  private pollingInterval: NodeJS.Timeout | null = null;
  private conversationPollingInterval: NodeJS.Timeout | null = null;

  /**
   * Subscribe to realtime messages for a conversation
   */
  /**
   * DISABLED: Realtime subscription causing connection issues
   * Using polling only for now
   */
  private subscribeToRealtimeMessages(_conversationId: string) {
    // Realtime is disabled - polling handles message updates
    console.log('[ChatService] Realtime disabled, using polling only');
  }

  /**
   * Subscribe to global presence channel
   */
  /**
   * DISABLED: Presence subscription causing connection issues
   */
  private subscribeToPresence() {
    // Presence is disabled - assume all users online
    console.log('[ChatService] Presence disabled');
  }

  /**
   * Check if a specific user is online
   */
  public isUserOnline(userId: string): boolean {
    return this.onlineUsers.includes(userId);
  }

  /**
   * Get list of online user IDs
   */
  public getOnlineUsers(): string[] {
    return [...this.onlineUsers];
  }

  /**
   * Subscribe to presence changes
   */
  public subscribeToPresenceChanges(listener: PresenceListener): () => void {
    this.presenceListeners.push(listener);
    // Send current state immediately
    listener([...this.onlineUsers]);
    return () => {
      this.presenceListeners = this.presenceListeners.filter(
        (l) => l !== listener
      );
    };
  }

  private notifyPresenceListeners(): void {
    this.presenceListeners.forEach((listener) => listener([...this.onlineUsers]));
  }

  private startPolling(conversationId: string) {
    // Polling is now a fallback - prefer realtime
    if (this.pollingInterval) clearInterval(this.pollingInterval);

    // Poll every 5 seconds as fallback until realtime is fixed
    this.pollingInterval = setInterval(async () => {
      try {
        const apiMsgs = await ChatSupportService.getMessages(conversationId);

        // Preserve any local optimistic messages that haven't been confirmed yet
        const optimisticMessages = this.messages.filter(
          (m) => m.id.startsWith("temp-") || m.status === MessageStatus.SENDING
        );

        // Map API messages
        const confirmedMessages = apiMsgs.map((m) =>
          this.mapToUIMessage(m as SupportMessage)
        );

        // Merge: Confirmed from DB + Optimistic from memory
        const mergedMessages = [...confirmedMessages];

        optimisticMessages.forEach((optMsg) => {
          const exists = confirmedMessages.some(
            (m) =>
              m.id === optMsg.id ||
              (m.content === optMsg.content &&
                m.sender === "me" &&
                Math.abs(m.timestamp.getTime() - optMsg.timestamp.getTime()) <
                5000)
          );
          if (!exists) {
            mergedMessages.push(optMsg);
          }
        });

        // specific sort by timestamp
        mergedMessages.sort(
          (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
        );

        const prevCount = this.messages.length;
        this.messages = mergedMessages;
        this.notifyMessageListeners();

        // If new messages arrived while viewing, mark them as read immediately if focused
        if (
          apiMsgs.length > prevCount &&
          this.activeConversationId === conversationId
        ) {
          const markedCount =
            await ChatSupportService.markMessagesAsRead(conversationId);
          if (markedCount > 0) {
            await this.refreshConversations();
          }
        }
      } catch (_err) {
        // Polling failed - will retry on next interval
      }
    }, 5000);
  }

  /**
   * Poll conversation list for unread count updates
   * This runs independently to catch notifications for non-active conversations
   */
  private startConversationPolling() {
    if (this.conversationPollingInterval)
      clearInterval(this.conversationPollingInterval);

    // Poll conversations every 5 seconds to match message polling for instant feel
    this.conversationPollingInterval = setInterval(async () => {
      try {
        await this.refreshConversations();
      } catch (_err) {
        // Polling failed - will retry on next interval
      }
    }, 5000);
  }

  public cleanup() {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
    if (this.conversationPollingInterval)
      clearInterval(this.conversationPollingInterval);
    // Unsubscribe realtime messages
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
      this.messageSubscription = null;
    }
    // Unsubscribe presence
    if (this.presenceSubscription) {
      this.presenceSubscription.unsubscribe();
      this.presenceSubscription = null;
    }
  }

  private mapToUIMessage(msg: SupportMessage): Message {
    return {
      id: msg.id,
      content: msg.content,
      sender: msg.sender_id === this.currentUserId ? "me" : "them",
      timestamp: new Date(msg.created_at),
      status: msg.is_read ? MessageStatus.READ : MessageStatus.SENT,
      name: msg.sender_details?.username || "Support Advisor",
      avatar: msg.sender_details?.avatar_url || undefined,
      usertype: msg.sender_id === this.currentUserId ? "sender" : "receiver",
      // TODO: parser attachments from JSONB if needed
    };
  }

  // --- Public API ---

  public getMessages(): Message[] {
    return [...this.messages];
  }

  public getConversations(): ConversationSummary[] {
    return [...this.conversations];
  }

  public getUserRole(): string | undefined {
    return this.userRole;
  }

  public async getAdvisors(orgId?: string | null) {
    return ChatSupportService.getAdvisors(orgId ?? this.organizationId);
  }

  public async getCustomers(orgId?: string | null) {
    return ChatSupportService.getCustomers(orgId ?? this.organizationId ?? '');
  }

  public getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  public getAutomaticResponsesEnabled(): boolean {
    return this.automaticResponsesEnabled;
  }

  public setAutomaticResponsesEnabled(enabled: boolean): void {
    this.automaticResponsesEnabled = enabled;
  }

  // Send a message
  public async sendMessage(
    content: string,
    attachment?: FileAttachment,
    voiceMessage?: VoiceMessage,
    replyToId?: string
  ): Promise<void> {
    // 1. Optimistic Update
    const tempId = "temp-" + Date.now();
    const newMessage: Message = {
      id: tempId,
      content,
      sender: "me",
      timestamp: new Date(),
      status: MessageStatus.SENDING,
      attachment,
      voiceMessage,
      replyTo: replyToId,
      usertype: "sender",
    };

    this.addMessage(newMessage);

    // 2. Network Request
    try {
      // Check if we need to resolve the conversation (New or Optimistic)
      if (
        !this.activeConversationId ||
        this.activeConversationId.startsWith("temp-")
      ) {
        if (this.userRole === "advisor") {
          throw new Error("Advisors cannot start new conversations");
        }

        console.log("[ChatService] resolving conversation via backend...");

        // Check if we're chatting with a customer (partner flow) or advisor (user flow)
        if (this.currentChatCustomer) {
          // Partner-to-Customer flow
          console.log("[ChatService] Target customer:", this.currentChatCustomer.id);

          // Customer already has a UUID from auth_users
          const customerUuid = this.currentChatCustomer.id;

          // Atomically Resolve (Get or Create) Conversation
          const conversation = await ChatSupportService.resolveConversation(
            customerUuid,
            this.organizationId
          );

          console.log("[ChatService] Resolved conversation with customer:", conversation.id);
          this.activeConversationId = conversation.id;
        } else {
          // User-to-Advisor flow (original behavior)
          let targetAdvisor = this.currentChatAdvisor;

          // If no advisor stored (e.g. legacy flow), try to find one
          if (!targetAdvisor) {
            const advisors = await this.getAdvisors(this.organizationId);
            targetAdvisor = advisors[0];
          }

          if (!targetAdvisor) {
            throw new Error("No target user selected. Please select a customer or advisor first.");
          }

          console.log("[ChatService] Target advisor:", targetAdvisor.id);

          // Resolve the local User UUID for the advisor (essential for DB FKs)
          const advisorUuid =
            await ChatSupportService.resolveAdvisorUserId(targetAdvisor);

          // Atomically Resolve (Get or Create) Conversation
          const conversation = await ChatSupportService.resolveConversation(
            advisorUuid,
            this.organizationId
          );

          console.log("[ChatService] Resolved conversation with advisor:", conversation.id);
          this.activeConversationId = conversation.id;
        }

        // Start polling/listening on this new ID
        // IMPORTANT: Do NOT load messages here, as it would wipe our optimistic message
        // because the DB is still empty (message hasn't been sent yet).
        this.subscribeToRealtimeMessages(this.activeConversationId);
        this.startPolling(this.activeConversationId);
      }

      let msgType: "text" | "image" | "file" | "voice" = "text";
      const attachmentsData = null;

      if (voiceMessage) msgType = "voice";
      else if (attachment) msgType = "file";

      // 4. Send the message to the resolved ID
      const sentMsg = await ChatSupportService.sendMessage(
        this.activeConversationId,
        content,
        msgType,
        attachmentsData
      );

      // 5. Confirm Success & Reclassify
      const realMsg = this.mapToUIMessage(sentMsg as unknown as SupportMessage);

      // Replace temp message with real one in UI
      this.messages = this.messages.map((m) => (m.id === tempId ? realMsg : m));
      this.notifyMessageListeners();
    } catch (error) {
      console.error("[ChatService] Send failed:", error);
      // Mark as error
      this.updateMessageStatus(tempId, MessageStatus.ERROR);
    }
  }

  public retryMessage(messageId: string): void {
    // Find message, retry send
    const msg = this.messages.find((m) => m.id === messageId);
    if (msg && msg.status === MessageStatus.ERROR) {
      this.sendMessage(msg.content);
    }
  }

  public reconnect(): void {
    this.initialize(this.userRole, this.organizationId);
  }

  public clearMessages(): void {
    this.messages = [];
    this.notifyMessageListeners();
  }

  public deleteMessage(messageId: string, _deleteForEveryone: boolean = false) {
    // Soft delete in arrays
    this.messages = this.messages.filter((m) => m.id !== messageId);
    this.notifyMessageListeners();
    // TODO: Backend delete
  }

  public editMessage(messageId: string, newContent: string) {
    const msg = this.messages.find((m) => m.id === messageId);
    if (msg) {
      msg.content = newContent;
      msg.isEdited = true;
      this.notifyMessageListeners();
      // TODO: Backend update
    }
  }

  // --- Subscriptions ---

  public subscribeToMessages(listener: MessageListener): () => void {
    this.messageListeners.push(listener);
    // Send current state immediately
    listener([...this.messages]);
    return () => {
      this.messageListeners = this.messageListeners.filter((l) => l !== listener);
    };
  }

  public subscribeToConversations(
    listener: (convs: ConversationSummary[]) => void
  ): () => void {
    this.conversationListeners.push(listener);
    listener([...this.conversations]);
    return () => {
      this.conversationListeners = this.conversationListeners.filter(
        (l) => l !== listener
      );
    };
  }

  public subscribeToTypingStatus(listener: TypingStatusListener): () => void {
    this.typingStatusListeners.push(listener);
    return () => {
      this.typingStatusListeners = this.typingStatusListeners.filter(
        (l) => l !== listener
      );
    };
  }

  public subscribeToConnectionStatus(
    listener: ConnectionStatusListener
  ): () => void {
    this.connectionStatusListeners.push(listener);
    listener(this.connectionStatus);
    return () => {
      this.connectionStatusListeners = this.connectionStatusListeners.filter(
        (l) => l !== listener
      );
    };
  }

  // --- Internals ---

  private addMessage(message: Message): void {
    this.messages.push(message);
    this.notifyMessageListeners();
  }

  private updateMessageStatus(id: string, status: MessageStatus): void {
    const msg = this.messages.find((m) => m.id === id);
    if (msg) {
      msg.status = status;
      this.notifyMessageListeners();
    }
  }

  private setConnectionStatus(status: ConnectionStatus): void {
    this.connectionStatus = status;
    this.notifyConnectionStatusListeners();
  }

  private notifyMessageListeners(): void {
    this.messageListeners.forEach((listener) => listener([...this.messages]));
  }

  private notifyConversationListeners(): void {
    this.conversationListeners.forEach((listener) =>
      listener([...this.conversations])
    );
  }

  private notifyConnectionStatusListeners(): void {
    this.connectionStatusListeners.forEach((listener) =>
      listener(this.connectionStatus)
    );
  }

  // --- Conversation helpers ---
  private async refreshConversations() {
    if (!this.currentUserId) return;
    const convs = await ChatSupportService.getConversations(
      this.userRole,
      this.organizationId
    );
    this.conversations = convs.map((c: any) => ({
      id: c.id,
      subject: c.subject,
      updated_at: c.updated_at,
      status: c.status,
      user_id: c.user_id,
      last_message: c.last_message,
      unread_count: c.unread_count,
      counterpart_id: c.counterpart_id,
      counterpart_name: c.counterpart_name,
      counterpart_role: c.counterpart_role,
      metadata: c.metadata,
    }));
    this.notifyConversationListeners();
  }

  private async loadMessagesForConversation(conversationId: string) {
    // Optimistic ID check - don't fetch from backend
    if (conversationId.startsWith("temp-")) {
      this.messages = [];
      this.notifyMessageListeners();
      return;
    }

    const apiMsgs = await ChatSupportService.getMessages(conversationId);
    this.messages = apiMsgs.map((m) => this.mapToUIMessage(m));
    this.notifyMessageListeners();
    // Subscribe to realtime messages (primary)
    this.subscribeToRealtimeMessages(conversationId);
    // Start polling as fallback
    this.startPolling(conversationId);
  }

  public async selectConversation(conversationId: string | null) {
    if (!conversationId) {
      this.activeConversationId = null;
      this.messages = [];
      this.notifyMessageListeners();
      if (this.pollingInterval) clearInterval(this.pollingInterval);
      if (this.messageSubscription) this.messageSubscription.unsubscribe();
      return;
    }

    const isSameConversation = this.activeConversationId === conversationId;
    this.activeConversationId = conversationId;

    if (!isSameConversation) {
      await this.loadMessagesForConversation(conversationId);
    }

    // Always mark as read and refresh (handles new messages arriving via polling)
    const markedCount = await ChatSupportService.markMessagesAsRead(conversationId);
    if (markedCount > 0) {
      await this.refreshConversations();
    }

    this.setConnectionStatus(ConnectionStatus.CONNECTED);
  }

  public async startConversation(advisor: AdvisorUser | null): Promise<string> {
    if (this.userRole === "advisor") {
      throw new Error("Advisors cannot start new conversations");
    }

    // Optimistic UI: Return active state immediately
    const tempId = `temp-conv-${Date.now()}`;

    // Set active ID to optimistic one
    this.activeConversationId = tempId;
    this.currentChatAdvisor = advisor || null;
    this.currentChatCustomer = null;
    this.messages = [];
    this.notifyMessageListeners();
    this.setConnectionStatus(ConnectionStatus.CONNECTED);

    console.log("[ChatService] Started optimistic conversation:", tempId);
    return tempId;
  }

  /**
   * Start a conversation with a customer (for partners)
   */
  public async startConversationWithCustomer(customer: CustomerUser | null): Promise<string> {
    // Optimistic UI: Return active state immediately
    const tempId = `temp-conv-${Date.now()}`;

    // Set active ID to optimistic one
    this.activeConversationId = tempId;
    this.currentChatCustomer = customer || null;
    this.currentChatAdvisor = null;
    this.messages = [];
    this.notifyMessageListeners();
    this.setConnectionStatus(ConnectionStatus.CONNECTED);

    console.log("[ChatService] Started optimistic conversation with customer:", tempId);
    return tempId;
  }

  // --- Error Handling ---
  private lastError: string | null = null;

  public getLastError(): string | null {
    return this.lastError;
  }

  // --- Demo / Compatibility Methods ---
  public restoreMessage(message: Message): void {
    this.messages.push(message);
    this.notifyMessageListeners();
  }

  public triggerManualResponse(_message?: string): void {
    // Demo/Legacy method - no-op
  }

  public startConversationLegacy(): void {
    // Demo/Legacy method - no-op
  }
}

// Export Singleton
export const chatService = new ChatService();

