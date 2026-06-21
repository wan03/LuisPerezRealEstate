'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, User, LogOut, Globe } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

import { Session } from '@supabase/supabase-js';

import LeadCaptureWizard from '@/components/LeadCaptureWizard';
import { useTranslation } from '@/lib/i18n';

export default function Navbar() {
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();
  const { locale, setLocale, t } = useTranslation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'es' : 'en');
  };

  const btnBase = 'inline-flex items-center justify-center gap-2 font-extrabold text-[13px] tracking-[0.025em] uppercase px-5 py-3 transition-colors active:translate-y-px';

  return (
    <>
      <LeadCaptureWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} source="Navbar" />
      <nav className="sticky top-0 z-50 border-b border-line bg-bg/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="flex justify-between items-center h-[72px]">
            {/* Brand */}
            <Link href="/" className="flex items-center gap-3">
              <span className="lp-mark w-[38px] h-[38px] text-[14px]">LP</span>
              <div>
                <div className="font-black text-[15px] tracking-[-0.025em] uppercase leading-none">
                  Luis Perez<span className="text-blue2">/RE</span>
                </div>
                <div className="font-mono text-[10px] text-mut mt-[3px]">Lakeland · Tampa Bay</div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-7">
              <Link href="/#marketplace" className="text-[13px] font-bold text-mut hover:text-ink transition-colors">{t('nav.marketplace')}</Link>
              <Link href="/#piti" className="text-[13px] font-bold text-mut hover:text-ink transition-colors">PITI+</Link>
              <Link href="/learn" className="text-[13px] font-bold text-mut hover:text-ink transition-colors">{t('nav.educationHub')}</Link>
            </div>

            {/* Right cluster */}
            <div className="hidden md:flex items-center gap-2.5">
              <button
                onClick={toggleLocale}
                className="font-mono text-[10px] font-bold tracking-[0.06em] text-mut border border-line px-2.5 py-[7px] hover:text-lime hover:border-lime transition-colors flex items-center gap-1.5"
                title={locale === 'en' ? 'Cambiar a Español' : 'Switch to English'}
              >
                <Globe size={12} />
                {locale === 'en' ? 'EN/ES' : 'ES/EN'}
              </button>

              {session ? (
                <>
                  <Link href="/dashboard" className={`${btnBase} bg-panel2 text-ink hover:bg-[#222b3a]`}>
                    <User size={15} /> {t('nav.dashboard')}
                  </Link>
                  <button onClick={handleSignOut} className="text-mut hover:text-org transition-colors p-2" title={t('nav.signOut')}>
                    <LogOut size={18} />
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className={`${btnBase} bg-panel2 text-ink hover:bg-[#222b3a]`}>
                    {t('nav.login')}
                  </Link>
                  <button onClick={() => setIsWizardOpen(true)} className={`${btnBase} bg-lime text-bg hover:bg-[#d2ff56]`}>
                    {t('nav.applyForAccess')} →
                  </button>
                </>
              )}
            </div>

            {/* Mobile controls */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={toggleLocale}
                className="font-mono text-[10px] font-bold text-mut border border-line px-2.5 py-2"
              >
                {locale === 'en' ? 'EN/ES' : 'ES/EN'}
              </button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-ink p-1 focus:outline-none"
                aria-label="Menu"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="md:hidden bg-bg2 border-t border-line px-5 pb-6 pt-2">
            <Link href="/#marketplace" onClick={() => setIsOpen(false)} className="block text-[15px] font-bold text-mut hover:text-ink py-3 border-b border-line">{t('nav.marketplace')}</Link>
            <Link href="/#piti" onClick={() => setIsOpen(false)} className="block text-[15px] font-bold text-mut hover:text-ink py-3 border-b border-line">PITI+</Link>
            <Link href="/learn" onClick={() => setIsOpen(false)} className="block text-[15px] font-bold text-mut hover:text-ink py-3 border-b border-line">{t('nav.educationHub')}</Link>
            <div className="flex gap-2.5 mt-4">
              {session ? (
                <>
                  <Link href="/dashboard" onClick={() => setIsOpen(false)} className={`${btnBase} flex-1 bg-panel2 text-ink`}>
                    {t('nav.dashboard')}
                  </Link>
                  <button onClick={handleSignOut} className={`${btnBase} flex-1 bg-panel2 text-org`}>
                    {t('nav.signOut')}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsOpen(false)} className={`${btnBase} flex-1 bg-panel2 text-ink`}>
                    {t('nav.login')}
                  </Link>
                  <button onClick={() => { setIsWizardOpen(true); setIsOpen(false); }} className={`${btnBase} flex-1 bg-lime text-bg`}>
                    {t('nav.applyForAccess')} →
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
