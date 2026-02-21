import React from 'react';
import Sidebar from '@/components/Sidebar';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            <Sidebar />
            <div className="flex-1 overflow-y-auto h-screen">
                {children}
            </div>
        </div>
    );
}
