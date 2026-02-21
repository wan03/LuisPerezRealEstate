'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, MessageSquare, BarChart3, LogOut, Loader2, Mail } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

const NAV_ITEMS = [
    { href: '/portal/clients', icon: Users, label: 'Clients' },
    { href: '/portal/chats', icon: MessageSquare, label: 'Chats' },
    { href: '/portal/analytics', icon: BarChart3, label: 'Analytics' },
    { href: '/portal/templates', icon: Mail, label: 'Email Templates' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const supabase = createClient();
    const [agentName, setAgentName] = useState<string>('');
    const [initials, setInitials] = useState<string>('');
    const [role, setRole] = useState<string>('');

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, role')
                .eq('id', user.id)
                .single();

            if (profile) {
                setAgentName(profile.full_name || 'Agent');
                setRole(profile.role || 'agent');
                const parts = (profile.full_name || '').split(' ');
                setInitials(parts.map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '??');
            }
        };
        void fetchProfile();
    }, [supabase]);

    return (
        <div className="w-64 bg-slate-900 h-screen flex flex-col text-white sticky top-0">
            {/* Logo/Identity */}
            <div className="p-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-sm shadow-lg shadow-indigo-500/20">
                        {initials || <Loader2 size={16} className="animate-spin" />}
                    </div>
                    <div>
                        <p className="font-black tracking-tight leading-none">{agentName || 'Loading...'}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{role || 'pro'} portal</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {NAV_ITEMS.map(item => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${isActive
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Sign Out */}
            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={async () => {
                        await supabase.auth.signOut();
                        window.location.href = '/login';
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all w-full font-bold text-sm"
                >
                    <LogOut size={20} />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
