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
        <div className="w-64 bg-bg2 border-r border-line h-screen flex flex-col text-ink sticky top-0">
            {/* Logo/Identity */}
            <div className="p-5 border-b border-line">
                <div className="flex items-center gap-3">
                    <span className="lp-mark w-[38px] h-[38px] text-[14px] flex-none">LP</span>
                    <div className="leading-none">
                        <div className="font-black text-[15px] tracking-[-0.025em] uppercase">
                            Luis Perez<span className="text-blue2">/RE</span>
                        </div>
                        <div className="font-mono text-[10px] text-mut mt-[3px]">Lakeland · Tampa Bay</div>
                    </div>
                </div>
            </div>

            {/* Role block */}
            <div className="mx-5 my-4 bg-panel border border-line px-3 py-2.5">
                <div className="font-mono text-[9px] tracking-[0.12em] uppercase text-mut2">Signed in as</div>
                <div className="text-[13px] font-extrabold uppercase tracking-[-0.01em] mt-[3px] flex items-center gap-2">
                    {agentName || (
                        <span className="inline-flex items-center gap-2 text-mut">
                            <Loader2 size={14} className="lp-spinner" style={{ width: 14, height: 14 }} /> Loading
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[9px] text-lime mt-1">
                    <span className="lp-live-dot" /> {role || 'pro'} portal
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-1.5">
                <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-mut2 px-2 pb-2 pt-1">Main</div>
                {NAV_ITEMS.map(item => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`relative flex items-center gap-2.5 px-2.5 py-2.5 mb-0.5 font-mono text-[11px] font-bold tracking-[0.08em] uppercase transition-colors ${isActive
                                ? 'text-ink bg-panel2 before:content-[""] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-[2px] before:bg-lime'
                                : 'text-mut hover:text-ink hover:bg-panel'
                                }`}
                        >
                            <item.icon size={16} className="flex-none" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* User + Sign Out */}
            <div className="p-3 border-t border-line mt-auto">
                <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
                    <div className="w-8 h-8 bg-lime text-accentink flex items-center justify-center font-black text-[12px] flex-none">
                        {initials || '??'}
                    </div>
                    <div className="leading-none min-w-0">
                        <p className="font-extrabold text-[13px] text-ink truncate">{agentName || 'Loading...'}</p>
                        <p className="font-mono text-[9px] text-mut tracking-[0.1em] uppercase mt-1">{role || 'agent'}</p>
                    </div>
                </div>
                <button
                    onClick={async () => {
                        await supabase.auth.signOut();
                        window.location.href = '/login';
                    }}
                    className="flex items-center gap-2 px-2.5 py-2.5 text-mut2 hover:text-org transition-colors w-full font-mono text-[11px] font-bold tracking-[0.08em] uppercase"
                >
                    <LogOut size={16} />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
