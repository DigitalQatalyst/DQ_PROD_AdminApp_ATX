import { supabase, getCurrentUserId } from '../../../../lib/client';
import { mapRoleValueToRole } from '../../utils/roleMapper';
import { SupportConversation, ConversationSummary, SupportMessage } from './types';

/**
 * Add a participant to a conversation
 */
export const addParticipant = async (
    conversationId: string,
    userId: string,
    role: 'user' | 'advisor' | 'bot' = 'user'
) => {
    try {
        // @ts-ignore - support_participants not in generated types
        const { error } = await supabase
            .from('support_participants')
            .insert({
                conversation_id: conversationId,
                user_id: userId,
                role
            });
        if (error) throw error;
    } catch (err) {
        console.error('[ChatSupportService] addParticipant failed', err);
    }
};

/**
 * Get all conversations for the current user
 */
export const getConversations = async (_userRole?: string, _organizationId?: string | null) => {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('Not authenticated');

    // Step 1: find conversation ids where current user is a participant
    // @ts-ignore - support_participants not in generated types
    const { data: membership, error: membershipError } = await supabase
        .from('support_participants')
        .select('conversation_id')
        .eq('user_id', userId);

    if (membershipError) {
        throw membershipError;
    }

    const convIds = (membership as { conversation_id: string }[] | null)?.map((m) => m.conversation_id) ?? [];
    if (convIds.length === 0) {
        return [];
    }

    // Step 2: fetch conversations with all participants info
    // @ts-ignore - support_conversations not in generated types
    const { data, error } = await supabase
        .from('support_conversations')
        .select(`
          *,
          participants:support_participants(
            role,
            user_id,
            auth_users:auth_users!support_participants_user_id_fkey(
              name,
              email,
              azure_oid
            )
          )
        `)
        .in('id', convIds)
        .order('updated_at', { ascending: false });

    if (error) {
        throw error;
    }

    const conversations = (data as unknown as any[]) ?? [];

    // Build summaries: last message + unread counts
    const enrichedConvIds = conversations.map((c) => c.id);
    if (enrichedConvIds.length === 0) return [];

    // @ts-ignore - support_messages not in generated types
    const { data: messages } = await supabase
        .from('support_messages')
        .select('conversation_id, content, is_read, sender_id, created_at')
        .in('conversation_id', enrichedConvIds)
        .order('created_at', { ascending: false });

    // Collect unique counterpart info (azure_oid + email) to fetch CRM roles
    const counterpartInfo: { externalId: string; email: string }[] = [];
    conversations.forEach((conv) => {
        const counterpart = (conv.participants as any[] | undefined)?.find(
            (p) => p.user_id !== userId
        );
        if (counterpart?.auth_users?.azure_oid && counterpart?.auth_users?.email) {
            const exists = counterpartInfo.some(c => c.externalId === counterpart.auth_users.azure_oid);
            if (!exists) {
                counterpartInfo.push({
                    externalId: counterpart.auth_users.azure_oid,
                    email: counterpart.auth_users.email,
                });
            }
        }
    });

    // Fetch CRM roles for all counterparts using organization-info endpoint
    const crmRoleMap: Record<string, string> = {};
    await Promise.all(
        counterpartInfo.map(async ({ externalId, email }) => {
            try {
                const resp = await fetch(
                    'https://kfrealexpressserver.vercel.app/api/v1/auth/organization-info',
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ azureid: externalId, useremail: email }),
                    }
                );
                if (resp.ok) {
                    const data = await resp.json();
                    const roleValue = data?.profile?.kf_accessroles ?? data?.organization?.kf_accessroles;
                    if (roleValue) {
                        const mappedRole = mapRoleValueToRole(roleValue);
                        if (mappedRole) {
                            crmRoleMap[externalId] = mappedRole;
                        }
                    }
                }
            } catch (_err) {
                // Ignore errors, will fallback to stored role
            }
        })
    );

    const summaries: Record<string, ConversationSummary> = {};
    conversations.forEach((conv) => {
        const counterpart = (conv.participants as any[] | undefined)?.find(
            (p) => p.user_id !== userId
        );
        const counterpartId = counterpart?.user_id || null;
        const counterpartName =
            counterpart?.auth_users?.name ||
            counterpart?.auth_users?.email ||
            null;
        const counterpartExternalId = counterpart?.auth_users?.azure_oid;
        // Use CRM role if fetched, otherwise fallback to stored role
        const counterpartRole =
            (counterpartExternalId && crmRoleMap[counterpartExternalId]) ||
            counterpart?.role ||
            null;

        summaries[conv.id] = {
            id: conv.id,
            subject: conv.subject,
            updated_at: conv.updated_at,
            status: conv.status || 'open',
            user_id: conv.user_id,
            last_message: null,
            unread_count: 0,
            advisor_id: undefined,
            counterpart_id: counterpartId,
            counterpart_name: counterpartName,
            counterpart_role: counterpartRole,
            metadata: conv.metadata || null,
        };
    });

    messages?.forEach((msg) => {
        const summary = summaries[msg.conversation_id];
        if (!summary) return;
        // first occurrence is the latest because of ordering
        if (!summary.last_message) {
            summary.last_message = msg.content;
        }
        if (!msg.is_read && msg.sender_id !== userId) {
            summary.unread_count = (summary.unread_count || 0) + 1;
        }
    });

    return conversations.map((conv) => ({
        ...conv,
        last_message: summaries[conv.id]?.last_message ?? conv.last_message,
        unread_count: summaries[conv.id]?.unread_count ?? conv.unread_count ?? 0,
        counterpart_id: summaries[conv.id]?.counterpart_id ?? null,
        counterpart_name: summaries[conv.id]?.counterpart_name ?? null,
        counterpart_role: summaries[conv.id]?.counterpart_role ?? null,
    }));
};

