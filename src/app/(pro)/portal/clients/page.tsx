'use client';

import React, { useState, useEffect, useCallback } from 'react';
import CommandCenter from '@/components/CommandCenter';
import TriadChat from '@/components/TriadChat';
import NewTransactionModal from '@/components/NewTransactionModal';
import { Search, Filter, Plus, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface Client {
    id: string;
    full_name: string;
    property?: string;
    status: string;
    progress: number;
}

export default function ClientsPage() {
    const supabase = createClient();
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);
    const [roomId, setRoomId] = useState<string | null>(null);
    const [isNewTxModalOpen, setIsNewTxModalOpen] = useState(false);

    const fetchClients = useCallback(async () => {
        setLoading(true);
        const { data } = await supabase
            .from('profiles')
            .select(`
                id, 
                full_name, 
                role,
                transactions:transactions(
                    id,
                    status,
                    progress,
                    custom_property_name,
                    listing:listings(title)
                )
            `)
            .eq('role', 'client');

        if (data) {
            const mapped = data
                .filter(c => c.transactions && c.transactions.length > 0)
                .map(c => {
                    const tx = c.transactions[0] as unknown as {
                        id: string,
                        status: string,
                        progress: number;
                        custom_property_name: string | null;
                        listing: { title: string } | null;
                    };

                    const statusMap: Record<string, string> = {
                        'lead': 'Lead',
                        'pre_approval': 'Pre-Approval',
                        'house_hunting': 'House Hunting',
                        'under_contract': 'Under Contract',
                        'inspection': 'Inspection',
                        'underwriting': 'Underwriting',
                        'clear_to_close': 'Clear to Close',
                        'closed': 'Closed',
                        'archived': 'Archived'
                    };

                    return {
                        id: c.id,
                        full_name: c.full_name,
                        property: (tx.listing && tx.listing.title) || tx.custom_property_name || 'No Property',
                        status: statusMap[tx.status] || tx.status,
                        progress: tx.progress || 0
                    };
                });
            setClients(mapped);
            if (mapped.length > 0 && !selectedClient) setSelectedClient(mapped[0]);
        }
        setLoading(false);
    }, [selectedClient, supabase]);

    useEffect(() => {
        void Promise.resolve().then(() => fetchClients());
    }, [fetchClients]);

    const resolveRoom = useCallback(async (client: Client) => {
        setRoomId(null);
        const { data: roomId, error } = await supabase.rpc('create_chat_room', {
            name: `Chat with ${client.full_name}`,
            client_id: client.id
        });

        if (roomId) {
            setRoomId(roomId);
        } else {
            console.error('Failed to resolve room:', error);
        }
    }, [supabase]);

    useEffect(() => {
        if (selectedClient) {
            void resolveRoom(selectedClient);
        }
    }, [selectedClient, resolveRoom]);

    const activeCount = clients.length;
    const avgProgress = clients.length
        ? Math.round(clients.reduce((sum, c) => sum + (c.progress || 0), 0) / clients.length)
        : 0;
    const closingCount = clients.filter(c => c.status === 'Clear to Close' || c.status === 'Closed').length;

    return (
        <div className="flex-1 flex flex-col bg-bg text-ink">
            {/* Header with New Transaction Button */}
            <header className="bg-bg2 border-b border-line px-7 h-[60px] flex justify-between items-center gap-4 sticky top-0 z-40">
                <div className="flex items-center gap-2 bg-panel border border-line px-3.5 py-2 flex-1 max-w-[320px]">
                    <Search className="text-mut2 flex-none" size={14} />
                    <input
                        type="text"
                        placeholder="Search clients or properties..."
                        className="w-full bg-transparent border-none outline-none text-[13px] text-ink placeholder:text-mut2"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsNewTxModalOpen(true)}
                        className="inline-flex items-center justify-center gap-2 font-extrabold text-[13px] tracking-[0.025em] uppercase px-5 py-3 transition-colors active:translate-y-px bg-lime text-accentink hover:bg-lime2"
                    >
                        <Plus size={16} /> New Transaction
                    </button>
                </div>
            </header>

            <div className="p-7">
                {/* Page header */}
                <div className="flex items-end justify-between gap-4 mb-6">
                    <div>
                        <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-mut2">01 / Clients</p>
                        <h1 className="text-2xl font-black uppercase tracking-[-0.03em] leading-none mt-1">
                            Active <span className="text-lime">Pipeline</span>
                        </h1>
                        <p className="font-mono text-[11px] text-mut mt-1.5">Lakeland · Tampa Bay</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-panel border border-line p-5 corner-brackets">
                        <div className="text-[40px] font-black tracking-[-0.04em] leading-none text-blue2">{activeCount}</div>
                        <div className="font-mono text-[10px] tracking-[0.08em] uppercase text-mut mt-1.5">Active Deals</div>
                    </div>
                    <div className="bg-panel border border-line p-5">
                        <div className="text-[40px] font-black tracking-[-0.04em] leading-none text-lime">{avgProgress}%</div>
                        <div className="font-mono text-[10px] tracking-[0.08em] uppercase text-mut mt-1.5">Avg Progress</div>
                    </div>
                    <div className="bg-panel border border-line p-5">
                        <div className="text-[40px] font-black tracking-[-0.04em] leading-none text-org">{closingCount}</div>
                        <div className="font-mono text-[10px] tracking-[0.08em] uppercase text-mut mt-1.5">Near / At Close</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    {/* Client List Section */}
                    <div className="xl:col-span-4 space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-sm font-black uppercase tracking-[-0.01em]">Active Pipeline</h2>
                            <Filter className="text-mut2" size={18} />
                        </div>

                        <div className="space-y-3">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 bg-panel border border-dashed border-line">
                                    <div className="lp-spinner w-8 h-8 mb-4" />
                                    <p className="text-mut font-mono uppercase text-[10px] tracking-[0.1em]">Loading Pipeline...</p>
                                </div>
                            ) : clients.length === 0 ? (
                                <div className="p-8 text-center bg-panel border border-line">
                                    <p className="text-mut font-mono text-[11px]">No active clients found.</p>
                                </div>
                            ) : (
                                clients.map((client) => (
                                    <div
                                        key={client.id}
                                        onClick={() => setSelectedClient(client)}
                                        className={`p-5 border transition-colors cursor-pointer ${selectedClient?.id === client.id
                                            ? 'bg-panel border-blue'
                                            : 'bg-panel border-line hover:border-blue2'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-4 gap-3">
                                            <h4 className="font-extrabold uppercase tracking-[-0.01em] text-ink">{client.full_name}</h4>
                                            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.06em] bg-blue/10 px-2 py-1 text-blue2 whitespace-nowrap">{client.status}</span>
                                        </div>
                                        <p className="font-mono text-[10px] text-mut mb-4">{client.property}</p>
                                        <div className="lp-track w-full">
                                            <i className="bg-lime" style={{ width: `${client.progress}%` }} />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Management View */}
                    <div className="xl:col-span-8 space-y-6">
                        {selectedClient ? (
                            <>
                                <div className="bg-panel p-7 border border-line flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                    <div>
                                        <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-mut2 mb-1">Managing</p>
                                        <h2 className="text-2xl font-black uppercase tracking-[-0.03em] leading-none">{selectedClient.full_name}</h2>
                                        <p className="font-mono text-[10px] text-mut mt-1.5">Professional Command Control</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="inline-flex items-center justify-center gap-2 font-extrabold text-[13px] tracking-[0.025em] uppercase px-5 py-3 transition-colors active:translate-y-px bg-panel2 text-ink hover:bg-elev">Archive</button>
                                        <button className="inline-flex items-center justify-center gap-2 font-extrabold text-[13px] tracking-[0.025em] uppercase px-5 py-3 transition-colors active:translate-y-px bg-blue text-white hover:bg-blue2">Share Hub</button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    <CommandCenter role="agent" clientId={selectedClient.id} />
                                    <div className="bg-panel p-2 border border-line">
                                        <TriadChat userRole="agent" roomId={roomId || undefined} />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="h-96 flex items-center justify-center border border-dashed border-line bg-panel">
                                <p className="text-mut font-mono uppercase text-[11px] tracking-[0.1em]">Select a client to manage</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <NewTransactionModal
                isOpen={isNewTxModalOpen}
                onClose={() => setIsNewTxModalOpen(false)}
                onSuccess={() => {
                    fetchClients();
                }}
            />
        </div>
    );
}
