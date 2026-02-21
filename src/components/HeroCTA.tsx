'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
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
                className="bg-white text-slate-900 px-8 py-5 rounded-2xl font-black text-lg hover:bg-slate-100 transition-all text-center flex items-center justify-center gap-2 group"
            >
                {t('hero.startRoadmap')} <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
        </>
    );
}
