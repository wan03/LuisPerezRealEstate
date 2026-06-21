'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Shield, Briefcase, User, Loader2, MessageSquare } from 'lucide-react';
import { useChat } from '@/hooks/useChat';

export default function TriadChat({ userRole = 'client', roomId }: { userRole?: 'client' | 'agent' | 'loan_officer', roomId?: string }) {
    const { messages, loading, sendMessage } = useChat({ roomId });
    const [inputValue, setInputValue] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim() || !roomId) return;

        try {
            await sendMessage(inputValue);
            setInputValue('');
        } catch (err) {
            console.error('Failed to send message:', err);
        }
    };

    return (
        <div className="flex flex-col h-[600px] w-full max-w-2xl bg-panel border border-line overflow-hidden">
            {/* Header */}
            <div className="bg-bg2 border-b border-line p-5 text-ink flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="flex -space-x-1.5">
                        <div className="w-9 h-9 border-2 border-bg2 bg-blue text-white flex items-center justify-center"><User size={18} /></div>
                        <div className="w-9 h-9 border-2 border-bg2 bg-lime text-accentink flex items-center justify-center"><Briefcase size={18} /></div>
                        <div className="w-9 h-9 border-2 border-bg2 bg-panel2 text-ink flex items-center justify-center"><Shield size={18} /></div>
                    </div>
                    <div>
                        <h3 className="font-black uppercase tracking-[-0.02em] leading-none mb-1.5">Triad Chat</h3>
                        <p className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.1em] uppercase text-mut">
                            {roomId && <span className="lp-live-dot" />} Active Thread
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    {/* Connection Status Indicator */}
                    {roomId
                        ? <span className="lp-live-dot self-center" title="Connected" />
                        : <span className="w-2.5 h-2.5 bg-org self-center" title="Disconnected" />}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-bg relative">
                {loading && messages.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-bg/50">
                        <Loader2 className="lp-spinner text-blue2" style={{ width: 32, height: 32 }} />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-mut2 space-y-2">
                        <MessageSquare className="opacity-20" size={48} />
                        <p className="font-mono text-[11px] tracking-[0.1em] uppercase">No messages yet</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.sender.role === userRole;
                        return (
                            <div key={msg.id} className={`flex flex-col max-w-[80%] ${isMe ? 'items-end ml-auto' : 'items-start'}`}>
                                <div className="mb-1">
                                    <span className="font-mono text-[9px] tracking-[0.08em] uppercase text-mut2">
                                        {msg.sender.full_name} · {msg.sender.role}
                                    </span>
                                </div>
                                <div className={`p-3.5 ${isMe
                                    ? 'bg-blue text-white'
                                    : 'bg-panel2 text-ink border border-line'
                                    }`}>
                                    <p className="text-[13px] leading-relaxed">
                                        {/* Note: Translation logic removed for MVP alignment with DB schema.
                                            Can re-introduce if we add content_es column to chat_messages later. */}
                                        {msg.content}
                                    </p>
                                </div>
                                <span className="font-mono text-[9px] text-mut2 mt-1">
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        );
                    })
                )}
                <div ref={scrollRef} />
            </div>

            {/* Footer */}
            <div className="p-4 bg-panel border-t border-line">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Message the Triad..."
                        className="lp-input flex-1 px-3 py-3 text-[13px]"
                        disabled={!roomId}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!roomId || !inputValue.trim()}
                        className="bg-blue text-white px-4 flex items-center justify-center hover:bg-blue2 transition-colors active:translate-y-px disabled:opacity-50 disabled:pointer-events-none"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
