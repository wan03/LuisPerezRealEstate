'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Clock, FileText, MessageSquare, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
    id: string;
    type: 'transaction' | 'document' | 'chat';
    title: string;
    description: string;
    timestamp: string;
    icon: React.ReactNode;
    colorClass: string;
}

export default function ActivityFeed({ clientId }: { clientId: string }) {
    const supabase = createClient();
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (clientId) fetchActivity();
    }, [clientId]);

    const fetchActivity = async () => {
        try {
            const feed: ActivityItem[] = [];

            // 1. Fetch Transaction Updates (using updated_at)
            const { data: transaction } = await supabase
                .from('transactions')
                .select('status, updated_at')
                .eq('client_id', clientId)
                .single();

            if (transaction) {
                feed.push({
                    id: 'tx-update',
                    type: 'transaction',
                    title: 'Transaction Status Updated',
                    description: `Current status is now ${transaction.status.replace('_', ' ')}.`,
                    timestamp: transaction.updated_at,
                    icon: <CheckCircle2 size={16} />,
                    colorClass: 'bg-emerald-100 text-emerald-600'
                });
            }

            // 2. Fetch Recent Documents
            const { data: docs } = await supabase
                .from('documents')
                .select('id, name, created_at, status')
                .eq('client_id', clientId)
                .order('created_at', { ascending: false })
                .limit(5);

            if (docs) {
                docs.forEach(doc => {
                    feed.push({
                        id: doc.id,
                        type: 'document',
                        title: 'New Document Uploaded',
                        description: doc.name,
                        timestamp: doc.created_at,
                        icon: <FileText size={16} />,
                        colorClass: 'bg-blue-100 text-blue-600'
                    });
                });
            }

            // 3. Fetch Recent Chat Messages (if any)
            // We need to find the room first
            const { data: participant } = await supabase
                .from('chat_participants')
                .select('room_id')
                .eq('user_id', clientId)
                .maybeSingle();

            if (participant) {
                const { data: messages } = await supabase
                    .from('chat_messages')
                    .select('id, content, created_at, sender_id')
                    .eq('room_id', participant.room_id)
                    .neq('sender_id', clientId) // Only show incoming messages
                    .order('created_at', { ascending: false })
                    .limit(3);

                if (messages) {
                    messages.forEach(msg => {
                        feed.push({
                            id: msg.id,
                            type: 'chat',
                            title: 'New Message',
                            description: msg.content.substring(0, 50) + (msg.content.length > 50 ? '...' : ''),
                            timestamp: msg.created_at,
                            icon: <MessageSquare size={16} />,
                            colorClass: 'bg-indigo-100 text-indigo-600'
                        });
                    });
                }
            }

            // Sort by timestamp desc
            feed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            setActivities(feed);
        } catch (error) {
            console.error('Error fetching activity:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-400 text-xs font-black uppercase tracking-widest">Loading...</div>;
    }

    if (activities.length === 0) {
        return (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
                <Clock size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No recent activity</p>
                <p className="text-slate-400 text-xs mt-2">Updates will appear here as your transaction progresses.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Activity Feed</h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Real-time Timeline</p>
                </div>
                <div className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Live
                </div>
            </div>

            <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 pb-4">
                {activities.map((item, index) => (
                    <div key={item.id} className="relative pl-8 group">
                        {/* Timeline Dot */}
                        <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center transition-transform group-hover:scale-110 ${item.colorClass}`}>
                            {/* Icon inside dot for extra flair? No, too small. Just color. */}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                            <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest w-fit ${item.colorClass.replace('text-', 'bg-opacity-20 ')}`}>
                                {item.icon} {item.type}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                            </span>
                        </div>

                        <h3 className="text-slate-900 font-bold text-sm mb-1">{item.title}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">{item.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
