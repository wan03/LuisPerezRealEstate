'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { CheckCircle2, Circle, Clock, ShieldCheck, Wallet, Search, HardHat, FileCheck, Info, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import { CommandCenterSkeleton } from '@/components/Skeletons';
import { createClient } from '@/utils/supabase/client';

export type MilestoneStatus = 'pending' | 'active' | 'completed';

export interface Milestone {
    id: string; // Using step name as ID for UI consistency
    title: string;
    status: MilestoneStatus;
    icon_name: string;
    description: string;
    learn_more_slug?: string;
    order: number;
}

const ICON_MAP: Record<string, React.ReactNode> = {
    'Search': <Search size={20} />,
    'ShieldCheck': <ShieldCheck size={20} />,
    'FileCheck': <FileCheck size={20} />,
    'HardHat': <HardHat size={20} />,
    'Wallet': <Wallet size={20} />,
    'CheckCircle2': <CheckCircle2 size={20} />,
};

// Define the linear progression of transaction statuses
const TRANSACTION_STEPS = [
    'lead',
    'pre_approval',
    'house_hunting',
    'under_contract',
    'inspection',
    'underwriting',
    'clear_to_close',
    'closed',
    'archived'
];

const UI_MILESTONES = [
    { id: 'house_hunting', title: 'Discovery & Listing Search', icon_name: 'Search', description: 'Browsing matches in Highlands County.', learn_more_slug: 'discovery-guide', order: 1 },
    { id: 'pre_approval', title: 'Prequalification', icon_name: 'ShieldCheck', description: 'Loan Officer verified funds.', learn_more_slug: 'prequal-101', order: 2 },
    { id: 'under_contract', title: 'Offer Accepted', icon_name: 'FileCheck', description: 'Contract signed.', learn_more_slug: 'contract-to-close', order: 3 },
    { id: 'inspection', title: 'Inspection Period', icon_name: 'HardHat', description: 'Scheduled inspections.', learn_more_slug: 'inspection-tips', order: 4 },
    { id: 'underwriting', title: 'Appraisal & Financing', icon_name: 'Wallet', description: 'Lender reviewing property value.', learn_more_slug: 'appraisal-basics', order: 5 },
    { id: 'closed', title: 'Closing Day', icon_name: 'CheckCircle2', description: 'The keys are yours!', learn_more_slug: 'closing-day-checklist', order: 6 },
];

