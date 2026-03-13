import { useState, useEffect } from "react";
import type { CustomerUser } from "../services/ChatSupportService";
import { ConnectionStatus } from "../types";
import { chatService } from "../services/ChatService";
import { syncCustomerToAuthUsers } from "../services/api/customerService";
import { ReportModal } from "../components/ReportModal";
import { useAuth } from "../../../context/AuthContext";
import { getRoleLabel, isAdvisorSegment } from "../utils/roleMapper";
import { useChatSubscriptions } from "../hooks/useChatSubscriptions";
import { ConversationList } from "../components/ConversationList";
import { ChatWindow } from "../components/ChatWindow";
import { CustomerPickerModal } from "../components/CustomerPickerModal";
import {
  WifiOff,
  RefreshCw,
  HomeIcon,
  ChevronRightIcon,
  Plus,
} from "lucide-react";
import Button from "../../../components/ui/ButtonComponent";
import { Link } from "react-router-dom";

// Helper: Map ConversationSummary to UI Conversation format
function mapConversationToUIFormat(conv: any) {
  // Prioritize counterpart name over subject
  const recipientName = conv.counterpart_name || conv.subject || "Customer";

  return {
    id: conv.id,
    type: "direct" as const,
    community_id: null,
    created_at: conv.updated_at || new Date().toISOString(),
    name: recipientName,
    other_user: {
      id: conv.counterpart_id || "system",
      username: recipientName,
      avatar_url: null,
    },
    last_message: conv.last_message
      ? {
          content:
            typeof conv.last_message === "string"
              ? conv.last_message
              : (conv.last_message as any).content || "Message",
          created_at: conv.updated_at,
          sender_id:
            typeof conv.last_message === "object"
              ? (conv.last_message as any).sender_id
              : "",
        }
      : undefined,
    unread_count: conv.unread_count || 0,
    participant_count: 2,
  };
}

// Helper: Map Message to UI Message format
function mapMessageToUIFormat(m: any) {
  // Messages from ChatService have a different structure
  // They use 'sender' field with "me"/"them" instead of sender_id
  const isOwnMessage = m.sender === "me" || m.usertype === "sender";

  return {
    id: m.id,
    conversation_id: m.conversation_id || "",
    sender_id: isOwnMessage ? "current-user" : "other-user", // Dummy IDs for comparison
    content: m.content,
    created_at:
      m.timestamp?.toISOString() || m.created_at || new Date().toISOString(),
    is_read: m.status === "read",
    sender: {
      id: isOwnMessage ? "current-user" : "other-user",
      username: m.name || "User",
      avatar_url: m.avatar || null,
    },
  };
}

