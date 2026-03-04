'use client';

import React, { useState, useEffect, useCallback } from 'react';
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

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-500/20 text-white">
                            <Shield size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black italic tracking-tighter uppercase">Admin Registry</h1>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">System-Wide Overview</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={async () => {
                                await supabase.auth.signOut();
                                window.location.href = '/login';
                            }}
                            className="bg-white/10 hover:bg-red-500/20 hover:text-red-400 transition-all p-3 rounded-xl border border-white/10"
                        >
                            <LogOut size={20} />
                        </button>
                        <button className="bg-indigo-600 hover:bg-indigo-700 transition-all px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2">
                            <UserPlus size={18} /> Invite User
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {stats.map((stat) => (
                        <div key={stat.label} className="bg-white/5 border border-white/10 p-8 rounded-[32px] hover:bg-white/[0.07] transition-all group">
                            <div className="flex justify-between items-start mb-6">
                                <div className="text-indigo-400 p-2 bg-indigo-400/10 rounded-xl group-hover:scale-110 transition-transform">
                                    {stat.icon}
                                </div>
                            </div>
                            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">{stat.label}</p>
                            <h3 className="text-4xl font-black tracking-tighter">
                                {loading ? <Loader2 size={24} className="animate-spin" /> : stat.value}
                            </h3>
                        </div>
                    ))}
                </div>

                {/* Content Management Tab */}
                <div className="bg-white/5 border border-white/10 rounded-[40px] p-12 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12">
                        <FileText size={200} />
                    </div>
                    <div className="relative z-10 max-w-2xl">
                        <h2 className="text-3xl font-black uppercase mb-4 italic">Knowledge Base</h2>
                        <p className="text-slate-400 font-medium mb-8 leading-relaxed">
                            Educational content is managed through the CMS. Visit the <a href="/learn" className="text-indigo-400 underline hover:text-indigo-300 transition-colors">Education Hub</a> to see published articles.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
