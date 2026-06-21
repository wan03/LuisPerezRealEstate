'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Download, ShieldCheck, Loader2, Filter, Search, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/components/Toast';

interface Doc {
    id: string;
    name: string;
    file_path: string;
    status: 'pending' | 'approved' | 'signed' | 'uploaded';
    category: 'contract' | 'disclosure' | 'inspection' | 'finance' | 'other' | 'uncategorized';
    created_at: string;
    uploaded_by?: string; // To distinguish agent uploads vs client uploads if we add that later
}

const CATEGORIES = [
    { id: 'all', label: 'All Documents' },
    { id: 'contract', label: 'Contracts' },
    { id: 'disclosure', label: 'Disclosures' },
    { id: 'inspection', label: 'Inspections' },
    { id: 'finance', label: 'Financials' },
    { id: 'other', label: 'Other' },
];

const STATUS_Styles = {
    pending: 'bg-panel2 text-mut border-line',
    approved: 'bg-panel2 text-lime border-line',
    signed: 'bg-panel2 text-blue2 border-line',
    uploaded: 'bg-panel2 text-mut2 border-line',
};

export default function DocumentVault() {
    const supabase = createClient();
    const { addToast } = useToast();
    const [docs, setDocs] = useState<Doc[]>([]);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchDocs();
    }, []);

    const fetchDocs = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .eq('client_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching docs:', error);
            return;
        }
        if (data) setDocs(data as Doc[]); // Cast safely as we know the schema
    };

    const handleUpload = async (file: File) => {
        setIsUploading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                addToast('error', 'Please sign in.');
                return;
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('client-docs')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // Determine category based on filename (simple auto-tagging)
            let category = 'other';
            const lowerName = file.name.toLowerCase();
            if (lowerName.includes('contract') || lowerName.includes('offer')) category = 'contract';
            else if (lowerName.includes('disclosure')) category = 'disclosure';
            else if (lowerName.includes('inspection') || lowerName.includes('report')) category = 'inspection';
            else if (lowerName.includes('bank') || lowerName.includes('statement') || lowerName.includes('loan')) category = 'finance';

            const { error: dbError } = await supabase.from('documents').insert({
                client_id: user.id,
                name: file.name,
                file_path: fileName,
                status: 'uploaded',
                category: category
            });

            if (dbError) throw dbError;

            await fetchDocs();
            addToast('success', 'Document uploaded securely.');
        } catch (error) {
            console.error('Upload failed:', error);
            addToast('error', 'Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const filteredDocs = docs.filter(doc => {
        const matchesCategory = filter === 'all' || doc.category === filter;
        const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <CheckCircle2 size={12} />;
            case 'pending': return <Clock size={12} />;
            case 'signed': return <ShieldCheck size={12} />;
            default: return <FileText size={12} />;
        }
    };

    return (
        <div className="space-y-6 animate-slide-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-[-0.03em] text-ink">Document <em className="not-italic text-lime">Vault</em></h2>
                    <p className="font-mono text-[11px] tracking-[0.04em] text-mut mt-1.5">Secure storage for all your transaction files.</p>
                </div>
                <div className="flex flex-wrap items-center gap-1 bg-panel p-1 border border-line">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setFilter(cat.id)}
                            className={`px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.06em] transition-colors ${filter === cat.id
                                    ? 'bg-lime text-accentink'
                                    : 'text-mut hover:bg-panel2 hover:text-ink'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upload Area */}
                <div className="lg:col-span-1">
                    <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                            const file = e.dataTransfer.files?.[0];
                            if (file) handleUpload(file);
                        }}
                        className={`bg-panel p-8 border-2 border-dashed text-center cursor-pointer transition-colors h-full flex flex-col items-center justify-center gap-6 ${isDragging ? 'border-lime bg-panel2' : 'border-line hover:border-mut'
                            }`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                        />
                        <div className="w-16 h-16 bg-panel2 text-lime flex items-center justify-center">
                            {isUploading ? <Loader2 className="lp-spinner" style={{ width: 32, height: 32 }} /> : <Upload size={32} />}
                        </div>
                        <div>
                            <h3 className="text-lg font-black uppercase tracking-[-0.02em] text-ink">Upload New File</h3>
                            <p className="font-mono text-[10px] text-mut uppercase tracking-[0.08em] mt-1.5">Drag & Drop or Click</p>
                        </div>
                    </div>
                </div>

                {/* File List */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mut2 z-10" size={18} />
                        <input
                            type="text"
                            placeholder="Search documents..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="lp-input w-full pl-11 pr-4 py-3 text-[14px]"
                        />
                    </div>

                    <div className="bg-panel border border-line overflow-hidden min-h-[400px]">
                        {filteredDocs.length > 0 ? (
                            <div className="divide-y divide-[var(--line)]">
                                {filteredDocs.map((doc) => (
                                    <div key={doc.id} className="p-4 hover:bg-panel2 transition-colors flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-panel2 text-mut flex items-center justify-center font-mono text-[11px] font-bold flex-none">
                                                {doc.file_path.split('.').pop()?.toUpperCase() || 'DOC'}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-ink">{doc.name}</h4>
                                                <div className="flex items-center gap-3 mt-1.5">
                                                    <span className="font-mono text-[10px] text-mut2">{new Date(doc.created_at).toLocaleDateString()}</span>
                                                    <span className={`font-mono text-[10px] font-bold uppercase tracking-[0.08em] px-2 py-0.5 border flex items-center gap-1 ${STATUS_Styles[doc.status] || STATUS_Styles.uploaded}`}>
                                                        {getStatusIcon(doc.status)} {doc.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                const { data } = await supabase.storage.from('client-docs').createSignedUrl(doc.file_path, 60);
                                                if (data) window.open(data.signedUrl, '_blank');
                                            }}
                                            className="w-10 h-10 hover:bg-panel text-mut2 hover:text-blue2 flex items-center justify-center transition-colors"
                                            title="Download"
                                        >
                                            <Download size={20} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                                <FileText size={48} className="text-mut2 opacity-40 mb-4" />
                                <p className="text-mut font-mono uppercase tracking-[0.1em] text-[11px]">No documents found</p>
                                <p className="text-mut2 text-xs mt-2">Try adjusting your filters or upload a new file.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
