import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface ChatMessage {
    id: string;
    room_id: string;
    sender_id: string;
    content: string;
    created_at: string;
    is_read: boolean;
    sender: {
        full_name: string;
        role: string;
    };
}

interface UseChatProps {
    roomId?: string;
    userId?: string;
}

export function useChat({ roomId, userId }: UseChatProps) {
    const supabase = createClient();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const channelRef = useRef<RealtimeChannel | null>(null);

    const fetchMessages = useCallback(async () => {
        if (!roomId) return;
        setLoading(true);

        const { data, error } = await supabase
            .from('chat_messages')
            .select(`
                *,
                sender:sender_id (
                    full_name,
                    role
                )
            `)
            .eq('room_id', roomId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching messages:', error);
        } else if (data) {
            // Transform data to match ChatMessage interface
            const formattedMessages = data.map(msg => ({
                ...msg,
                sender: Array.isArray(msg.sender) ? msg.sender[0] : msg.sender
            })) as ChatMessage[];
            setMessages(formattedMessages);
        }
        setLoading(false);
    }, [roomId, supabase]);

    // Initial fetch
    useEffect(() => {
        void fetchMessages();
    }, [fetchMessages]);

    // Realtime subscription
    useEffect(() => {
        if (!roomId) return;

        // Clean up previous channel
        if (channelRef.current) {
            supabase.removeChannel(channelRef.current);
        }

        const channel = supabase
            .channel(`room:${roomId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages',
                    filter: `room_id=eq.${roomId}`
                },
                async (payload) => {
                    // Fetch the complete message with sender details
                    const { data } = await supabase
                        .from('chat_messages')
                        .select(`
                            *,
                            sender:sender_id (
                                full_name,
                                role
                            )
                        `)
                        .eq('id', payload.new.id)
                        .single();

                    if (data) {
                        const newMsg = {
                            ...data,
                            sender: Array.isArray(data.sender) ? data.sender[0] : data.sender
                        } as ChatMessage;

                        setMessages(prev => [...prev, newMsg]);
                    }
                }
            )
            .subscribe();

        channelRef.current = channel;

        return () => {
            supabase.removeChannel(channel);
        };
    }, [roomId, supabase]);

    const sendMessage = async (content: string) => {
        if (!roomId || !content.trim()) return;

        // Get current user if not provided
        let currentUserId = userId;
        let currentUserRole = 'agent'; // Default assumption for optimistic
        let currentUserName = 'You';

        if (!currentUserId) {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) console.error('Auth error in useChat:', error);
            currentUserId = user?.id;
            console.log('useChat resolved userId:', currentUserId);
        }

        if (!currentUserId) {
            console.error('No user logged in - aborting message send');
            return;
        }

        // Optimistic Update
        const optimisticId = `temp-${Date.now()}`;
        const optimisticMsg: ChatMessage = {
            id: optimisticId,
            room_id: roomId,
            sender_id: currentUserId,
            content,
            created_at: new Date().toISOString(),
            is_read: false,
            sender: {
                full_name: 'Sending...',
                role: 'agent' // We assume agent for this context or pass it in
            }
        };

        setMessages(prev => [...prev, optimisticMsg]);

        const { error } = await supabase.from('chat_messages').insert({
            room_id: roomId,
            sender_id: currentUserId,
            content
        });

        if (error) {
            console.error('Error sending message:', error);
            // Rollback
            setMessages(prev => prev.filter(m => m.id !== optimisticId));
            throw error;
        }
    };

    return {
        messages,
        loading,
        sendMessage,
        refresh: fetchMessages
    };
}