/**
 * Resolve or create a 1:1 conversation between current user and another user
 * Uses a deterministic key to ensure only one conversation exists between two users
 */
export const resolveConversation = async (targetUserId: string, organizationId?: string | null) => {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('Not authenticated');

    // 1. Generate Deterministic Key: dm:{min_uuid}:{max_uuid}
    const ids = [userId, targetUserId].sort((a, b) => a.localeCompare(b));
    const conversationKey = `dm:${ids[0]}:${ids[1]}`;

    console.log('[ChatSupport] Resolving conversation key:', conversationKey);

    // 2. Try to CREATE first (Optimistic)
    // @ts-ignore - support_conversations not in generated types
    const { data: newConv, error: insertError } = await supabase
        .from('support_conversations')
        .insert({
            user_id: userId,
            subject: 'Support Chat',
            status: 'open',
            priority: 'normal',
            conversation_key: conversationKey,
            metadata: organizationId ? { organizationId } : null
        })
        .select()
        .single();

    // 3. Handle Result
    if (!insertError && newConv) {
        // Created successfully -> Must add participants
        console.log('[ChatSupport] Created new conversation. Adding participants...');
        await addParticipant(newConv.id, userId, 'user');
        await addParticipant(newConv.id, targetUserId, 'user');
        return newConv as unknown as SupportConversation;
    }

    // 4. If Duplicate Key (23505), Fetch Existing
    if (insertError && insertError.code === '23505') {
        console.log('[ChatSupport] Conversation exists (Duplicate Key). Fetching...');

        // @ts-ignore - support_conversations not in generated types
        const { data: existingConv, error: fetchError } = await supabase
            .from('support_conversations')
            .select('*')
            .eq('conversation_key', conversationKey)
            .single();

        if (fetchError) throw fetchError;
        return existingConv as unknown as SupportConversation;
    }

    // Real Error?
    throw insertError;
};

/**
 * @deprecated Use resolveConversation instead for deterministic 1:1 chat
 */
export const createConversation = async (
    subject: string,
    priority: 'normal' | 'high' | 'urgent' = 'normal',
    organizationId?: string | null,
    targetUser?: { id?: string | null; email?: string | null; username?: string | null; azureId?: string | null },
    resolveUserIdFn?: (user: any) => Promise<string>
) => {
    // Fallback for legacy calls - try to resolve if targetUser is provided
    if (targetUser && (targetUser.id || targetUser.azureId) && resolveUserIdFn) {
        const targetUserId = await resolveUserIdFn(targetUser);
        return resolveConversation(targetUserId, organizationId);
    }

    console.warn('[ChatSupport] Creating non-deterministic conversation (deprecated)');

    const userId = getCurrentUserId();
    if (!userId) throw new Error('Not authenticated');

    // @ts-ignore - support_conversations not in generated types
    const { data: conversation, error: convError } = await supabase
        .from('support_conversations')
        .insert({
            user_id: userId,
            subject,
            priority,
            status: 'open',
            metadata: organizationId ? { organizationId } : null
        })
        .select()
        .single();

    if (convError) throw convError;
    await addParticipant(conversation.id, userId, 'user');
    return conversation;
};

/**
 * Create a conversation with an initial message
 */
export const createConversationWithMessage = async (
    messageContent: string,
    priority: 'normal' | 'high' | 'urgent' = 'normal',
    organizationId?: string | null
): Promise<{ conversationId: string; message: SupportMessage }> => {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('Not authenticated');

    console.log('[ChatSupport] Creating conversation with initial message...');

    // 1. Create Conversation with organization metadata
    // @ts-ignore - support_conversations not in generated types
    const { data: conversation, error: convError } = await supabase
        .from('support_conversations')
        .insert({
            user_id: userId,
            subject: "Support Chat " + new Date().toLocaleDateString(),
            priority,
            status: 'open',
            metadata: organizationId ? { organizationId } : null
        })
        .select()
        .single();

    if (convError) throw convError;

    // 2. Add User as Participant
    await addParticipant(conversation.id, userId, 'user');

    // 3. Send the first message immediately
    // @ts-ignore - support_messages not in generated types
    const { data: message, error: msgError } = await supabase
        .from('support_messages')
        .insert({
            conversation_id: conversation.id,
            sender_id: userId,
            content: messageContent,
            type: 'text',
            is_read: false
        })
        .select()
        .single();

    if (msgError) {
        console.error('[ChatSupport] Failed to send initial message:', msgError);
        throw msgError;
    }

    // 4. Update conversation updated_at timestamp
    // @ts-ignore - support_conversations not in generated types
    await supabase
        .from('support_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversation.id);

    console.log('[ChatSupport] Conversation created with message:', {
        conversationId: conversation.id,
        messageId: message.id
    });

    return {
        conversationId: conversation.id,
        message: message as SupportMessage
    };
};
