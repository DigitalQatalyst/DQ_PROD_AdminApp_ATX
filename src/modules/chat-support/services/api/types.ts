export interface SupportConversation {
    id: string;
    user_id: string;
    subject: string | null;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    created_at: string;
    updated_at: string;
    last_message?: string;
    unread_count?: number;
    metadata?: {
        organizationId?: string;
        [key: string]: any;
    };
}

export interface ConversationSummary {
    id: string;
    subject: string | null;
    updated_at: string;
    status: 'open' | 'pending' | 'closed';
    user_id: string;
    last_message?: string | null;
    unread_count?: number;
    advisor_id?: string | null;
    counterpart_id?: string | null;
    counterpart_name?: string | null;
    counterpart_role?: string | null;
    metadata?: { organizationId?: string; advisorConversation?: boolean } | null;
}

export interface AdvisorUser {
    id: string;
    username: string | null;
    avatar_url: string | null;
    email?: string | null;
    azureId?: string | null;
}

export interface CustomerUser {
    id: string;
    accountId?: string;
    username: string | null;
    name?: string | null;
    avatar_url: string | null;
    email?: string | null;
    azureId?: string | null;
}

export interface SupportMessage {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    type: 'text' | 'image' | 'file' | 'voice' | 'system';
    attachments?: any;
    is_read: boolean;
    created_at: string;
    sender_details?: {
        username: string | null;
        avatar_url: string | null;
    };
}
