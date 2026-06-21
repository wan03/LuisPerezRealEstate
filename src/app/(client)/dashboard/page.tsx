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
            <div className="min-h-screen bg-bg flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="lp-spinner w-12 h-12" />
                    <p className="text-mut font-mono uppercase tracking-[0.1em] text-[10px]">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    const navItems = [
        { key: 'home' as const, icon: Home, label: 'Home' },
        { key: 'chat' as const, icon: MessageSquare, label: 'Chat' },
        { key: 'documents' as const, icon: FileText, label: 'Documents' },
        { key: 'updates' as const, icon: Bell, label: 'Updates' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'chat':
                return (
                    <div className="h-[calc(100vh-theme(spacing.24))] md:h-[calc(100vh-theme(spacing.12))] flex flex-col">
                        <div className="mb-6">
                            <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-mut2">02 / Communication</p>
                            <h2 className="text-2xl font-black uppercase tracking-[-0.03em] mt-1">Triad <span className="text-lime">Chat</span></h2>
                            <p className="text-mut font-mono text-[11px] mt-1.5">Direct line to your Agent and Loan Officer.</p>
                        </div>
                        <div className="flex-1 bg-panel border border-line overflow-hidden">
                            <TriadChat userRole="client" roomId={roomId || undefined} />
                        </div>
                    </div>
                );
            case 'documents':
                return (
                    <div>
                        <div className="mb-6">
                            <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-mut2">03 / Documents</p>
                            <h2 className="text-2xl font-black uppercase tracking-[-0.03em] mt-1">Document <span className="text-lime">Vault</span></h2>
                            <p className="text-mut font-mono text-[11px] mt-1.5">All transaction documents in one secure place.</p>
                        </div>
                        <DocumentVault />
                    </div>
                );
            case 'updates':
                return (
                    <div className="max-w-3xl mx-auto">
                        <div className="mb-6">
                            <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-mut2">04 / Updates</p>
                            <h2 className="text-2xl font-black uppercase tracking-[-0.03em] mt-1">Activity <span className="text-lime">Feed</span></h2>
                            <p className="text-mut font-mono text-[11px] mt-1.5">All updates on your transaction.</p>
                        </div>
                        <ActivityFeed clientId={clientId || ''} />
                    </div>
                );
            case 'home':
            default:
                return (
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                        {/* Left/Middle Col: Roadmap & Docs */}
                        <div className="xl:col-span-2 space-y-6">
                            <CommandCenter role="client" clientId={clientId || undefined} />
                            {/* We keep the simple upload here for quick access, but link to Vault */}
                            <DocumentUpload />
                        </div>

                        {/* Right Col: Chat Preview */}
                        <div className="space-y-6 xl:sticky xl:top-24">
                            <div className="bg-panel border border-line flex flex-col">
                                <div className="px-5 py-4 border-b border-line flex items-center justify-between">
                                    <h3 className="text-sm font-black uppercase tracking-[-0.01em]">Triad Live Chat</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="lp-live-dot" />
                                        <span className="font-mono text-[9px] tracking-[0.08em] text-lime">LIVE</span>
                                    </div>
                                </div>
                                <div className="h-[460px] flex flex-col overflow-hidden">
                                    <TriadChat userRole="client" roomId={roomId || undefined} />
                                </div>
                            </div>

                            {/* Quick Stats/Alert */}
                            <div className="bg-panel border border-line p-6 corner-brackets">
                                <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-mut2 mb-2">Status</p>
                                <h4 className="font-black uppercase tracking-[-0.02em] text-lg mb-2">Transaction Updates</h4>
                                <p className="text-mut text-[13px] mb-4">Check your roadmap above for the latest status on your transaction.</p>
                                <button
                                    onClick={() => setActiveTab('updates')}
                                    className="w-full inline-flex items-center justify-center gap-2 font-extrabold text-[13px] tracking-[0.025em] uppercase px-5 py-3 transition-colors active:translate-y-px bg-blue text-white hover:bg-blue2"
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
        <div className="min-h-screen bg-bg text-ink flex flex-col md:flex-row">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-[72px] bg-bg2 border-b md:border-b-0 md:border-r border-line md:h-screen relative md:sticky md:top-0 py-3 md:py-4 flex flex-row md:flex-col items-center gap-2 md:gap-2 z-50">
                <span className="lp-mark hidden md:grid w-9 h-9 text-[12px] mb-4">LP</span>
                {navItems.map(({ key, icon: Icon, label }) => {
                    const active = activeTab === key;
                    return (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`relative w-11 h-11 grid place-items-center transition-colors ${active ? 'text-ink bg-panel' : 'text-mut2 hover:text-mut hover:bg-panel'}`}
                            title={label}
                        >
                            {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 bg-blue hidden md:block" />}
                            <Icon size={20} />
                        </button>
                    );
                })}
                <button
                    onClick={async () => {
                        await supabase.auth.signOut();
                        window.location.href = '/login';
                    }}
                    className="md:mt-auto w-11 h-11 grid place-items-center text-mut2 hover:text-org transition-colors"
                    title="Sign Out"
                >
                    <LogOut size={20} />
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-x-hidden flex flex-col">
                {/* Top Bar */}
                <div className="bg-bg2 border-b border-line px-7 h-16 flex items-center justify-between gap-4 sticky top-0 z-40">
                    <div>
                        <h2 className="text-lg md:text-xl font-black uppercase tracking-[-0.03em] leading-none">{firstName}&apos;s Command Center</h2>
                        <p className="font-mono text-[10px] text-mut tracking-[0.08em] mt-1">Property: {propertyName}</p>
                    </div>
                    <div className="flex items-center gap-2.5 bg-panel border border-line px-3.5 py-2">
                        <div className="w-[30px] h-[30px] rounded-full bg-blue grid place-items-center text-white font-mono text-[10px] font-bold">{initials}</div>
                        <div className="hidden md:block">
                            <p className="font-mono text-[9px] tracking-[0.1em] uppercase text-mut2 leading-none">Your Triad</p>
                            <p className="font-mono text-[10px] font-bold text-ink mt-1 flex items-center gap-1.5">
                                {roomId && <span className="lp-live-dot" />}{roomId ? 'Connected' : 'Offline'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="p-7 flex-1">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}
