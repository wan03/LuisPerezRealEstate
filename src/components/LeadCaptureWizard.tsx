'use client';

import React, { useState } from 'react';
import { X, ChevronRight, Home, DollarSign, Calendar, User, ArrowRight, Check } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';

interface LeadCaptureWizardProps {
    isOpen: boolean;
    onClose: () => void;
    source?: string; // e.g., 'Hero', 'Navbar', 'Blog'
}

type Step = 'role' | 'details' | 'financials' | 'contact' | 'success';

export default function LeadCaptureWizard({ isOpen, onClose, source = 'General' }: LeadCaptureWizardProps) {
    const [step, setStep] = useState<Step>('role');
    const [formData, setFormData] = useState({
        role: '',
        timeline: '',
        motivation: '',
        priceRange: '',
        preApproved: '',
        estimatedValue: '',
        name: '',
        email: '',
        phone: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const { t } = useTranslation();

    if (!isOpen) return null;

    const handleNext = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));

        if (step === 'role') setStep('details');
        else if (step === 'details') setStep('financials');
        else if (step === 'financials') setStep('contact');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const supabase = createClient();
        const { error } = await supabase.from('leads').insert({
            role: formData.role.toLowerCase(),
            timeline: formData.timeline,
            motivation: formData.motivation,
            financials: {
                priceRange: formData.priceRange,
                preApproved: formData.preApproved,
                estimatedValue: formData.estimatedValue
            },
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            source_url: source // Using source_url column for conversion source
        });

        setIsSubmitting(false);

        if (error) {
            console.error('Error submitting lead:', error);
            // Optional: Show error state
            return;
        }

        setStep('success');
    };

    // --- Step Components ---

    const RoleStep = () => (
        <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight text-center">
                {t('wizard.stepRole')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { id: 'buyer', icon: Home, label: t('wizard.buyer'), sub: 'I want to find a home' },
                    { id: 'seller', icon: DollarSign, label: t('wizard.seller'), sub: 'I want to cash out' },
                    { id: 'investor', icon: Calendar, label: t('wizard.investor'), sub: 'I want ROI' }
                ].map((option) => (
                    <button
                        key={option.id}
                        onClick={() => handleNext('role', option.id)}
                        className="flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-slate-100 hover:border-indigo-600 hover:bg-indigo-50 transition-all group text-center"
                    >
                        <div className="w-16 h-16 rounded-full bg-slate-100 group-hover:bg-indigo-600 flex items-center justify-center mb-4 transition-colors">
                            <option.icon className="text-slate-900 group-hover:text-white" size={24} />
                        </div>
                        <span className="font-black text-lg text-slate-900 uppercase tracking-wide">{option.label}</span>
                        <span className="text-xs font-bold text-slate-400 mt-2">{option.sub}</span>
                    </button>
                ))}
            </div>
        </div>
    );

    const DetailsStep = () => (
        <div className="space-y-8 animate-in slide-in-from-right fade-in duration-300">
            <div className="text-center">
                <span className="text-xs font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">Step 2 of 4</span>
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mt-4">
                    {formData.role === 'seller' ? 'When do you need to move?' : 'When are you hoping to move in?'}
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['ASAP', '1-3 Months', 'Just Browsing'].map((time) => (
                    <button
                        key={time}
                        onClick={() => {
                            setFormData(prev => ({ ...prev, timeline: time }));
                            setStep('financials');
                        }}
                        className="py-6 rounded-2xl border-2 border-slate-100 font-bold text-lg hover:border-indigo-600 hover:text-indigo-600 transition-all"
                    >
                        {time}
                    </button>
                ))}
            </div>

            <div className="pt-8 border-t border-slate-100">
                <label className="block text-sm font-black text-slate-500 uppercase tracking-widest mb-3">
                    What's your main motivation? <span className="text-slate-300 font-normal normal-case">(Optional)</span>
                </label>
                <textarea
                    placeholder={formData.role === 'seller' ? "e.g. Downsizing, Job Relocation..." : "e.g. Growing family, Retirement..."}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                    rows={2}
                    value={formData.motivation}
                    onChange={(e) => setFormData(p => ({ ...p, motivation: e.target.value }))}
                />
                <button
                    onClick={() => setStep('financials')}
                    className="mt-4 w-full py-4 text-center font-bold text-slate-400 hover:text-slate-900 text-sm transition-colors"
                >
                    Skip to Financials
                </button>
            </div>
        </div>
    );

    const FinancialsStep = () => (
        <div className="space-y-8 animate-in slide-in-from-right fade-in duration-300">
            <div className="text-center">
                <span className="text-xs font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">Step 3 of 4</span>
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mt-4">
                    Let's talk numbers.
                </h2>
            </div>

            {formData.role === 'buyer' || formData.role === 'investor' ? (
                <div className="space-y-6 max-w-md mx-auto">
                    <div>
                        <label className="block text-sm font-black text-slate-500 uppercase tracking-widest mb-3">{t('wizard.priceRange')}</label>
                        <select
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                            onChange={(e) => {
                                setFormData(p => ({ ...p, priceRange: e.target.value }));
                                // Auto advance not ideal here as there's another q
                            }}
                            value={formData.priceRange}
                        >
                            <option value="">Select Range</option>
                            <option value="Under $200k">Under $200k</option>
                            <option value="$200k - $400k">$200k - $400k</option>
                            <option value="$400k - $700k">$400k - $700k</option>
                            <option value="$700k+">$700k+</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-black text-slate-500 uppercase tracking-widest mb-3">{t('wizard.preApproved')}</label>
                        <div className="grid grid-cols-2 gap-4">
                            {['Yes', 'No / Not Yet'].map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => {
                                        setFormData(p => ({ ...p, preApproved: opt }));
                                        // Wait for both? Or just let them click next
                                    }}
                                    className={`py-3 rounded-xl border-2 font-bold ${formData.preApproved === opt ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100'}`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button
                        disabled={!formData.priceRange}
                        onClick={() => setStep('contact')}
                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-4"
                    >
                        Next Step <ArrowRight size={16} className="inline ml-2" />
                    </button>
                </div>
            ) : (
                <div className="space-y-6 max-w-md mx-auto">
                    <div>
                        <label className="block text-sm font-black text-slate-500 uppercase tracking-widest mb-3">{t('wizard.estimatedValue')}</label>
                        <input
                            type="text"
                            placeholder="e.g. $350,000"
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                            onChange={(e) => setFormData(p => ({ ...p, estimatedValue: e.target.value }))}
                        />
                    </div>
                    <button
                        onClick={() => setStep('contact')}
                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
                    >
                        Next Step <ArrowRight size={16} className="inline ml-2" />
                    </button>
                </div>
            )}
        </div>
    );

    const ContactStep = () => (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto animate-in slide-in-from-right fade-in duration-300">
            <div className="text-center">
                <span className="text-xs font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">Final Step</span>
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mt-4">
                    Unlock Your Strategy
                </h2>
                <p className="text-slate-500 font-medium mt-2">Where should we send your personalized roadmap?</p>
            </div>

            <div className="space-y-4">
                <input
                    required
                    type="text"
                    placeholder={t('wizard.name')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                    value={formData.name}
                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                />
                <input
                    required
                    type="email"
                    placeholder={t('wizard.email')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                    value={formData.email}
                    onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                />
                <input
                    type="tel"
                    placeholder={`${t('wizard.phone')} (Optional)`}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                    value={formData.phone}
                    onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                />
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-2"
            >
                {isSubmitting ? t('wizard.sending') : t('wizard.submit')} <ArrowRight />
            </button>
        </form>
    );

    const SuccessStep = () => (
        <div className="text-center py-12 animate-in zoom-in fade-in duration-300">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                <Check size={48} />
            </div>
            <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight mb-4">{t('wizard.successTitle')}</h2>
            <p className="text-xl text-slate-500 font-medium max-w-md mx-auto mb-10">
                {t('wizard.successBody')}
            </p>
            <a
                href="https://calendly.com"
                target="_blank"
                rel="noreferrer"
                className="inline-block w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg uppercase tracking-widest hover:bg-slate-800 shadow-xl"
            >
                Schedule Call Now
            </a>
            <button onClick={onClose} className="mt-6 text-slate-400 font-bold uppercase tracking-widest text-xs hover:text-slate-600">
                {t('wizard.close')}
            </button>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-indigo-600 animate-pulse" />
                        <span className="font-black text-xs uppercase tracking-widest text-indigo-900">{t('nav.strategySession')}</span>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900 flex items-center justify-center transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 md:p-12 overflow-y-auto">
                    {step === 'role' && <RoleStep />}
                    {step === 'details' && <DetailsStep />}
                    {step === 'financials' && <FinancialsStep />}
                    {step === 'contact' && <ContactStep />}
                    {step === 'success' && <SuccessStep />}
                </div>
            </div>
        </div>
    );
}
