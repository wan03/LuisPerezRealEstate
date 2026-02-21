'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Rocket, User, BookOpen, ShieldCheck, LogOut, Globe } from 'lucide-react';
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

  return (
    <>
      <LeadCaptureWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} source="Navbar" />
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-slate-900 p-2 rounded-xl">
                <Rocket className="text-white" size={20} />
              </div>
              <span className="text-xl font-black tracking-tighter text-slate-900 italic uppercase">
                LUIS PEREZ <span className="text-indigo-600">RE</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8 text-black">
              <Link href="/" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">{t('nav.marketplace')}</Link>
              <Link href="/learn" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1">
                <BookOpen size={16} /> {t('nav.educationHub')}
              </Link>
              <button
                onClick={() => setIsWizardOpen(true)}
                className="text-sm font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-all border border-indigo-100 uppercase tracking-wide"
              >
                {t('nav.strategySession')}
              </button>

              {/* Language Switcher */}
              <button
                onClick={toggleLocale}
                className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 hover:border-slate-300"
                title={locale === 'en' ? 'Cambiar a Español' : 'Switch to English'}
              >
                <Globe size={14} />
                <span className="uppercase text-xs font-black tracking-wide">{locale === 'en' ? 'ES' : 'EN'}</span>
              </button>

              <div className="h-6 w-px bg-slate-100 mx-2" />

              {session ? (
                <>
                  <Link href="/dashboard" className="text-sm font-bold text-slate-900 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition-all flex items-center gap-2">
                    <User size={16} /> {t('nav.dashboard')}
                  </Link>
                  <button onClick={handleSignOut} className="text-slate-400 hover:text-red-500 transition-colors">
                    <LogOut size={18} />
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-bold text-slate-900 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition-all flex items-center gap-2">
                    <User size={16} /> {t('nav.login')}
                  </Link>
                  <Link href="/signup" className="text-sm font-black text-white bg-indigo-600 px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2">
                    <ShieldCheck size={16} /> {t('nav.applyForAccess')}
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-3">
              <button
                onClick={toggleLocale}
                className="flex items-center gap-1 text-slate-500 bg-slate-50 px-2.5 py-2 rounded-xl border border-slate-200"
              >
                <Globe size={14} />
                <span className="uppercase text-[10px] font-black">{locale === 'en' ? 'ES' : 'EN'}</span>
              </button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 p-4 space-y-4">
            <Link href="/" onClick={() => setIsOpen(false)} className="block text-lg font-bold text-slate-900">{t('nav.marketplace')}</Link>
            <Link href="/learn" onClick={() => setIsOpen(false)} className="block text-lg font-bold text-slate-900">{t('nav.educationHub')}</Link>
            <button
              onClick={() => { setIsWizardOpen(true); setIsOpen(false); }}
              className="block w-full text-center py-4 bg-indigo-50 text-indigo-900 rounded-2xl font-black border border-indigo-100 uppercase tracking-widest mt-4"
            >
              {t('nav.bookStrategySession')}
            </button>
            <div className="pt-4 space-y-3">
              {session ? (
                <>
                  <Link href="/dashboard" onClick={() => setIsOpen(false)} className="block w-full text-center py-4 bg-slate-50 rounded-2xl font-bold text-slate-900 border border-slate-200">
                    {t('nav.dashboard')}
                  </Link>
                  <button onClick={handleSignOut} className="block w-full text-center py-4 text-red-600 font-bold uppercase tracking-widest text-xs">
                    {t('nav.signOut')}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsOpen(false)} className="block w-full text-center py-4 bg-slate-50 rounded-2xl font-bold text-slate-900 border border-slate-200">
                    {t('nav.secureLogin')}
                  </Link>
                  <Link href="/signup" onClick={() => setIsOpen(false)} className="block w-full text-center py-4 bg-indigo-600 rounded-2xl font-bold text-white shadow-lg">
                    {t('nav.applyForAccess')}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
