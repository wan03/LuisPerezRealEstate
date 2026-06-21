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
                    colorClass: 'lime'
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
                        colorClass: 'blue'
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
                            colorClass: 'org'
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
        return <div className="p-8 text-center text-mut2 font-mono text-[11px] uppercase tracking-[0.1em]">Loading...</div>;
    }

    if (activities.length === 0) {
        return (
            <div className="p-12 text-center bg-panel border border-line">
                <Clock size={48} className="mx-auto text-mut2 opacity-40 mb-4" />
                <p className="text-mut font-mono uppercase tracking-[0.1em] text-[11px]">No recent activity</p>
                <p className="text-mut2 text-xs mt-2">Updates will appear here as your transaction progresses.</p>
            </div>
        );
    }

    // Map activity color token -> Tailwind utilities for dot + badge
    const dotColor: Record<string, string> = { lime: 'bg-lime', blue: 'bg-blue', org: 'bg-org' };
    const badgeColor: Record<string, string> = { lime: 'text-lime', blue: 'text-blue2', org: 'text-org' };

    return (
        <div className="bg-panel border border-line p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-[-0.03em] text-ink">Activity <em className="not-italic text-lime">Feed</em></h2>
                    <p className="font-mono text-[10px] text-mut tracking-[0.1em] uppercase mt-1.5">Real-time Timeline</p>
                </div>
                <div className="flex items-center gap-1.5 bg-panel2 border border-line text-lime px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.1em]">
                    <span className="lp-live-dot" /> Live
                </div>
            </div>

            <div className="relative border-l-2 border-line ml-4 space-y-8 pb-4">
                {activities.map((item) => (
                    <div key={item.id} className="relative pl-8 group">
                        {/* Timeline Dot */}
                        <div className={`absolute -left-[9px] top-0 w-4 h-4 border-2 border-panel flex items-center justify-center transition-transform group-hover:scale-110 ${dotColor[item.colorClass] || 'bg-mut'}`} />

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                            <span className={`inline-flex items-center gap-2 px-2 py-1 bg-panel2 border border-line font-mono text-[10px] font-bold uppercase tracking-[0.08em] w-fit ${badgeColor[item.colorClass] || 'text-mut'}`}>
                                {item.icon} {item.type}
                            </span>
                            <span className="font-mono text-[10px] text-mut2 uppercase tracking-[0.06em]">
                                {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                            </span>
                        </div>

                        <h3 className="text-ink font-bold text-sm mb-1">{item.title}</h3>
                        <p className="text-mut text-sm leading-relaxed">{item.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
