'use client';

import { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import LeadCaptureWizard from '@/components/LeadCaptureWizard';
import { useTranslation } from '@/lib/i18n';

export default function FinalCTA() {
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const { t } = useTranslation();

    return (
        <section className="bg-slate-900 rounded-[40px] p-12 md:p-24 text-center relative overflow-hidden mx-4 mb-20">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600/10 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto space-y-8">
                <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full backdrop-blur-sm">
                    <Sparkles className="text-indigo-400" size={16} />
                    <span className="text-xs font-black tracking-widest uppercase text-indigo-300">{t('finalCta.badge')}</span>
                </div>

                <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-none">
                    {t('finalCta.heading1')} <br />
                    <span className="text-indigo-500 italic">{t('finalCta.heading2')}</span>
                </h2>

                <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
                    {t('finalCta.description')}
                </p>

                <div className="pt-8">
                    <LeadCaptureWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} source="Bottom CTA" />
                    <button
                        onClick={() => setIsWizardOpen(true)}
                        className="bg-white text-slate-900 px-10 py-6 rounded-2xl font-black text-xl hover:bg-indigo-50 hover:scale-105 transition-all shadow-2xl shadow-indigo-900/50 flex items-center justify-center gap-3 mx-auto"
                    >
                        {t('finalCta.button')} <ArrowRight className="animate-pulse" />
                    </button>
                    <p className="mt-6 text-xs font-bold text-slate-600 uppercase tracking-widest">
                        {t('finalCta.disclaimer')}
                    </p>
                </div>
            </div>
        </section>
    );
}
