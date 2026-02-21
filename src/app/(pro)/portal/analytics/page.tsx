'use client';

import React from 'react';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';

export default function AnalyticsPage() {
    return (
        <div>
            {/* Header Area */}
            <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-40 h-[72px]">
                <h1 className="text-xl font-black uppercase tracking-tighter italic text-slate-800">Performance Analytics</h1>
            </header>

            <div className="p-8">
                <div className="max-w-7xl mx-auto">
                    <AnalyticsDashboard />
                </div>
            </div>
        </div>
    );
}
