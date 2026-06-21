'use client';

import { useState } from 'react';
import LeadCaptureWizard from '@/components/LeadCaptureWizard';
import { useTranslation } from '@/lib/i18n';

export default function HeroCTA() {
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const { t } = useTranslation();

    return (
        <>
            <LeadCaptureWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} source="Hero" />
            <button
                onClick={() => setIsWizardOpen(true)}
                className="inline-flex items-center justify-center gap-2 font-extrabold text-[14px] tracking-[0.025em] uppercase px-6 py-[15px] bg-lime text-bg hover:bg-[#d2ff56] transition-colors active:translate-y-px"
            >
                {t('hero.startRoadmap')} →
            </button>
        </>
    );
}
