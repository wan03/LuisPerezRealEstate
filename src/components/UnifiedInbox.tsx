'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { MessageSquare, User, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { InboxSkeleton } from '@/components/Skeletons';

interface ChatRoom {
    id: string;
    name: string | null;
    last_message?: {
        content: string;
        created_at: string;
        sender: {
            full_name: string;
        };
    };
    client_name?: string;
}

export default function UnifiedInbox({ onSelectRoom }: { onSelectRoom: (roomId: string) => void }) {
    const supabase = createClient();
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchRooms = async () => {
            setLoading(true);

            // 1. Get rooms where current user is a participant
            const { data: participants, error: pError } = await supabase
                .from('chat_participants')
                .select('room_id')
                .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

            if (pError || !participants) {
                console.error('Error fetching participants:', pError);
                setError(true);
                setLoading(false);
                return;
            }

            const roomIds = participants.map(p => p.room_id);

            // 2. Fetch room details and latest message
            const { data: roomData, error: rError } = await supabase
                .from('chat_rooms')
                .select(`
                    id,
                    name,
                    messages:chat_messages(
                        content,
                        created_at,
                        sender:sender_id(full_name)
                    )
                `)
                .in('id', roomIds);

            if (rError) {
                console.error('Error fetching rooms:', rError);
            } else if (roomData) {
                const formattedRooms = roomData.map(room => {
                    // Sort messages locally to get the latest one
                    const sortedMsgs = (room.messages as any[] || []).sort(
                        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                    );

                    const lastMsg = sortedMsgs[0];

                    return {
                        id: room.id,
                        name: room.name,
                        last_message: lastMsg ? {
                            content: lastMsg.content,
                            created_at: lastMsg.created_at,
                            sender: Array.isArray(lastMsg.sender) ? lastMsg.sender[0] : lastMsg.sender
                        } : undefined
                    };
                });

                // Sort rooms by last message time
                formattedRooms.sort((a, b) => {
                    const timeA = a.last_message ? new Date(a.last_message.created_at).getTime() : 0;
                    const timeB = b.last_message ? new Date(b.last_message.created_at).getTime() : 0;
                    return timeB - timeA;
                });

                setRooms(formattedRooms);
            }
            setLoading(false);
        };

        void fetchRooms();
    }, [supabase]);

    if (loading) {
        return <InboxSkeleton />;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <AlertCircle size={32} className="text-red-400" />
                <p className="text-slate-500 font-bold text-sm">Could not load conversations.</p>
                <button onClick={() => { setError(false); setLoading(true); }} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all">
                    <RefreshCw size={14} /> Try Again
                </button>
            </div>
        );
    }

    if (rooms.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                <MessageSquare size={48} className="text-slate-200 mb-4" />
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No active conversations</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {rooms.map((room) => (
                <div
                    key={room.id}
                    onClick={() => onSelectRoom(room.id)}
                    className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-indigo-600 hover:shadow-lg transition-all cursor-pointer group"
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                <User size={20} />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900">{room.name || 'Personal Chat'}</h4>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                    <Clock size={10} />
                                    {room.last_message
                                        ? new Date(room.last_message.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                        : 'No activity'}
                                </div>
                            </div>
                        </div>
                    </div>
                    {room.last_message && (
                        <div className="mt-3">
                            <p className="text-sm text-slate-600 line-clamp-1 italic">
                                <span className="font-black text-indigo-600 not-italic mr-1">{room.last_message.sender.full_name}:</span>
                                "{room.last_message.content}"
                            </p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
