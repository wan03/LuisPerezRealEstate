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
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [loading, setLoading] = useState(true);
    const [transactionId, setTransactionId] = useState<string | null>(null);
    const [error, setError] = useState(false);

    const fetchTransaction = useCallback(async () => {
        if (!clientId) return;
        setLoading(true);
        setError(false);

        const supabase = createClient();

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

        const supabase = createClient();

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
            <div className="bg-panel border border-line p-12 flex flex-col items-center justify-center gap-4">
                <AlertCircle className="text-org" size={32} />
                <p className="text-mut font-bold text-sm">Could not load your transaction roadmap.</p>
                <button onClick={() => { setError(false); setLoading(true); void fetchTransaction().catch(() => { setError(true); setLoading(false); }); }} className="inline-flex items-center justify-center gap-2 font-extrabold text-[13px] tracking-[0.025em] uppercase px-5 py-3 transition-colors active:translate-y-px bg-blue text-white hover:bg-blue2">
                    <RefreshCw size={14} /> Try Again
                </button>
            </div>
        );
    }

    if (milestones.length === 0) {
        return (
            <div className="bg-panel border border-line p-12 flex flex-col items-center justify-center">
                <p className="text-mut2 font-mono text-[11px] tracking-[0.1em] uppercase">No active transaction plan found.</p>
            </div>
        );
    }

    const completedCount = milestones.filter(m => m.status === 'completed').length;
    const activeCount = milestones.filter(m => m.status === 'active').length;
    const fillPct = milestones.length > 1
        ? Math.min(100, ((completedCount + (activeCount > 0 ? 0.5 : 0)) / (milestones.length - 1)) * 100)
        : 0;

    return (
        <div className="space-y-8">
            <div className="bg-panel border border-line corner-brackets relative overflow-hidden p-8">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-panel2 border border-line p-2">
                            <Clock className="text-blue2" size={20} />
                        </div>
                        <h2 className="text-xl md:text-2xl font-black uppercase tracking-[-0.03em] text-ink">Transaction <em className="not-italic text-lime">Roadmap</em></h2>
                    </div>
                    {role !== 'client' && (
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-mut2">Status</span>
                            <div className="relative">
                                <select
                                    className="appearance-none bg-panel2 hover:bg-[#222b3a] text-ink font-mono text-[11px] font-bold uppercase tracking-[0.06em] px-4 py-2 pr-8 border border-line cursor-pointer outline-none focus:border-blue transition-colors"
                                    value={milestones.find(m => m.status === 'active')?.id || (milestones.every(m => m.status === 'completed') ? 'closed' : 'lead')}
                                    onChange={(e) => updateStatus(e.target.value)}
                                >
                                    {TRANSACTION_STEPS.map(step => (
                                        <option key={step} value={step}>
                                            {step.replace(/_/g, ' ')}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-mut">
                                    <ChevronRight size={14} className="rotate-90" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="relative space-y-0">
                    {/* Connecting line + lime/blue fill */}
                    <div className="absolute left-[27px] top-2 bottom-6 w-[2px] bg-line" />
                    <div className="absolute left-[27px] top-2 w-[2px] transition-[height] duration-500" style={{ height: `calc((100% - 1.5rem) * ${fillPct / 100})`, background: 'linear-gradient(180deg,var(--lime),var(--blue))' }} />

                    {milestones.map((milestone) => (
                        <div key={milestone.id} className="relative pl-16 pb-12 last:pb-0 group">
                            <button
                                onClick={() => updateStatus(milestone.id)}
                                disabled={role === 'client'}
                                title={milestone.title}
                                className={`absolute left-0 top-0 w-14 h-14 flex items-center justify-center z-10 transition-colors duration-300 ${milestone.status === 'completed' ? 'bg-lime text-bg' :
                                    milestone.status === 'active' ? 'bg-blue text-white animate-pulse' :
                                        'bg-panel2 border border-line text-mut2'
                                    } ${role !== 'client' ? 'cursor-pointer hover:opacity-90 active:translate-y-px' : 'cursor-default'}`}>
                                {milestone.status === 'completed' ? <CheckCircle2 size={24} /> : (ICON_MAP[milestone.icon_name] || <Circle size={20} />)}
                            </button>

                            <div className={`transition-opacity duration-300 ${milestone.status === 'pending' ? 'opacity-50' : 'opacity-100'}`}>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h3 className={`text-lg font-extrabold uppercase tracking-[-0.01em] ${milestone.status === 'completed' ? 'text-lime' :
                                            milestone.status === 'active' ? 'text-blue2' : 'text-mut'
                                            }`}>
                                            {milestone.title}
                                        </h3>
                                        <p className="text-mut font-mono text-[11px] tracking-[0.04em] mt-1.5">{milestone.description}</p>
                                    </div>

                                    {milestone.learn_more_slug && (
                                        <Link
                                            href={`/learn/${milestone.learn_more_slug}`}
                                            className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-[0.08em] text-blue2 bg-panel2 px-3 py-2 border border-line hover:border-blue transition-colors uppercase"
                                        >
                                            <Info size={14} /> Learn More <ChevronRight size={14} />
                                        </Link>
                                    )}
                                </div>

                                {milestone.status === 'active' && (
                                    <div className="mt-3 flex items-center gap-2">
                                        <span className="lp-live-dot" />
                                        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-blue2">
                                            In Progress · Current Step
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
