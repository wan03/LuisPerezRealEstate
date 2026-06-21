'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { TrendingUp, DollarSign, Users, Target, AlertCircle, RefreshCw } from 'lucide-react';
import { AnalyticsSkeleton } from '@/components/Skeletons';
import CountUp from '@/components/CountUp';

interface AnalyticsData {
    total_active_clients: number;
    total_volume: number;
    projected_gci: number;
    funnel_distribution: Record<string, number>;
}

export default function AnalyticsDashboard({ monthlyGoal = 50000 }: { monthlyGoal?: number }) {
    const supabase = createClient();
    const [metrics, setMetrics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchMetrics = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch initial data
            const { data, error } = await supabase
                .from('analytics_metrics')
                .select('*')
                .eq('agent_id', user.id)
                .single();

            if (data) {
                setMetrics(data as AnalyticsData);
            }
            if (error) {
                console.error('Error fetching analytics:', error);
                setError(true);
            }
            setLoading(false);

            // Realtime subscription
            const channel = supabase
                .channel(`analytics:${user.id}`)
                .on('postgres_changes',
                    { event: '*', schema: 'public', table: 'analytics_metrics', filter: `agent_id=eq.${user.id}` },
                    (payload) => {
                        console.log('Realtime analytics update:', payload);
                        setMetrics(payload.new as AnalyticsData);
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        };

        void fetchMetrics();
    }, [supabase]);

    if (loading) {
        return <AnalyticsSkeleton />;
    }

    if (error && !metrics) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <AlertCircle size={32} className="text-org" />
                <p className="text-mut font-bold text-sm">Could not load analytics data.</p>
                <button onClick={() => { setError(false); setLoading(true); }} className="inline-flex items-center justify-center gap-2 font-extrabold text-[13px] tracking-[0.025em] uppercase px-5 py-3 transition-colors active:translate-y-px bg-blue text-white hover:bg-blue2">
                    <RefreshCw size={14} /> Try Again
                </button>
            </div>
        );
    }

    // Default if no data
    const data = metrics || {
        total_active_clients: 0,
        total_volume: 0,
        projected_gci: 0,
        funnel_distribution: {}
    };

    // Helper for currency
    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    // Funnel Data Sort Order
    const funnelOrder = ['lead', 'pre_approval', 'house_hunting', 'under_contract', 'closed'];
    const funnelLabels: Record<string, string> = {
        'lead': 'Lead',
        'pre_approval': 'Pre-Approval',
        'house_hunting': 'House Hunting',
        'under_contract': 'Under Contract',
        'closed': 'Closed'
    };

    const maxFunnelValue = Math.max(...Object.values(data.funnel_distribution), 1);

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-panel p-6 border border-line relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.07] group-hover:opacity-[0.12] transition-opacity">
                        <Users size={64} className="text-blue" />
                    </div>
                    <div className="text-[40px] font-black tracking-[-0.04em] leading-none text-blue2">
                        <CountUp end={data.total_active_clients} onView separator={false} />
                    </div>
                    <div className="font-mono text-[10px] text-mut mt-2 uppercase tracking-[0.08em] flex items-center gap-1.5">
                        <Users size={12} /> Active Clients
                    </div>
                </div>

                <div className="bg-panel p-6 border border-line relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.07] group-hover:opacity-[0.12] transition-opacity">
                        <TrendingUp size={64} className="text-lime" />
                    </div>
                    <div className="text-[40px] font-black tracking-[-0.04em] leading-none text-lime">
                        <CountUp end={data.total_volume} onView prefix="$" />
                    </div>
                    <div className="font-mono text-[10px] text-mut mt-2 uppercase tracking-[0.08em] flex items-center gap-1.5">
                        <TrendingUp size={12} /> Volume (Active)
                    </div>
                </div>

                <div className="bg-panel p-6 border border-line relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.07] group-hover:opacity-[0.12] transition-opacity">
                        <DollarSign size={64} className="text-org" />
                    </div>
                    <div className="text-[40px] font-black tracking-[-0.04em] leading-none text-org">
                        <CountUp end={data.projected_gci} onView prefix="$" />
                    </div>
                    <div className="font-mono text-[10px] text-mut mt-2 uppercase tracking-[0.08em] flex items-center gap-1.5">
                        <DollarSign size={12} /> Projected GCI
                    </div>
                </div>
            </div>

            {/* Pipeline Visuals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Funnel Chart */}
                <div className="bg-panel p-6 border border-line">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-black text-[13px] uppercase tracking-[-0.01em] text-ink">Pipeline Distribution</h3>
                        <Target size={18} className="text-mut2" />
                    </div>

                    <div className="flex flex-col">
                        {funnelOrder.map(status => {
                            const count = data.funnel_distribution[status] || 0;
                            const percentage = (count / maxFunnelValue) * 100;

                            return (
                                <div key={status} className="py-3 border-b border-line last:border-0">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-mono text-[11px] text-mut">{funnelLabels[status]}</span>
                                        <span className="text-[16px] font-black tracking-[-0.02em] text-ink">{count}</span>
                                    </div>
                                    <div className="lp-track">
                                        <i style={{ width: `${Math.max(percentage, 2)}%`, background: 'var(--blue)', opacity: percentage > 0 ? 1 : 0.3 }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Activity or Goals (Placeholder for deeper analytics) */}
                <div className="bg-bg2 border border-line text-ink p-6 flex flex-col justify-between relative overflow-hidden">
                    <div className="grid-bg absolute inset-0" style={{ opacity: 0.25 }} />

                    <div className="relative z-10">
                        <h3 className="font-black text-[13px] uppercase tracking-[-0.01em] mb-1.5">Monthly <em className="not-italic text-lime">Goal</em></h3>
                        <p className="text-mut text-[12px] mb-8">Track your progress towards your monthly GCI target.</p>

                        <div className="mb-2 flex justify-between items-end">
                            <span className="text-3xl font-black tracking-[-0.03em] text-lime">{formatCurrency(data.projected_gci)}</span>
                            <span className="font-mono text-[11px] text-mut2 mb-1">/ {formatCurrency(monthlyGoal)}</span>
                        </div>

                        <div className="lp-track mb-8" style={{ height: 6 }}>
                            <i style={{ width: `${Math.min((data.projected_gci / monthlyGoal) * 100, 100)}%`, background: 'linear-gradient(90deg,var(--blue),var(--lime))' }} />
                        </div>
                    </div>

                    <div className="relative z-10 bg-panel border border-line p-4">
                        <p className="font-mono text-[10px] text-blue2 uppercase tracking-[0.1em] mb-1.5">Insight</p>
                        <p className="text-[13px] text-mut leading-relaxed">
                            You have <span className="text-ink font-bold">{data.total_active_clients} active deals</span>.
                            Closing just 2 more leads this month typically keeps you on track for the annual goal.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
