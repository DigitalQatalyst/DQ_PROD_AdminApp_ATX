import { supabase, getCurrentUserId } from '../../../../lib/client';
import { SupportMessage } from './types';

/**
 * Get messages for a conversation
 * Uses admin schema (default from client.ts)
 */
export const getMessages = async (conversationId: string) => {
    // @ts-ignore - support_messages not in generated types
    const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

    if (error) throw error;

    return data as SupportMessage[];
};

/**
 * Mark messages as read for a conversation
 * Only marks messages from OTHER users as read (not own messages)
 */
export const markMessagesAsRead = async (conversationId: string): Promise<number> => {
    const userId = getCurrentUserId();
    if (!userId) return 0;

    // @ts-ignore - support_messages not in generated types
    const { data, error } = await supabase
        .from('support_messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .eq('is_read', false)
        .select('id');

    if (error) {
        console.error('[ChatSupportService] Failed to mark messages as read:', error);
        return 0;
    }

    return data?.length || 0;
};

/**
 * Send a message to a conversation
 */
export const sendMessage = async (
    conversationId: string,
    content: string,
    type: 'text' | 'image' | 'file' | 'voice' = 'text',
    attachments: any = null
) => {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('Not authenticated');

    // @ts-ignore - support_messages not in generated types
    const { data, error } = await supabase
        .from('support_messages')
        .insert({
            conversation_id: conversationId,
            sender_id: userId,
            content,
            type,
            attachments
        })
        .select()
        .single();

    if (error) throw error;

    // Update conversation timestamp
    // @ts-ignore - support_conversations not in generated types
    await supabase
        .from('support_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

    return data;
};