export function ChatInterface() {
  const [customers, setCustomers] = useState<CustomerUser[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [isCustomerPickerOpen, setIsCustomerPickerOpen] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isOnline] = useState(navigator.onLine);

  // Get user context from main AuthContext
  const { user, role, userSegment } = useAuth();

  // Use organization_id from user object
  const accountId = user?.organization_id ?? user?.id ?? null;

  const { messages, conversations, connectionStatus, isLoadingConversations } =
    useChatSubscriptions({
      userRole: role,
      accountId,
      userDep: user,
    });

  // Load customers for selection
  useEffect(() => {
    const loadCustomers = async () => {
      console.log("[ChatInterface] Loading customers...");
      const customerList = await chatService.getCustomers();
      console.log("[ChatInterface] Loaded customers:", customerList.length);
      setCustomers(customerList);
    };
    loadCustomers();
  }, []);

  const handleSelectConversation = async (conversationId: string | null) => {
    if (selectedConversationId === conversationId) return;
    setSelectedConversationId(conversationId);

    if (conversationId) {
      await chatService.selectConversation(conversationId);
    } else {
      await chatService.selectConversation(null);
    }
  };

  // Handler for partners starting conversation with a customer
  const handleStartConversationWithCustomer = async (
    customer: CustomerUser | null,
  ) => {
    if (!accountId) {
      alert("Organization is not loaded yet. Please try again.");
      return;
    }
    try {
      setIsCreatingConversation(true);

      // Sync customer to auth_users table before creating conversation
      if (customer) {
        await syncCustomerToAuthUsers(customer);
      }

      const newId = await chatService.startConversationWithCustomer(customer);
      setSelectedConversationId(newId);
      setIsCustomerPickerOpen(false);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      console.error(
        "[ChatInterface] Failed to create conversation with customer",
        err,
      );
      alert("Could not start the conversation. Please try again.");
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const startConversation = () => {
    const isAdvisor = isAdvisorSegment(userSegment);

    if (isAdvisor) {
      alert("Advisors can only respond to existing conversations.");
      return;
    }

    setIsCustomerPickerOpen(true);
  };

  const handleSendMessage = async (content: string, attachment?: any) => {
    if (!selectedConversationId || !user?.id) return;

    try {
      await chatService.sendMessage(content, attachment);
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  const handleReconnect = () => {
    chatService.reconnect();
    setRefreshTrigger((prev) => prev + 1);
  };

  // Determine role and status
  const isAdvisor = isAdvisorSegment(userSegment);
  const isOffline = connectionStatus === ConnectionStatus.ERROR;
  const effectiveUserRole = role || userSegment;
  const crmRoleLabel = effectiveUserRole
    ? getRoleLabel(effectiveUserRole as any)
    : "Loading...";

  // Get the selected conversation info for the header
  const selectedConversation = conversations?.find(
    (c) => c.id === selectedConversationId,
  );

  // Map conversations to UI format
  const uiConversations = conversations?.map(mapConversationToUIFormat) || [];
  const uiMessages = messages?.map(mapMessageToUIFormat) || [];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header Section */}
      <div className="w-full px-2 sm:px-4 lg:px-6 py-3 sm:py-6 flex-shrink-0">
        {/* Breadcrumbs */}
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <Link
                to="/"
                className="text-gray-600 hover:text-gray-900 inline-flex items-center"
              >
                <HomeIcon size={16} className="mr-1" />
                <span>Home</span>
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-gray-900 inline-flex items-center"
              >
                <ChevronRightIcon size={16} className="mr-1" />
                <span>Dashboard</span>
              </Link>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon size={16} className="text-gray-400" />
                <span className="ml-1 text-gray-500 md:ml-2">Chat Support</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              Chat Support
            </h1>
            <p className="text-xs sm:text-sm text-gray-700 mt-1">
              {crmRoleLabel}
            </p>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto">
            {!isAdvisor && (
              <Button
                onClick={startConversation}
                className="gap-2 flex-1 sm:flex-initial"
                variant="outline"
                size="sm"
                disabled={isCreatingConversation}
              >
                <Plus className="h-4 w-4" />
                {isCreatingConversation ? "Starting..." : "New Chat"}
              </Button>
            )}
            <Button
              onClick={handleReconnect}
              className="gap-2 flex-1 sm:flex-initial"
              variant="outline"
              size="sm"
              title="Reconnect to chat"
              disabled={isLoadingConversations}
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoadingConversations ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        {isOffline && (
          <div className="mb-3 sm:mb-4 rounded-lg border border-red-200 bg-red-50 p-3 sm:p-4 flex items-center gap-2 text-red-700">
            <WifiOff className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <p className="text-xs sm:text-sm font-medium">
              You are currently offline. Messages will be sent when connection
              is restored.
            </p>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 px-2 sm:px-4 lg:px-6 pb-3 sm:pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] h-full max-h-full border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
          {/* Desktop: Conversation List */}
          <div className="border-r hidden lg:block h-full overflow-hidden">
            <ConversationList
              selectedConversationId={selectedConversationId}
              onSelectConversation={handleSelectConversation}
              refreshTrigger={refreshTrigger}
              conversations={uiConversations}
              isLoading={isLoadingConversations}
            />
          </div>

          {/* Mobile: Show conversation list when no conversation selected */}
          <div className="lg:hidden flex flex-col h-full overflow-hidden">
            {!selectedConversationId ? (
              <ConversationList
                selectedConversationId={selectedConversationId}
                onSelectConversation={handleSelectConversation}
                refreshTrigger={refreshTrigger}
                conversations={uiConversations}
                isLoading={isLoadingConversations}
              />
            ) : (
              <ChatWindow
                conversationId={selectedConversationId}
                isOnline={isOnline}
                onBack={() => handleSelectConversation(null)}
                refreshTrigger={refreshTrigger}
                messages={uiMessages}
                isLoading={false}
                onSendMessage={handleSendMessage}
                initialConversationInfo={selectedConversation}
              />
            )}
          </div>

          {/* Desktop: Show chat window */}
          <div className="hidden lg:block h-full overflow-hidden">
            {selectedConversationId ? (
              <ChatWindow
                conversationId={selectedConversationId}
                isOnline={isOnline}
                refreshTrigger={refreshTrigger}
                messages={uiMessages}
                isLoading={false}
                onSendMessage={handleSendMessage}
                initialConversationInfo={selectedConversation}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 sm:p-8">
                <div className="rounded-full bg-gray-100 p-4 sm:p-6 mb-3 sm:mb-4">
                  <Plus className="h-8 w-8 sm:h-12 sm:w-12 text-gray-500" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  No conversation selected
                </h3>
                <p className="text-xs sm:text-sm text-gray-700 mb-4 sm:mb-6 max-w-sm">
                  Select a conversation from the list to start chatting
                  {!isAdvisor && " or create a new conversation"}.
                </p>
                {!isAdvisor && (
                  <Button
                    onClick={startConversation}
                    disabled={isCreatingConversation}
                  >
                    {isCreatingConversation
                      ? "Starting..."
                      : "Start New Conversation"}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CustomerPickerModal
        isOpen={isCustomerPickerOpen}
        customers={customers}
        isCreatingConversation={isCreatingConversation}
        onClose={() => setIsCustomerPickerOpen(false)}
        onStartConversation={handleStartConversationWithCustomer}
      />

      <ReportModal isOpen={false} onClose={() => {}} />
    </div>
  );
}
