'use client';

import React from 'react';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';

export default function AnalyticsPage() {
    return (
        <div className="flex-1 flex flex-col bg-bg text-ink">
            {/* Header Area */}
            <header className="bg-bg2 border-b border-line px-7 h-[60px] flex justify-between items-center sticky top-0 z-40">
                <div>
                    <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-mut2">03 / Analytics</p>
                    <h1 className="text-xl font-black uppercase tracking-[-0.03em] leading-none mt-0.5">
                        Performance <span className="text-lime">Analytics</span>
                    </h1>
                </div>
            </header>

            <div className="p-7">
                <div className="max-w-7xl mx-auto">
                    <AnalyticsDashboard />
                </div>
            </div>
        </div>
    );
}
