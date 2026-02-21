'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { TrendingUp, DollarSign, Users, Target, AlertCircle, RefreshCw } from 'lucide-react';
import { AnalyticsSkeleton } from '@/components/Skeletons';

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
                <AlertCircle size={32} className="text-red-400" />
                <p className="text-slate-500 font-bold text-sm">Could not load analytics data.</p>
                <button onClick={() => { setError(false); setLoading(true); }} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all">
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
        <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users size={64} className="text-indigo-600" />
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
                            <Users size={20} />
                        </div>
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Active Clients</h4>
                    </div>
                    <p className="text-4xl font-black text-slate-900">{data.total_active_clients}</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp size={64} className="text-emerald-500" />
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600">
                            <TrendingUp size={20} />
                        </div>
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Volume (Active)</h4>
                    </div>
                    <p className="text-4xl font-black text-slate-900">{formatCurrency(data.total_volume)}</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign size={64} className="text-amber-500" />
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-amber-50 p-2 rounded-xl text-amber-600">
                            <DollarSign size={20} />
                        </div>
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Projected GCI</h4>
                    </div>
                    <p className="text-4xl font-black text-slate-900">{formatCurrency(data.projected_gci)}</p>
                </div>
            </div>

            {/* Pipeline Visuals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Funnel Chart */}
                <div className="bg-white p-8 rounded-3xl border border-slate-200">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="font-black text-xl text-slate-900">Pipeline Distribution</h3>
                        <Target className="text-slate-300" />
                    </div>

                    <div className="space-y-5">
                        {funnelOrder.map(status => {
                            const count = data.funnel_distribution[status] || 0;
                            const percentage = (count / maxFunnelValue) * 100;

                            return (
                                <div key={status} className="space-y-2">
                                    <div className="flex justify-between text-sm font-bold">
                                        <span className="text-slate-500">{funnelLabels[status]}</span>
                                        <span className="text-slate-900">{count}</span>
                                    </div>
                                    <div className="h-3 bg-slate-50 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-600 rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${Math.max(percentage, 2)}%`, opacity: percentage > 0 ? 1 : 0.3 }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Activity or Goals (Placeholder for deeper analytics) */}
                <div className="bg-slate-900 text-white p-8 rounded-3xl flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full blur-3xl opacity-20 -mr-16 -mt-16 pointer-events-none"></div>

                    <div className="relative z-10">
                        <h3 className="font-black text-xl mb-2">Monthly Goal</h3>
                        <p className="text-slate-400 text-sm font-medium mb-8">Track your progress towards your monthly GCI target.</p>

                        <div className="mb-2 flex justify-between items-end">
                            <span className="text-3xl font-black">{formatCurrency(data.projected_gci)}</span>
                            <span className="text-slate-400 font-bold mb-1">/ {formatCurrency(monthlyGoal)}</span>
                        </div>

                        <div className="h-4 bg-slate-800 rounded-full overflow-hidden mb-8 border border-slate-700">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                                style={{ width: `${Math.min((data.projected_gci / monthlyGoal) * 100, 100)}%` }}
                            />
                        </div>
                    </div>

                    <div className="relative z-10 bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                        <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-1">Insight</p>
                        <p className="text-sm font-medium">
                            You have <span className="text-white font-bold">{data.total_active_clients} active deals</span>.
                            Closing just 2 more leads this month typically keeps you on track for the annual goal.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
