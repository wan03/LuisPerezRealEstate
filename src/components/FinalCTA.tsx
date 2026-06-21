'use client';

import { useState } from 'react';
import LeadCaptureWizard from '@/components/LeadCaptureWizard';
import { useTranslation } from '@/lib/i18n';

export default function FinalCTA() {
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const { t } = useTranslation();

    return (
        <section className="relative overflow-hidden border border-line bg-panel px-6 md:px-10 py-14 md:py-[88px] text-center">
            <div className="grid-bg" style={{ opacity: 0.45, WebkitMaskImage: 'radial-gradient(ellipse 70% 90% at 50% 40%,#000,transparent 70%)', maskImage: 'radial-gradient(ellipse 70% 90% at 50% 40%,#000,transparent 70%)' }} />

            <div className="relative z-[2] max-w-[720px] mx-auto">
                <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-lime mb-1">{t('finalCta.badge')}</div>

                <h2 className="text-[clamp(38px,5.6vw,82px)] font-black uppercase tracking-[-0.04em] leading-[0.89] my-4">
                    {t('finalCta.heading1')}<br />
                    <em className="not-italic text-lime">{t('finalCta.heading2')}</em>
                </h2>

                <p className="text-[17px] text-mut max-w-[44ch] mx-auto mb-7 leading-relaxed">
                    {t('finalCta.description')}
                </p>

                <LeadCaptureWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} source="Bottom CTA" />
                <button
                    onClick={() => setIsWizardOpen(true)}
                    className="inline-flex items-center justify-center gap-2 font-extrabold text-[14px] tracking-[0.025em] uppercase px-[30px] py-[17px] bg-lime text-accentink hover:bg-lime2 transition-colors active:translate-y-px mx-auto"
                >
                    {t('finalCta.button')} →
                </button>
                <p className="mt-4 font-mono text-[10px] tracking-[0.1em] uppercase text-mut2">
                    {t('finalCta.disclaimer')}
                </p>
            </div>
        </section>
    );
}
