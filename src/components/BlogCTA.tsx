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
                className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-2 whitespace-nowrap"
            >
                Get a Market Analysis <ArrowRight />
            </button>
        </>
    );
}
