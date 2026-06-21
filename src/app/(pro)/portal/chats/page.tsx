'use client';

import React, { useState } from 'react';
import UnifiedInbox from '@/components/UnifiedInbox';
import TriadChat from '@/components/TriadChat';

export default function ChatsPage() {
    const [roomId, setRoomId] = useState<string | null>(null);

    return (
        <div className="flex-1 flex flex-col bg-bg text-ink">
            {/* Header Area */}
            <header className="bg-bg2 border-b border-line px-7 h-[60px] flex justify-between items-center sticky top-0 z-40">
                <div>
                    <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-mut2">02 / Communication</p>
                    <h1 className="text-xl font-black uppercase tracking-[-0.03em] leading-none mt-0.5">
                        Unified <span className="text-lime">Inbox</span>
                    </h1>
                </div>
            </header>

            <div className="p-7">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    <div className="xl:col-span-4 space-y-6">
                        <UnifiedInbox onSelectRoom={(id) => setRoomId(id)} />
                    </div>
                    <div className="xl:col-span-8">
                        <div className="bg-panel border border-line p-2 sticky top-24">
                            <TriadChat userRole="agent" roomId={roomId || undefined} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
