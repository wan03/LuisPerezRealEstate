'use client';

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { X, Loader2, DollarSign, Percent, User, Mail, Home } from 'lucide-react';

interface NewTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function NewTransactionModal({ isOpen, onClose, onSuccess }: NewTransactionModalProps) {
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        property: '',
        status: 'lead',
        estimatedValue: '',
        commissionRate: '3.0'
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Create or Get User (Simplified: We just create a profile row for now if not exists? 
            // Actually, profiles are linked to auth.users. 
            // For this MVP, we might need to create a "shadow" client or just insert into profiles if we don't enforce auth linkage yet.
            // Looking at schema: profiles.id is uuid. 
            // Let's create a new UUID for the client.

            // Wait, usually client creation involves invitation.
            // For this "Pipeline Control" tool, we might just be creating a placeholder profile.

            const clientId = crypto.randomUUID();

            // Insert Profile
            const { error: profileError } = await supabase.from('profiles').insert({
                id: clientId,
                full_name: formData.fullName,
                role: 'client',
                // email: formData.email // profiles structure check needed? It usually just has basic info
            });

            if (profileError) {
                // If row level security blocks this, we might need a different approach.
                // Assuming agent can insert clients.
                throw new Error(`Profile Error: ${profileError.message}`);
            }

            // 2. Create Transaction
            const { error: txError } = await supabase.from('transactions').insert({
                client_id: clientId,
                custom_property_name: formData.property,
                status: formData.status,
                progress: 10, // Default start
                estimated_value: parseFloat(formData.estimatedValue) || 0,
                commission_rate: parseFloat(formData.commissionRate) || 3.0
            });

            if (txError) throw new Error(`Transaction Error: ${txError.message}`);

            // 3. Create Chat Room
            await supabase.rpc('create_chat_room', {
                name: `Chat with ${formData.fullName}`,
                client_id: clientId
            });

            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Error creating transaction:', err);
            setError(err.message || 'Failed to create transaction');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur p-4">
            <div className="bg-panel border border-line corner-brackets w-full max-w-lg overflow-hidden">
                <div className="bg-bg2 p-5 border-b border-line flex justify-between items-center">
                    <div>
                        <h3 className="font-black text-xl uppercase tracking-[-0.03em] text-ink">New <em className="not-italic text-lime">Transaction</em></h3>
                        <p className="font-mono text-[10px] text-mut tracking-[0.1em] uppercase mt-1">Add Client to Pipeline</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-panel2 transition-colors text-mut hover:text-ink">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-panel2 border border-org/40 text-org p-3 text-sm font-bold">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="block font-mono text-[10px] tracking-[0.1em] uppercase text-mut">Client Name</label>
                            <div className="relative">
                                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mut2 z-10" />
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Michael Scott"
                                    className="lp-input w-full pl-9 pr-3 py-3 text-[14px]"
                                    value={formData.fullName}
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block font-mono text-[10px] tracking-[0.1em] uppercase text-mut">Property / Deal Name</label>
                            <div className="relative">
                                <Home size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mut2 z-10" />
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. 1725 Slough Avenue"
                                    className="lp-input w-full pl-9 pr-3 py-3 text-[14px]"
                                    value={formData.property}
                                    onChange={e => setFormData({ ...formData, property: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="block font-mono text-[10px] tracking-[0.1em] uppercase text-mut">Est. Value ($)</label>
                                <div className="relative">
                                    <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-lime z-10" />
                                    <input
                                        type="number"
                                        min="0"
                                        step="1000"
                                        placeholder="500000"
                                        className="lp-input w-full pl-9 pr-3 py-3 text-[14px]"
                                        value={formData.estimatedValue}
                                        onChange={e => setFormData({ ...formData, estimatedValue: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="block font-mono text-[10px] tracking-[0.1em] uppercase text-mut">Commission (%)</label>
                                <div className="relative">
                                    <Percent size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue2 z-10" />
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        placeholder="3.0"
                                        className="lp-input w-full pl-9 pr-3 py-3 text-[14px]"
                                        value={formData.commissionRate}
                                        onChange={e => setFormData({ ...formData, commissionRate: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block font-mono text-[10px] tracking-[0.1em] uppercase text-mut">Initial Status</label>
                            <select
                                className="lp-input w-full px-3 py-3 text-[14px] uppercase"
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="lead">Lead</option>
                                <option value="pre_approval">Pre-Approval</option>
                                <option value="house_hunting">House Hunting</option>
                                <option value="under_contract">Under Contract</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full inline-flex items-center justify-center gap-2 bg-lime text-accentink hover:bg-lime2 p-4 font-extrabold uppercase tracking-[0.025em] text-[13px] transition-colors active:translate-y-px disabled:opacity-70 disabled:pointer-events-none"
                        >
                            {loading ? <Loader2 className="lp-spinner" style={{ width: 20, height: 20 }} /> : 'Create Transaction'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
