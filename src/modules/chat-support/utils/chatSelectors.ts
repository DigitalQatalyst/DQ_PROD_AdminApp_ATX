import type {
  AdvisorUser,
  CustomerUser,
  ConversationSummary,
} from "../services/ChatSupportService";

export function findConversationById(
  conversations: ConversationSummary[],
  selectedConversationId: string | null
): ConversationSummary | undefined {
  if (!selectedConversationId) return undefined;
  return conversations.find((c) => c.id === selectedConversationId);
}

export function buildHeaderInfo(args: {
  selectedAdvisor: AdvisorUser | null;
  selectedCustomer: CustomerUser | null;
  selectedConversation: ConversationSummary | undefined;
  isAdvisor: boolean;
  isPartner: boolean;
  resolveRoleLabel: (role?: string | null) => string;
}): {
  headerDisplayName: string;
  headerDisplayRole: string;
  headerInitial: string;
} {
  const {
    selectedAdvisor,
    selectedCustomer,
    selectedConversation,
    isAdvisor,
    isPartner,
    resolveRoleLabel,
  } = args;

  // Determine display name based on who is selected
  let headerDisplayName: string;
  let headerDisplayRole: string;

  if (selectedCustomer) {
    // Partner selected a customer
    headerDisplayName =
      selectedCustomer.username ||
      selectedCustomer.email ||
      "Customer";
    headerDisplayRole = "Customer";
  } else if (selectedAdvisor) {
    // User selected an advisor
    headerDisplayName =
      selectedAdvisor.username ||
      selectedAdvisor.email ||
      "Advisor";
    headerDisplayRole = "Advisor";
  } else if (selectedConversation) {
    // Existing conversation - show counterpart info
    headerDisplayName = selectedConversation.counterpart_name || "Support Team";
    headerDisplayRole = isAdvisor
      ? resolveRoleLabel(selectedConversation.counterpart_role)
      : isPartner
        ? "Customer"
        : "Advisor";
  } else {
    // Fallback
    headerDisplayName = "Support Team";
    headerDisplayRole = "Support";
  }

  const headerInitial =
    headerDisplayName?.[0]?.toUpperCase() ||
    headerDisplayRole?.[0]?.toUpperCase() ||
    "S";

  return { headerDisplayName, headerDisplayRole, headerInitial };
}
