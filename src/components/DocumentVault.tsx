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
    pending: 'bg-amber-50 text-amber-600 border-amber-100',
    approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    signed: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    uploaded: 'bg-slate-50 text-slate-500 border-slate-100',
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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Document Vault</h2>
                    <p className="text-slate-500 font-medium mt-1">Secure storage for all your transaction files.</p>
                </div>
                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setFilter(cat.id)}
                            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wide transition-all ${filter === cat.id
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                        className={`bg-white rounded-3xl p-8 border-2 border-dashed text-center cursor-pointer transition-all h-full flex flex-col items-center justify-center gap-6 ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
                            }`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                        />
                        <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                            {isUploading ? <Loader2 className="animate-spin" size={32} /> : <Upload size={32} />}
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900">Upload New File</h3>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wide mt-1">Drag & Drop or Click</p>
                        </div>
                    </div>
                </div>

                {/* File List */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search documents..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-3 font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden min-h-[400px]">
                        {filteredDocs.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {filteredDocs.map((doc) => (
                                    <div key={doc.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold">
                                                {doc.file_path.split('.').pop()?.toUpperCase() || 'DOC'}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900">{doc.name}</h4>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-xs text-slate-400 font-medium">{new Date(doc.created_at).toLocaleDateString()}</span>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border flex items-center gap-1 ${STATUS_Styles[doc.status] || STATUS_Styles.uploaded}`}>
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
                                            className="w-10 h-10 rounded-xl hover:bg-indigo-50 text-slate-300 hover:text-indigo-600 flex items-center justify-center transition-all"
                                            title="Download"
                                        >
                                            <Download size={20} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                                <FileText size={48} className="text-slate-200 mb-4" />
                                <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No documents found</p>
                                <p className="text-slate-400 text-xs mt-2">Try adjusting your filters or upload a new file.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
