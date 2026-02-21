'use client';

import React, { useState, useEffect, useCallback } from 'react';
import CommandCenter from '@/components/CommandCenter';
import TriadChat from '@/components/TriadChat';
import DocumentUpload from '@/components/DocumentUpload';
import DocumentVault from '@/components/DocumentVault';
import ActivityFeed from '@/components/ActivityFeed';
import { Home, MessageSquare, FileText, Bell, LogOut, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function ClientDashboard() {
    const supabase = createClient();
    const [clientId, setClientId] = useState<string | null>(null);
    const [propertyName, setPropertyName] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
    const [roomId, setRoomId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'home' | 'chat' | 'documents' | 'updates'>('home');

    const initDashboard = useCallback(async () => {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            console.error('Auth error:', authError);
            setLoading(false);
            return;
        }

        setClientId(user.id);

        // Fetch profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();

        if (profile?.full_name) {
            setUserName(profile.full_name);
        }

        // Fetch active transaction property name
        const { data: transaction } = await supabase
            .from('transactions')
            .select('custom_property_name')
            .eq('client_id', user.id)
            .maybeSingle();

        if (transaction?.custom_property_name) {
            setPropertyName(transaction.custom_property_name);
        } else {
            setPropertyName('Your Property');
        }

        // Find the client's chat room
        const { data: participant } = await supabase
            .from('chat_participants')
            .select('room_id')
            .eq('user_id', user.id)
            .limit(1)
            .maybeSingle();

        if (participant?.room_id) {
            setRoomId(participant.room_id);
        }

        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        void Promise.resolve().then(() => initDashboard());
    }, [initDashboard]);

    // Compute display values
    const firstName = userName.split(' ')[0] || 'Your';
    const initials = userName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || '??';

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-indigo-600" size={48} />
                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'chat':
                return (
                    <div className="h-[calc(100vh-theme(spacing.24))] md:h-[calc(100vh-theme(spacing.12))] flex flex-col">
                        <div className="mb-6">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Triad Chat</h2>
                            <p className="text-slate-500 font-medium">Direct line to your Agent and Loan Officer.</p>
                        </div>
                        <div className="flex-1 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                            <TriadChat userRole="client" roomId={roomId || undefined} />
                        </div>
                    </div>
                );
            case 'documents':
                return <DocumentVault />;
            case 'updates':
                return (
                    <div className="max-w-3xl mx-auto">
                        <ActivityFeed clientId={clientId || ''} />
                    </div>
                );
            case 'home':
            default:
                return (
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 items-start text-black">
                        {/* Left/Middle Col: Roadmap & Docs */}
                        <div className="xl:col-span-2 space-y-12 text-black">
                            <CommandCenter role="client" clientId={clientId || undefined} />
                            {/* We keep the simple upload here for quick access, but link to Vault */}
                            <DocumentUpload />
                        </div>

                        {/* Right Col: Chat Preview */}
                        <div className="space-y-8 sticky top-28">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic font-black">Triad Live Chat</h3>
                            </div>
                            <div className="h-[500px] flex flex-col bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                                <TriadChat userRole="client" roomId={roomId || undefined} />
                            </div>

                            {/* Quick Stats/Alert */}
                            <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100">
                                <h4 className="font-black text-lg mb-2 italic">Transaction Updates</h4>
                                <p className="text-indigo-100 text-sm font-medium mb-4">Check your roadmap above for the latest status on your transaction.</p>
                                <button
                                    onClick={() => setActiveTab('updates')}
                                    className="w-full bg-white/20 hover:bg-white/30 transition-colors py-3 rounded-xl font-black text-xs uppercase tracking-widest border border-white/20"
                                >
                                    View Activity Feed
                                </button>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-20 bg-slate-900 md:h-screen relative md:sticky md:top-0 p-4 flex flex-row md:flex-col items-center gap-8 z-50 shadow-2xl shadow-slate-900/20">
                <button
                    onClick={() => setActiveTab('home')}
                    className={`p-3 rounded-2xl transition-all ${activeTab === 'home' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
                    title="Home"
                >
                    <Home size={24} />
                </button>
                <button
                    onClick={() => setActiveTab('chat')}
                    className={`p-3 rounded-2xl transition-all ${activeTab === 'chat' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
                    title="Chat"
                >
                    <MessageSquare size={24} />
                </button>
                <button
                    onClick={() => setActiveTab('documents')}
                    className={`p-3 rounded-2xl transition-all ${activeTab === 'documents' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
                    title="Documents"
                >
                    <FileText size={24} />
                </button>
                <button
                    onClick={() => setActiveTab('updates')}
                    className={`md:mt-auto p-3 rounded-2xl transition-all ${activeTab === 'updates' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
                    title="Updates"
                >
                    <Bell size={24} />
                </button>
                <div
                    onClick={async () => {
                        await supabase.auth.signOut();
                        window.location.href = '/login';
                    }}
                    className="text-slate-500 hover:text-red-400 transition-colors cursor-pointer mb-2 p-3"
                    title="Sign Out"
                >
                    <LogOut size={24} />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-4 md:p-8 lg:p-12 overflow-x-hidden">
                {/* Header (Always visible unless in fullscreen chat maybe? No, keep it for context) */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">{firstName}&apos;s Command Center</h1>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">Property: {propertyName}</p>
                    </div>
                    <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex -space-x-2">
                            <div className="w-10 h-10 rounded-full border-2 border-white bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">{initials}</div>
                        </div>
                        <div className="pr-4 hidden md:block">
                            <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Your Triad</p>
                            <p className="text-xs font-bold text-slate-800">{roomId ? 'Connected' : 'Offline'}</p>
                        </div>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="animate-in fade-in duration-300">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}
