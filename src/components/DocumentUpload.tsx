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
        <div className="bg-panel p-8 border border-line">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-[-0.03em] text-ink">Document <em className="not-italic text-lime">Vault</em></h2>
                    <p className="font-mono text-[11px] tracking-[0.04em] text-mut mt-1.5">Securely upload and manage your transaction docs.</p>
                </div>
                <div className="bg-panel2 text-lime px-3 py-2 border border-line flex items-center gap-2">
                    <ShieldCheck size={16} />
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.08em]">End-to-End Encrypted</span>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    className={`border-2 border-dashed p-12 text-center transition-colors cursor-pointer ${isDragging ? 'border-lime bg-panel2' : 'border-line bg-bg2 hover:border-mut'
                        }`}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                    />
                    <div className="bg-panel2 w-20 h-20 flex items-center justify-center mx-auto mb-6">
                        {isUploading ? <Loader2 className="lp-spinner text-lime" style={{ width: 32, height: 32 }} /> : <Upload className="text-lime" size={32} />}
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-[-0.02em] text-ink mb-2">{isUploading ? 'Uploading...' : 'Drag & Drop Documents'}</h3>
                    <p className="font-mono text-[10px] text-mut2 uppercase tracking-[0.08em] mb-8">PDF, JPEG, or PNG up to 20MB</p>
                    <button className="inline-flex items-center justify-center gap-2 font-extrabold text-[13px] tracking-[0.025em] uppercase px-5 py-3 bg-lime text-bg pointer-events-none">
                        Browse Files
                    </button>
                </div>

                {/* Uploaded List (Replaces Checklist for now to show real data) */}
                <div className="space-y-3">
                    <h4 className="font-mono text-[10px] font-bold text-mut2 uppercase tracking-[0.14em] mb-4">Your Files</h4>
                    {uploadedDocs.length === 0 ? (
                        <p className="text-mut2 text-sm">No documents uploaded yet.</p>
                    ) : (
                        uploadedDocs.map((doc) => (
                            <div key={doc.id} className="group flex items-center justify-between p-3 bg-bg2 border border-line hover:border-blue transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-panel2 text-mut flex items-center justify-center flex-none">
                                        <FileText size={18} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-ink leading-none mb-1 truncate max-w-[150px]">{doc.name}</p>
                                        <p className="font-mono text-[10px] text-mut2">{new Date(doc.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-lime bg-panel2 px-2 py-1 border border-line">{doc.status}</span>
                                    <button
                                        onClick={async () => {
                                            const { data } = await supabase.storage.from('client-docs').createSignedUrl(doc.file_path, 60);
                                            if (data) window.open(data.signedUrl, '_blank');
                                        }}
                                        className="text-mut2 hover:text-blue2 transition-colors"
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
