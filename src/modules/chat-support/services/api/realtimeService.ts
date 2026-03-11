import { supabase } from '../../../../lib/client';
import { SupportMessage } from './types';

export const subscribeToConversation = (conversationId: string, onMessage: (msg: SupportMessage) => void) => {
    //console.log('[ChatSupportService] [REALTIME] Subscribing to conversation:', conversationId);

    const channel = supabase
        .channel(`conversation:${conversationId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'communities',
                table: 'support_messages',
                filter: `conversation_id=eq.${conversationId}`,
            },
            (payload) => {
                const newMessage = payload.new as SupportMessage;
                onMessage(newMessage);
            }
        )
        .subscribe();

    return {
        unsubscribe: () => {
            supabase.removeChannel(channel);
        },
    };
};

export const subscribeToPresence = (
    userId: string,
    userInfo: { username?: string; role?: string },
    onPresenceChange: (presenceState: Record<string, any[]>) => void
) => {
    const channel = supabase.channel('chat-presence', {
        config: {
            presence: {
                key: userId,
            },
        },
    });

    channel
        .on('presence', { event: 'sync' }, () => {
            const state = channel.presenceState();
            onPresenceChange(state);
        })
        .on('presence', { event: 'join' }, () => {
            // User joined - handled by sync
        })
        .on('presence', { event: 'leave' }, () => {
            // User left - handled by sync
        })
        .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                await channel.track({
                    user_id: userId,
                    username: userInfo.username || 'Unknown',
                    role: userInfo.role || 'user',
                    online_at: new Date().toISOString(),
                });
            }
        });

    return {
        channel,
        unsubscribe: () => {
            channel.untrack();
            supabase.removeChannel(channel);
        },
    };
};
