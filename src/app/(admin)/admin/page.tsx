'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Shield, Users, FileText, Activity, UserPlus, Loader2, LogOut } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { fetchSystemStats } from './actions';

export default function AdminConsole() {
    const supabase = createClient();
    const [stats, setStats] = useState([
        { label: 'Active Pipeline', value: '...', icon: <Activity size={20} /> },
        { label: 'Total Clients', value: '...', icon: <Users size={20} /> },
        { label: 'Knowledge Base', value: '...', icon: <FileText size={20} /> },
    ]);
    const [loading, setLoading] = useState(true);

    const loadStats = useCallback(async () => {
        setLoading(true);

        const { threadCount, clientCount, articleCount } = await fetchSystemStats();

        setStats([
            { label: 'Active Pipeline', value: threadCount.toString(), icon: <Activity size={20} /> },
            { label: 'Total Clients', value: clientCount.toString(), icon: <Users size={20} /> },
            { label: 'Knowledge Base', value: `${articleCount} articles`, icon: <FileText size={20} /> },
        ]);

        setLoading(false);
    }, []);

    useEffect(() => {
        void Promise.resolve().then(() => loadStats());
    }, [loadStats]);

    const statColors = ['text-blue2', 'text-lime', 'text-org'];

    return (
        <div className="min-h-screen bg-bg text-ink">
            {/* Top Bar */}
            <div className="bg-bg2 border-b border-line px-8 h-[68px] flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <span className="lp-mark w-[38px] h-[38px] text-[14px]">LP</span>
                    <div className="bg-blue grid place-items-center w-11 h-11">
                        <Shield size={22} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black uppercase tracking-[-0.03em] italic leading-none">Admin Registry</h1>
                        <p className="font-mono text-[10px] text-mut tracking-[0.08em] mt-1">System-Wide Overview</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="inline-flex items-center justify-center gap-2 font-extrabold text-[13px] tracking-[0.025em] uppercase px-5 py-3 transition-colors active:translate-y-px bg-lime text-bg hover:bg-[#d2ff56]">
                        <UserPlus size={16} /> Invite User
                    </button>
                    <button
                        onClick={async () => {
                            await supabase.auth.signOut();
                            window.location.href = '/login';
                        }}
                        className="bg-org/10 border border-org/20 text-org hover:bg-org/20 transition-colors p-3"
                        title="Sign Out"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>

            {/* Main */}
            <div className="max-w-[1340px] mx-auto px-8 py-7 space-y-7">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {stats.map((stat, i) => (
                        <div key={stat.label} className="bg-panel border border-line p-6 relative overflow-hidden corner-brackets">
                            <div className="absolute top-5 right-5 opacity-[0.08] text-ink">
                                {stat.icon}
                            </div>
                            <div className={`text-[48px] font-black tracking-[-0.04em] leading-none ${statColors[i % 3]}`}>
                                {loading ? <Loader2 size={32} className="animate-spin" /> : stat.value}
                            </div>
                            <p className="font-mono text-[10px] text-mut uppercase tracking-[0.1em] mt-1.5">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Content Management Panel */}
                <div className="bg-panel border border-line overflow-hidden relative">
                    <div className="card-head px-6 py-5 border-b border-line flex items-center justify-between">
                        <h3 className="text-[15px] font-black uppercase tracking-[-0.01em]">Knowledge Base</h3>
                        <Link href="/learn" className="inline-flex items-center justify-center gap-2 font-extrabold text-[12px] tracking-[0.025em] uppercase px-4 py-2 transition-colors active:translate-y-px bg-panel2 text-ink hover:bg-[#222b3a]">
                            Education Hub →
                        </Link>
                    </div>
                    <div className="relative p-8 overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.05] rotate-12 text-ink pointer-events-none">
                            <FileText size={180} />
                        </div>
                        <div className="relative z-10 max-w-2xl">
                            <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-mut2 mb-3">Content Management</p>
                            <p className="text-mut leading-relaxed">
                                Educational content is managed through the CMS. Visit the <Link href="/learn" className="text-blue2 underline hover:text-lime transition-colors">Education Hub</Link> to see published articles.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
