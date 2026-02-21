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
            <div className="p-8 max-w-7xl mx-auto space-y-8">
                <CommandCenterSkeleton />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <AlertCircle className="w-16 h-16 text-red-500" />
                <h2 className="text-xl font-black text-slate-800 tracking-tight text-center">Failed to load templates</h2>
                <p className="text-slate-500 max-w-md text-center">{error}</p>
                <button onClick={fetchTemplates} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-indigo-700 transition">
                    <RefreshCw size={16} /> Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Mail className="text-indigo-600" size={32} />
                        Email Templates
                    </h1>
                    <p className="text-slate-500 font-medium mt-2 max-w-2xl">
                        Manage the transactional emails sent to clients and agents when transaction milestones are reached.
                    </p>
                </div>
            </div>

            {/* Variables Cheat Sheet */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
                <h3 className="text-indigo-900 font-black tracking-tight mb-3">Available Variables</h3>
                <p className="text-sm text-indigo-700 mb-4">Use these variables in your subject or body. They will be dynamically replaced when the email is sent.</p>
                <div className="flex flex-wrap gap-3">
                    <code className="bg-white text-indigo-600 font-black px-3 py-1.5 rounded-lg text-sm border border-indigo-100 shadow-sm cursor-copy hover:scale-105 transition-transform" title="Client's Full Name">{{ client_name }}</code>
                    <code className="bg-white text-indigo-600 font-black px-3 py-1.5 rounded-lg text-sm border border-indigo-100 shadow-sm cursor-copy hover:scale-105 transition-transform" title="Listing Address">{{ property_address }}</code>
                    <code className="bg-white text-indigo-600 font-black px-3 py-1.5 rounded-lg text-sm border border-indigo-100 shadow-sm cursor-copy hover:scale-105 transition-transform" title="New Transaction Status">{{ new_status }}</code>
                </div>
            </div>

            {/* Templates List */}
            <div className="grid grid-cols-1 gap-6">
                {templates.map(template => {
                    const isEditing = editingId === template.id;

                    return (
                        <div key={template.id} className={`bg-white rounded-3xl p-6 md:p-8 border shadow-sm transition-all duration-300 ${!template.is_active ? 'border-slate-200 opacity-75' : isEditing ? 'border-indigo-300 ring-4 ring-indigo-50' : 'border-slate-200 hover:border-indigo-200 hover:shadow-md'}`}>

                            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-xl font-black text-slate-900">{template.name}</h2>
                                        <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-md border ${template.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                            {template.is_active ? 'Active' : 'Disabled'}
                                        </span>
                                    </div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        Trigger: <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{template.status_trigger}</span>
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 w-full md:w-auto">
                                    {!isEditing ? (
                                        <>
                                            <button
                                                onClick={() => toggleActive(template.id, template.is_active)}
                                                className={`flex-1 md:flex-none px-4 py-2 rounded-xl font-bold uppercase tracking-wider text-xs border transition-all ${template.is_active ? 'border-slate-200 text-slate-600 hover:bg-slate-50' : 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'}`}
                                            >
                                                {template.is_active ? 'Disable' : 'Enable'}
                                            </button>
                                            <button
                                                onClick={() => handleEdit(template)}
                                                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-4 py-2 rounded-xl font-bold uppercase tracking-wider text-xs transition-all"
                                            >
                                                <Edit3 size={14} /> Edit
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={handleCancel}
                                                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 px-4 py-2 rounded-xl font-bold uppercase tracking-wider text-xs transition-all"
                                            >
                                                <X size={14} /> Cancel
                                            </button>
                                            <button
                                                onClick={() => handleSave(template.id)}
                                                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white border border-transparent px-4 py-2 rounded-xl font-bold uppercase tracking-wider text-xs transition-all"
                                            >
                                                <Save size={14} /> Save
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Editor View */}
                            {isEditing ? (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Subject Line</label>
                                        <input
                                            type="text"
                                            value={editSubject}
                                            onChange={(e) => setEditSubject(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">HTML Body</label>
                                        <textarea
                                            value={editBody}
                                            onChange={(e) => setEditBody(e.target.value)}
                                            rows={8}
                                            className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono text-sm leading-relaxed resize-y"
                                        />
                                    </div>
                                </div>
                            ) : (
                                /* Read-only View */
                                <div className="space-y-4">
                                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Subject</p>
                                        <p className="text-slate-900 font-medium font-mono text-sm">{template.subject}</p>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Preview</p>
                                        <div
                                            className="prose prose-sm max-w-none text-slate-700 font-medium bg-white p-6 rounded-lg border border-slate-200 shadow-sm"
                                            dangerouslySetInnerHTML={{ __html: template.body_html || '<p class="text-slate-400 italic">Empty body...</p>' }}
                                        />
                                    </div>
                                </div>
                            )}

                        </div>
                    );
                })}

                {templates.length === 0 && (
                    <div className="bg-white rounded-3xl p-12 text-center border shadow-sm">
                        <p className="text-slate-500 font-medium">No templates found in the database. Please run the database migration.</p>
                    </div>
                )}
            </div>

        </div>
    );
}
