'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import LeadCaptureWizard from '@/components/LeadCaptureWizard';

export default function BlogCTA() {
    const [isWizardOpen, setIsWizardOpen] = useState(false);

    return (
        <>
            <LeadCaptureWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} source="Blog Post" />
            <button
                onClick={() => setIsWizardOpen(true)}
                className="inline-flex items-center justify-center gap-2 font-extrabold text-[13px] tracking-[0.025em] uppercase px-6 py-4 bg-lime text-bg hover:bg-[#d2ff56] transition-colors active:translate-y-px whitespace-nowrap"
            >
                Get a Market Analysis <ArrowRight size={16} />
            </button>
        </>
    );
}