export default function CommandCenter({ role = 'client', clientId }: { role?: 'client' | 'agent' | 'loan_officer' | 'admin', clientId?: string }) {
    const supabase = createClient();
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [loading, setLoading] = useState(true);
    const [transactionId, setTransactionId] = useState<string | null>(null);
    const [error, setError] = useState(false);

    const fetchTransaction = useCallback(async () => {
        if (!clientId) return;
        setLoading(true);
        setError(false);

        // Fetch the active transaction for this client
        const { data } = await supabase
            .from('transactions')
            .select('id, status')
            .eq('client_id', clientId)
            .maybeSingle();

        if (data) {
            setTransactionId(data.id);
            const currentStatusIndex = TRANSACTION_STEPS.indexOf(data.status);

            // Map UI milestones based on current transaction status
            const mappedMilestones = UI_MILESTONES.map(m => {
                const milestoneIndex = TRANSACTION_STEPS.indexOf(m.id);
                let status: MilestoneStatus = 'pending';

                if (currentStatusIndex > milestoneIndex) {
                    status = 'completed';
                } else if (currentStatusIndex === milestoneIndex) {
                    status = 'active';
                }

                // Special handling: if closed, everything before is completed
                if (data.status === 'closed' || data.status === 'archived') {
                    status = 'completed';
                }

                return {
                    ...m,
                    status
                };
            });
            setMilestones(mappedMilestones);
        } else {
            // No transaction found
            setMilestones([]);
        }
        setLoading(false);
    }, [clientId]);

    useEffect(() => {
        void Promise.resolve().then(() => fetchTransaction().catch(() => {
            setError(true);
            setLoading(false);
        }));
    }, [fetchTransaction]);

    const updateStatus = async (stepId: string) => {
        if (role === 'client' || !transactionId) return;

        // Find the milestone
        const milestone = milestones.find(m => m.id === stepId);
        if (!milestone) return;

        // Optimistic update
        const newStatusIndex = TRANSACTION_STEPS.indexOf(stepId);

        // Update local state
        setMilestones(prev => prev.map(m => {
            const mIndex = TRANSACTION_STEPS.indexOf(m.id);
            if (mIndex < newStatusIndex) return { ...m, status: 'completed' };
            if (mIndex === newStatusIndex) return { ...m, status: 'active' };
            return { ...m, status: 'pending' };
        }));

        // Update database
        const { error } = await supabase
            .from('transactions')
            .update({ status: stepId, updated_at: new Date().toISOString() })
            .eq('id', transactionId);

        if (error) {
            console.error('Update failed:', error);
            fetchTransaction(); // Revert
        }
    };

    if (loading) {
        return <CommandCenterSkeleton />;
    }

    if (error) {
        return (
            <div className="bg-white rounded-3xl p-12 shadow-sm border border-red-200 flex flex-col items-center justify-center gap-4">
                <AlertCircle className="text-red-400" size={32} />
                <p className="text-slate-500 font-bold text-sm">Could not load your transaction roadmap.</p>
                <button onClick={() => { setError(false); setLoading(true); void fetchTransaction().catch(() => { setError(true); setLoading(false); }); }} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all">
                    <RefreshCw size={14} /> Try Again
                </button>
            </div>
        );
    }

    if (milestones.length === 0) {
        return (
            <div className="bg-white rounded-3xl p-12 shadow-sm border border-slate-200 flex flex-col items-center justify-center">
                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No active transaction plan found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 relative overflow-hidden">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-900 p-2 rounded-lg">
                            <Clock className="text-white" size={20} />
                        </div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Transaction Roadmap</h2>
                    </div>
                    {role !== 'client' && (
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status:</span>
                            <div className="relative">
                                <select
                                    className="appearance-none bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-black uppercase px-4 py-2 pr-8 rounded-xl border border-indigo-100 cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                    value={milestones.find(m => m.status === 'active')?.id || (milestones.every(m => m.status === 'completed') ? 'closed' : 'lead')}
                                    onChange={(e) => updateStatus(e.target.value)}
                                >
                                    {TRANSACTION_STEPS.map(step => (
                                        <option key={step} value={step}>
                                            {step.replace(/_/g, ' ')}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-indigo-700">
                                    <ChevronRight size={14} className="rotate-90" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="relative space-y-0 text-black">
                    <div className="absolute left-[27px] top-2 bottom-6 w-0.5 bg-slate-100" />

                    {milestones.map((milestone) => (
                        <div key={milestone.id} className="relative pl-16 pb-12 last:pb-0 group">
                            <button
                                onClick={() => updateStatus(milestone.id)}
                                disabled={role === 'client'}
                                title={milestone.title}
                                className={`absolute left-0 top-0 w-14 h-14 rounded-full border-4 border-white flex items-center justify-center z-10 shadow-sm transition-all duration-500 ${milestone.status === 'completed' ? 'bg-emerald-500 text-white shadow-emerald-100' :
                                    milestone.status === 'active' ? 'bg-indigo-600 text-white shadow-indigo-100 animate-pulse' :
                                        'bg-slate-100 text-slate-400'
                                    } ${role !== 'client' ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-default'}`}>
                                {milestone.status === 'completed' ? <CheckCircle2 size={24} /> : (ICON_MAP[milestone.icon_name] || <Circle size={20} />)}
                            </button>

                            <div className={`transition-all duration-500 ${milestone.status === 'pending' ? 'opacity-50' : 'opacity-100'}`}>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h3 className={`text-xl font-black ${milestone.status === 'completed' ? 'text-emerald-700' :
                                            milestone.status === 'active' ? 'text-slate-800' : 'text-slate-400'
                                            }`}>
                                            {milestone.title}
                                        </h3>
                                        <p className="text-slate-500 text-sm font-medium mt-1">{milestone.description}</p>
                                    </div>

                                    {milestone.learn_more_slug && (
                                        <Link
                                            href={`/learn/${milestone.learn_more_slug}`}
                                            className="inline-flex items-center gap-1.5 text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-2 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-all uppercase tracking-wider"
                                        >
                                            <Info size={14} /> Learn More <ChevronRight size={14} />
                                        </Link>
                                    )}
                                </div>

                                {milestone.status === 'active' && (
                                    <div className="mt-4 flex gap-2">
                                        <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase px-2 py-1 rounded-md border border-indigo-100 italic">
                                            In Progress
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
