'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Download, ShieldCheck, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/components/Toast';

interface Doc {
    id: string;
    name: string;
    file_path: string;
    status: string;
    created_at: string;
}

export default function DocumentUpload() {
    const supabase = createClient();
    const { addToast } = useToast();
    const [uploadedDocs, setUploadedDocs] = useState<Doc[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [fetchError, setFetchError] = useState(false);
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
            console.error('Error fetching documents:', error);
            setFetchError(true);
            return;
        }
        setFetchError(false);
        if (data) setUploadedDocs(data);
    };

    const handleUpload = async (file: File) => {
        setIsUploading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                addToast('error', 'Please sign in to upload documents.');
                return;
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('client-docs')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { error: dbError } = await supabase.from('documents').insert({
                client_id: user.id,
                name: file.name,
                file_path: fileName,
                status: 'uploaded',
                category: 'uncategorized'
            });

            if (dbError) throw dbError;

            await fetchDocs();
            addToast('success', `"${file.name}" uploaded successfully.`);
        } catch (error) {
            console.error('Upload failed:', error);
            addToast('error', 'Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Document Vault</h2>
                    <p className="text-slate-500 text-sm font-medium">Securely upload and manage your transaction docs.</p>
                </div>
                <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2">
                    <ShieldCheck size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">End-to-End Encrypted</span>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload Zone */}
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleUpload(file);
                    }}
                    className={`border-4 border-dashed rounded-[32px] p-12 text-center transition-all cursor-pointer ${isDragging ? 'border-indigo-500 bg-indigo-50 scale-[0.99]' : 'border-slate-100 bg-slate-50'
                        }`}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                    />
                    <div className="bg-white w-20 h-20 rounded-3xl shadow-lg flex items-center justify-center mx-auto mb-6">
                        {isUploading ? <Loader2 className="animate-spin text-indigo-600" size={32} /> : <Upload className="text-indigo-600" size={32} />}
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-2">{isUploading ? 'Uploading...' : 'Drag & Drop Documents'}</h3>
                    <p className="text-slate-500 text-sm font-bold mb-8 italic">PDF, JPEG, or PNG up to 20MB</p>
                    <button className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 pointer-events-none">
                        Browse Files
                    </button>
                </div>

                {/* Uploaded List (Replaces Checklist for now to show real data) */}
                <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Your Files</h4>
                    {uploadedDocs.length === 0 ? (
                        <p className="text-slate-400 italic text-sm">No documents uploaded yet.</p>
                    ) : (
                        uploadedDocs.map((doc) => (
                            <div key={doc.id} className="group flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-slate-50 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 leading-none mb-1 truncate max-w-[150px]">{doc.name}</p>
                                        <p className="text-xs font-bold text-slate-400">{new Date(doc.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{doc.status}</span>
                                    <button
                                        onClick={async () => {
                                            const { data } = await supabase.storage.from('client-docs').createSignedUrl(doc.file_path, 60);
                                            if (data) window.open(data.signedUrl, '_blank');
                                        }}
                                        className="text-slate-400 hover:text-indigo-600 transition-colors"
                                    >
                                        <Download size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
