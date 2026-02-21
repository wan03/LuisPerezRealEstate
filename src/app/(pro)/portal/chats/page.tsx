'use client';

import React, { useState } from 'react';
import UnifiedInbox from '@/components/UnifiedInbox';
import TriadChat from '@/components/TriadChat';

export default function ChatsPage() {
    const [roomId, setRoomId] = useState<string | null>(null);

    return (
        <div>
            {/* Header Area */}
            <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-40 h-[72px]">
                <h1 className="text-xl font-black uppercase tracking-tighter italic text-slate-800">Unified Inbox</h1>
            </header>

            <div className="p-8">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    <div className="xl:col-span-4 space-y-6">
                        <UnifiedInbox onSelectRoom={(id) => setRoomId(id)} />
                    </div>
                    <div className="xl:col-span-8">
                        <div className="bg-white p-2 rounded-3xl border border-slate-200 sticky top-24">
                            <TriadChat userRole="agent" roomId={roomId || undefined} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
