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
        <div className="flex flex-col h-[600px] w-full max-w-2xl bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-2xl">
            {/* Header */}
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                        <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-indigo-500 flex items-center justify-center"><User size={20} /></div>
                        <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-emerald-500 flex items-center justify-center"><Briefcase size={20} /></div>
                        <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-orange-500 flex items-center justify-center"><Shield size={20} /></div>
                    </div>
                    <div>
                        <h3 className="font-black tracking-tight leading-none mb-1">Highlands Triad Chat</h3>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Active Thread</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    {/* Connection Status Indicator */}
                    <div className={`w-3 h-3 rounded-full self-center ${roomId ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} title={roomId ? 'Connected' : 'Disconnected'} />
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 relative">
                {loading && messages.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50">
                        <Loader2 className="animate-spin text-indigo-600" size={32} />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                        <MessageSquare className="opacity-20" size={48} />
                        <p className="text-xs font-black uppercase tracking-widest">No messages yet</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className={`flex flex-col ${msg.sender.role === userRole ? 'items-end' : 'items-start'}`}>
                            <div className={`flex items-center gap-2 mb-1`}>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    {msg.sender.full_name} • {msg.sender.role}
                                </span>
                            </div>
                            <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${msg.sender.role === userRole
                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                                }`}>
                                <p className="text-sm font-medium leading-relaxed">
                                    {/* Note: Translation logic removed for MVP alignment with DB schema. 
                                        Can re-introduce if we add content_es column to chat_messages later. */}
                                    {msg.content}
                                </p>
                            </div>
                            <span className="text-[10px] text-slate-400 mt-1 font-bold">
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))
                )}
                <div ref={scrollRef} />
            </div>

            {/* Footer */}
            <div className="p-4 bg-white border-t border-slate-100">
                <div className="flex gap-2 bg-slate-100 p-2 rounded-2xl border-2 border-transparent focus-within:border-indigo-500 transition-all">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Message the Triad..."
                        className="flex-1 bg-transparent px-2 py-2 text-sm font-medium focus:outline-none text-black"
                        disabled={!roomId}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!roomId || !inputValue.trim()}
                        className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:pointer-events-none"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
