'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Mail, Edit3, Save, X, RefreshCw, AlertCircle } from 'lucide-react';
import { CommandCenterSkeleton } from '@/components/Skeletons';

interface Template {
    id: string;
    name: string;
    status_trigger: string;
    subject: string;
    body_html: string;
    is_active: boolean;
}

export default function TemplatesPage() {
    const supabase = createClient();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [editSubject, setEditSubject] = useState('');
    const [editBody, setEditBody] = useState('');

    const fetchTemplates = async () => {
        setLoading(true);
        setError(null);
        const { data, error: err } = await supabase
            .from('email_templates')
            .select('*')
            .order('name');

        if (err) {
            console.error('Error fetching templates:', err);
            setError(err.message);
        } else {
            setTemplates(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        void fetchTemplates();
    }, []);

    const handleEdit = (template: Template) => {
        setEditingId(template.id);
        setEditSubject(template.subject);
        setEditBody(template.body_html);
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditSubject('');
        setEditBody('');
    };

    const handleSave = async (id: string) => {
        const { error: err } = await supabase
            .from('email_templates')
            .update({
                subject: editSubject,
                body_html: editBody,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (err) {
            console.error('Failed to save template:', err);
            alert('Failed to save template. Please try again.');
        } else {
            setTemplates(prev => prev.map(t =>
                t.id === id ? { ...t, subject: editSubject, body_html: editBody } : t
            ));
            handleCancel();
        }
    };

    const toggleActive = async (id: string, currentStatus: boolean) => {
        const { error: err } = await supabase
            .from('email_templates')
            .update({
                is_active: !currentStatus,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (err) {
            console.error('Failed to toggle status:', err);
        } else {
            setTemplates(prev => prev.map(t =>
                t.id === id ? { ...t, is_active: !currentStatus } : t
            ));
        }
    };

    if (loading) {
        return (
            <div className="flex-1 bg-bg text-ink p-7 max-w-7xl mx-auto w-full space-y-8">
                <CommandCenterSkeleton />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 bg-bg text-ink p-7 max-w-7xl mx-auto w-full flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <AlertCircle className="w-16 h-16 text-org" />
                <h2 className="text-xl font-black uppercase tracking-[-0.03em] text-center">Failed to load templates</h2>
                <p className="text-mut max-w-md text-center font-mono text-[12px]">{error}</p>
                <button onClick={fetchTemplates} className="inline-flex items-center justify-center gap-2 font-extrabold text-[13px] tracking-[0.025em] uppercase px-5 py-3 transition-colors active:translate-y-px bg-blue text-white hover:bg-blue2">
                    <RefreshCw size={16} /> Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-bg text-ink p-7 max-w-7xl mx-auto w-full space-y-7">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-mut2">04 / Resources</p>
                    <h1 className="text-2xl font-black uppercase tracking-[-0.03em] flex items-center gap-3 mt-1">
                        <Mail className="text-lime" size={28} />
                        Email <span className="text-lime">Templates</span>
                    </h1>
                    <p className="text-mut font-mono text-[11px] mt-2 max-w-2xl">
                        Manage the transactional emails sent to clients and agents when transaction milestones are reached.
                    </p>
                </div>
            </div>

            {/* Variables Cheat Sheet */}
            <div className="bg-panel border border-line p-6">
                <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-lime mb-2">Available Variables</p>
                <p className="text-[13px] text-mut mb-4">Use these variables in your subject or body. They will be dynamically replaced when the email is sent.</p>
                <div className="flex flex-wrap gap-3">
                    <code className="bg-bg2 text-blue2 font-mono font-bold px-3 py-1.5 text-[13px] border border-line cursor-copy hover:border-lime transition-colors" title="Client's Full Name">{"{{ client_name }}"}</code>
                    <code className="bg-bg2 text-blue2 font-mono font-bold px-3 py-1.5 text-[13px] border border-line cursor-copy hover:border-lime transition-colors" title="Listing Address">{"{{ property_address }}"}</code>
                    <code className="bg-bg2 text-blue2 font-mono font-bold px-3 py-1.5 text-[13px] border border-line cursor-copy hover:border-lime transition-colors" title="New Transaction Status">{"{{ new_status }}"}</code>
                </div>
            </div>

            {/* Templates List */}
            <div className="grid grid-cols-1 gap-4">
                {templates.map(template => {
                    const isEditing = editingId === template.id;

                    return (
                        <div key={template.id} className={`bg-panel p-6 md:p-7 border transition-colors ${!template.is_active ? 'border-line opacity-75' : isEditing ? 'border-lime' : 'border-line hover:border-lime'}`}>

                            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-lg font-extrabold uppercase tracking-[-0.01em] text-ink">{template.name}</h2>
                                        <span className={`px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.06em] ${template.is_active ? 'bg-lime/10 text-lime' : 'bg-mut2/15 text-mut'}`}>
                                            {template.is_active ? 'Active' : 'Disabled'}
                                        </span>
                                    </div>
                                    <p className="font-mono text-[10px] text-mut2 uppercase tracking-[0.08em]">
                                        Trigger: <span className="text-blue2 bg-blue/10 px-2 py-0.5">{template.status_trigger}</span>
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 w-full md:w-auto">
                                    {!isEditing ? (
                                        <>
                                            <button
                                                onClick={() => toggleActive(template.id, template.is_active)}
                                                className={`flex-1 md:flex-none px-4 py-2.5 font-extrabold uppercase tracking-[0.025em] text-[12px] transition-colors active:translate-y-px ${template.is_active ? 'bg-panel2 text-ink hover:bg-[#222b3a]' : 'bg-lime/10 text-lime hover:bg-lime/20'}`}
                                            >
                                                {template.is_active ? 'Disable' : 'Enable'}
                                            </button>
                                            <button
                                                onClick={() => handleEdit(template)}
                                                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 bg-blue text-white hover:bg-blue2 px-4 py-2.5 font-extrabold uppercase tracking-[0.025em] text-[12px] transition-colors active:translate-y-px"
                                            >
                                                <Edit3 size={14} /> Edit
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={handleCancel}
                                                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 bg-panel2 text-ink hover:bg-[#222b3a] px-4 py-2.5 font-extrabold uppercase tracking-[0.025em] text-[12px] transition-colors active:translate-y-px"
                                            >
                                                <X size={14} /> Cancel
                                            </button>
                                            <button
                                                onClick={() => handleSave(template.id)}
                                                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 bg-lime text-bg hover:bg-[#d2ff56] px-4 py-2.5 font-extrabold uppercase tracking-[0.025em] text-[12px] transition-colors active:translate-y-px"
                                            >
                                                <Save size={14} /> Save
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Editor View */}
                            {isEditing ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block font-mono text-[10px] text-mut2 uppercase tracking-[0.1em] mb-2">Subject Line</label>
                                        <input
                                            type="text"
                                            value={editSubject}
                                            onChange={(e) => setEditSubject(e.target.value)}
                                            className="lp-input p-4 text-[13px]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-mono text-[10px] text-mut2 uppercase tracking-[0.1em] mb-2">HTML Body</label>
                                        <textarea
                                            value={editBody}
                                            onChange={(e) => setEditBody(e.target.value)}
                                            rows={8}
                                            className="lp-input p-4 text-[13px] leading-relaxed resize-y"
                                        />
                                    </div>
                                </div>
                            ) : (
                                /* Read-only View */
                                <div className="space-y-4">
                                    <div className="bg-bg2 border border-line p-4">
                                        <p className="font-mono text-[10px] text-mut2 uppercase tracking-[0.1em] mb-1.5">Subject</p>
                                        <p className="text-ink font-mono text-[13px]">{template.subject}</p>
                                    </div>
                                    <div className="bg-bg2 border border-line p-4">
                                        <p className="font-mono text-[10px] text-mut2 uppercase tracking-[0.1em] mb-3">Preview</p>
                                        <div
                                            className="prose prose-sm prose-invert max-w-none text-mut bg-bg p-6 border border-line"
                                            dangerouslySetInnerHTML={{ __html: template.body_html || '<p class="text-mut2 italic">Empty body...</p>' }}
                                        />
                                    </div>
                                </div>
                            )}

                        </div>
                    );
                })}

                {templates.length === 0 && (
                    <div className="bg-panel p-12 text-center border border-line">
                        <p className="text-mut font-mono text-[12px]">No templates found in the database. Please run the database migration.</p>
                    </div>
                )}
            </div>

        </div>
    );
}
