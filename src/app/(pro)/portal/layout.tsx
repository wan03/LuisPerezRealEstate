import React from 'react';
import Sidebar from '@/components/Sidebar';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-bg flex font-sans text-ink">
            <Sidebar />
            <div className="flex-1 overflow-y-auto h-screen flex flex-col">
                {children}
            </div>
        </div>
    );
}
