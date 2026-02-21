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

    return (
        <div>
            {/* Header with New Transaction Button */}
            <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-40">
                <div className="relative w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search clients or properties..."
                        className="w-full bg-slate-50 border-none rounded-xl py-2 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsNewTxModalOpen(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
                    >
                        <Plus size={16} /> New Transaction
                    </button>
                </div>
            </header>

            <div className="p-8">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    {/* Client List Section */}
                    <div className="xl:col-span-4 space-y-6 text-black">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-xl font-black uppercase tracking-tighter italic text-black">Active Pipeline</h2>
                            <Filter className="text-slate-400" size={18} />
                        </div>

                        <div className="space-y-4">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                                    <Loader2 size={32} className="text-indigo-600 animate-spin mb-4" />
                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Loading Pipeline...</p>
                                </div>
                            ) : clients.length === 0 ? (
                                <div className="p-8 text-center bg-white rounded-3xl border border-slate-100">
                                    <p className="text-slate-500 font-medium italic">No active clients found.</p>
                                </div>
                            ) : (
                                clients.map((client) => (
                                    <div
                                        key={client.id}
                                        onClick={() => setSelectedClient(client)}
                                        className={`p-5 rounded-2xl border transition-all cursor-pointer ${selectedClient?.id === client.id
                                            ? 'bg-white border-indigo-600 shadow-lg shadow-indigo-100'
                                            : 'bg-white border-slate-100 hover:border-slate-200'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <h4 className="font-black text-slate-900">{client.full_name}</h4>
                                            <span className="text-[10px] font-black uppercase bg-slate-100 px-2 py-1 rounded-md text-slate-500">{client.status}</span>
                                        </div>
                                        <p className="text-xs font-bold text-slate-400 mb-4">{client.property}</p>
                                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${client.progress}%` }} />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Management View */}
                    <div className="xl:col-span-8 space-y-8 text-black">
                        {selectedClient ? (
                            <>
                                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex justify-between items-center text-black">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Managing: {selectedClient.full_name}</h2>
                                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1 italic">Professional Command Control</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="bg-slate-900 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg">Archive</button>
                                        <button className="bg-white border-2 border-slate-900 text-slate-900 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest">Share Hub</button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 text-black">
                                    <CommandCenter role="agent" clientId={selectedClient.id} />
                                    <div className="bg-white p-2 rounded-3xl border border-slate-200">
                                        <TriadChat userRole="agent" roomId={roomId || undefined} />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="h-96 flex items-center justify-center border-4 border-dashed border-slate-200 rounded-3xl">
                                <p className="text-slate-400 font-black uppercase italic">Select a client to manage</p>
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
