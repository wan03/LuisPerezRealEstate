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

    // --- Shared style tokens ---
    const eyebrow = 'inline-block font-mono text-[10px] font-bold tracking-[0.1em] uppercase text-lime border border-line bg-bg px-3 py-1.5';
    const heading = 'text-[clamp(24px,4vw,34px)] font-black uppercase tracking-[-0.02em]';
    const primaryBtn = 'inline-flex items-center justify-center gap-2 w-full font-extrabold text-[13px] tracking-[0.025em] uppercase px-5 py-4 bg-lime text-bg hover:bg-[#d2ff56] transition-colors active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed';

    // --- Step Components ---

    const RoleStep = () => (
        <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
            <h2 className={`${heading} text-center`}>
                {t('wizard.stepRole')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                    { id: 'buyer', icon: Home, label: t('wizard.buyer'), sub: 'I want to find a home' },
                    { id: 'seller', icon: DollarSign, label: t('wizard.seller'), sub: 'I want to cash out' },
                    { id: 'investor', icon: Calendar, label: t('wizard.investor'), sub: 'I want ROI' }
                ].map((option) => (
                    <button
                        key={option.id}
                        onClick={() => handleNext('role', option.id)}
                        className="flex flex-col items-center justify-center p-8 border border-line bg-bg hover:border-lime transition-colors group text-center"
                    >
                        <div className="w-14 h-14 border border-line bg-panel2 group-hover:border-lime flex items-center justify-center mb-4 transition-colors">
                            <option.icon className="text-mut group-hover:text-lime transition-colors" size={22} />
                        </div>
                        <span className="font-black text-[15px] uppercase tracking-[-0.01em]">{option.label}</span>
                        <span className="font-mono text-[10px] text-mut mt-2 uppercase tracking-[0.06em]">{option.sub}</span>
                    </button>
                ))}
            </div>
        </div>
    );

    const DetailsStep = () => (
        <div className="space-y-8 animate-in slide-in-from-right fade-in duration-300">
            <div className="text-center">
                <span className={eyebrow}>Step 2 of 4</span>
                <h2 className={`${heading} mt-4`}>
                    {formData.role === 'seller' ? 'When do you need to move?' : 'When are you hoping to move in?'}
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {['ASAP', '1-3 Months', 'Just Browsing'].map((time) => (
                    <button
                        key={time}
                        onClick={() => {
                            setFormData(prev => ({ ...prev, timeline: time }));
                            setStep('financials');
                        }}
                        className="py-6 border border-line bg-bg font-mono text-[12px] font-bold uppercase tracking-[0.06em] text-ink hover:border-lime hover:text-lime transition-colors"
                    >
                        {time}
                    </button>
                ))}
            </div>

            <div className="pt-8 border-t border-line">
                <label className="block font-mono text-[10px] font-bold text-mut uppercase tracking-[0.1em] mb-3">
                    What's your main motivation? <span className="text-mut2 font-normal normal-case">(Optional)</span>
                </label>
                <textarea
                    placeholder={formData.role === 'seller' ? "e.g. Downsizing, Job Relocation..." : "e.g. Growing family, Retirement..."}
                    className="lp-input p-4 text-[14px]"
                    rows={2}
                    value={formData.motivation}
                    onChange={(e) => setFormData(p => ({ ...p, motivation: e.target.value }))}
                />
                <button
                    onClick={() => setStep('financials')}
                    className="mt-4 w-full py-4 text-center font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-mut hover:text-ink transition-colors"
                >
                    Skip to Financials
                </button>
            </div>
        </div>
    );

    const FinancialsStep = () => (
        <div className="space-y-8 animate-in slide-in-from-right fade-in duration-300">
            <div className="text-center">
                <span className={eyebrow}>Step 3 of 4</span>
                <h2 className={`${heading} mt-4`}>
                    Let's talk numbers.
                </h2>
            </div>

            {formData.role === 'buyer' || formData.role === 'investor' ? (
                <div className="space-y-6 max-w-md mx-auto">
                    <div>
                        <label className="block font-mono text-[10px] font-bold text-mut uppercase tracking-[0.1em] mb-3">{t('wizard.priceRange')}</label>
                        <select
                            className="lp-input p-4 text-[14px]"
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
                        <label className="block font-mono text-[10px] font-bold text-mut uppercase tracking-[0.1em] mb-3">{t('wizard.preApproved')}</label>
                        <div className="grid grid-cols-2 gap-3">
                            {['Yes', 'No / Not Yet'].map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => {
                                        setFormData(p => ({ ...p, preApproved: opt }));
                                        // Wait for both? Or just let them click next
                                    }}
                                    className={`py-3 border font-mono text-[12px] font-bold uppercase tracking-[0.06em] transition-colors ${formData.preApproved === opt ? 'border-lime bg-bg text-lime' : 'border-line text-mut hover:border-mut hover:text-ink'}`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button
                        disabled={!formData.priceRange}
                        onClick={() => setStep('contact')}
                        className={`${primaryBtn} mt-4`}
                    >
                        Next Step <ArrowRight size={16} />
                    </button>
                </div>
            ) : (
                <div className="space-y-6 max-w-md mx-auto">
                    <div>
                        <label className="block font-mono text-[10px] font-bold text-mut uppercase tracking-[0.1em] mb-3">{t('wizard.estimatedValue')}</label>
                        <input
                            type="text"
                            placeholder="e.g. $350,000"
                            className="lp-input p-4 text-[14px]"
                            onChange={(e) => setFormData(p => ({ ...p, estimatedValue: e.target.value }))}
                        />
                    </div>
                    <button
                        onClick={() => setStep('contact')}
                        className={primaryBtn}
                    >
                        Next Step <ArrowRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );

    const ContactStep = () => (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto animate-in slide-in-from-right fade-in duration-300">
            <div className="text-center">
                <span className={eyebrow}>Final Step</span>
                <h2 className={`${heading} mt-4`}>
                    Unlock Your Strategy
                </h2>
                <p className="text-mut font-medium text-[14px] mt-2">Where should we send your personalized roadmap?</p>
            </div>

            <div className="space-y-3">
                <input
                    required
                    type="text"
                    placeholder={t('wizard.name')}
                    className="lp-input p-4 text-[14px]"
                    value={formData.name}
                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                />
                <input
                    required
                    type="email"
                    placeholder={t('wizard.email')}
                    className="lp-input p-4 text-[14px]"
                    value={formData.email}
                    onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                />
                <input
                    type="tel"
                    placeholder={`${t('wizard.phone')} (Optional)`}
                    className="lp-input p-4 text-[14px]"
                    value={formData.phone}
                    onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                />
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className={primaryBtn}
            >
                {isSubmitting ? t('wizard.sending') : t('wizard.submit')} <ArrowRight size={16} />
            </button>
        </form>
    );

    const SuccessStep = () => (
        <div className="text-center py-12 animate-in zoom-in fade-in duration-300">
            <div className="w-20 h-20 border border-lime bg-bg flex items-center justify-center mx-auto mb-6 text-lime">
                <Check size={40} />
            </div>
            <h2 className={`${heading} mb-4`}>{t('wizard.successTitle')}</h2>
            <p className="text-lg text-mut font-medium max-w-md mx-auto mb-10">
                {t('wizard.successBody')}
            </p>
            <a
                href="https://calendly.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full font-extrabold text-[13px] tracking-[0.025em] uppercase px-5 py-4 bg-lime text-bg hover:bg-[#d2ff56] transition-colors active:translate-y-px"
            >
                Schedule Call Now
            </a>
            <button onClick={onClose} className="mt-6 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-mut hover:text-ink transition-colors">
                {t('wizard.close')}
            </button>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/80 backdrop-blur">
            <div className="corner-brackets bg-panel border border-line w-full max-w-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-line flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2.5">
                        <span className="lp-live-dot" />
                        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-ink">{t('nav.strategySession')}</span>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 border border-line bg-panel2 text-mut hover:text-ink hover:bg-[#222b3a] flex items-center justify-center transition-colors">
                        <X size={18} />
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
