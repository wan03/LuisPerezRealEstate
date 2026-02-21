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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h3 className="font-black text-xl text-slate-900 tracking-tight">New Transaction</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Add Client to Pipeline</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Client Name</label>
                            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
                                <User size={18} className="text-slate-400" />
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Michael Scott"
                                    className="bg-transparent border-none focus:outline-none text-sm font-bold text-slate-700 w-full placeholder:font-medium"
                                    value={formData.fullName}
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Property / Deal Name</label>
                            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
                                <Home size={18} className="text-slate-400" />
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. 1725 Slough Avenue"
                                    className="bg-transparent border-none focus:outline-none text-sm font-bold text-slate-700 w-full placeholder:font-medium"
                                    value={formData.property}
                                    onChange={e => setFormData({ ...formData, property: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Est. Value ($)</label>
                                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                                    <DollarSign size={16} className="text-emerald-500" />
                                    <input
                                        type="number"
                                        min="0"
                                        step="1000"
                                        placeholder="500000"
                                        className="bg-transparent border-none focus:outline-none text-sm font-bold text-slate-700 w-full"
                                        value={formData.estimatedValue}
                                        onChange={e => setFormData({ ...formData, estimatedValue: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Commission (%)</label>
                                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                                    <Percent size={16} className="text-indigo-500" />
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        placeholder="3.0"
                                        className="bg-transparent border-none focus:outline-none text-sm font-bold text-slate-700 w-full"
                                        value={formData.commissionRate}
                                        onChange={e => setFormData({ ...formData, commissionRate: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Initial Status</label>
                            <select
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Create Transaction'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
