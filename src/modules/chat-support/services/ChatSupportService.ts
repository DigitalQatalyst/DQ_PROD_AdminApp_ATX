import {
    getConversations,
    resolveConversation,
    createConversation,
    createConversationWithMessage,
    addParticipant
} from './api/conversationService';
import { getAdvisors, resolveAdvisorUserId } from './api/advisorService';
import { getCustomers, resolveCustomerUserId } from './api/customerService';
import { getMessages, markMessagesAsRead, sendMessage } from './api/messageService';
import { subscribeToConversation, subscribeToPresence } from './api/realtimeService';

// Re-export types
export * from './api/types';

export const ChatSupportService = {
    getConversations,
    resolveConversation,
    createConversation: (
        subject: string,
        priority: 'normal' | 'high' | 'urgent' = 'normal',
        organizationId?: string | null,
        advisor?: { id?: string | null; email?: string | null; username?: string | null; azureId?: string | null }
    ) => createConversation(subject, priority, organizationId, advisor, resolveAdvisorUserId),
    createConversationWithMessage,
    resolveAdvisorUserId,
    getMessages,
    markMessagesAsRead,
    sendMessage,
    getAdvisors,
    getCustomers,
    resolveCustomerUserId,
    subscribeToConversation,
    subscribeToPresence,
    addParticipant
};
