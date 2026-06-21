'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';

export default function Footer() {
    const { t } = useTranslation();

    return (
        <footer className="border-t border-line">
            <div className="max-w-7xl mx-auto px-5 md:px-8 pt-[52px]">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 pb-10">
                    {/* Brand */}
                    <div>
                        <Link href="/" className="flex items-center gap-3">
                            <span className="lp-mark w-[38px] h-[38px] text-[14px]">LP</span>
                            <div>
                                <div className="font-black text-[16px] tracking-[-0.025em] uppercase leading-none">
                                    Luis Perez<span className="text-blue2">/RE</span>
                                </div>
                                <div className="font-mono text-[10px] text-mut mt-[3px]">Lakeland · Tampa Bay</div>
                            </div>
                        </Link>
                        <p className="font-mono text-[11px] text-mut leading-[1.75] mt-3.5 max-w-[28ch]">
                            {t('footer.tagline')}
                        </p>
                    </div>

                    {/* Platform */}
                    <div>
                        <h5 className="font-mono text-[10px] tracking-[0.14em] uppercase text-mut2 mb-3.5">{t('footer.platform')}</h5>
                        <Link href="/#marketplace" className="block text-[13px] font-semibold text-mut hover:text-ink mb-2.5 transition-colors">{t('nav.marketplace')}</Link>
                        <Link href="/#piti" className="block text-[13px] font-semibold text-mut hover:text-ink mb-2.5 transition-colors">{t('footer.pitiEngine')}</Link>
                        <Link href="/learn" className="block text-[13px] font-semibold text-mut hover:text-ink mb-2.5 transition-colors">{t('nav.educationHub')}</Link>
                        <Link href="/dashboard" className="block text-[13px] font-semibold text-mut hover:text-ink mb-2.5 transition-colors">{t('footer.commandCenter')}</Link>
                    </div>

                    {/* Markets */}
                    <div>
                        <h5 className="font-mono text-[10px] tracking-[0.14em] uppercase text-mut2 mb-3.5">{t('footer.markets')}</h5>
                        <span className="block text-[13px] font-semibold text-mut mb-2.5">{t('footer.marketLakeland')}</span>
                        <span className="block text-[13px] font-semibold text-mut mb-2.5">{t('footer.marketWinterHaven')}</span>
                        <span className="block text-[13px] font-semibold text-mut mb-2.5">{t('footer.marketPlantCity')}</span>
                        <span className="block text-[13px] font-semibold text-mut mb-2.5">{t('footer.marketBartow')}</span>
                    </div>

                    {/* Connect */}
                    <div>
                        <h5 className="font-mono text-[10px] tracking-[0.14em] uppercase text-mut2 mb-3.5">{t('footer.connect')}</h5>
                        <a href="tel:+18635550100" className="block text-[13px] font-semibold text-mut hover:text-ink mb-2.5 transition-colors">(863) 555-0100</a>
                        <a href="mailto:luis@luisperezre.com" className="block text-[13px] font-semibold text-mut hover:text-ink mb-2.5 transition-colors">luis@luisperezre.com</a>
                        <a href="#" className="block text-[13px] font-semibold text-mut hover:text-ink mb-2.5 transition-colors">TikTok @LuisPerezRE</a>
                        <a href="#" className="block text-[13px] font-semibold text-mut hover:text-ink mb-2.5 transition-colors">Instagram</a>
                    </div>
                </div>

                <div className="border-t border-line py-[18px] flex flex-wrap justify-between items-center gap-4">
                    <span className="font-mono text-[10px] tracking-[0.06em] uppercase text-mut2">{t('footer.legal')}</span>
                    <span className="font-mono text-[10px] tracking-[0.06em] uppercase text-mut2">{t('footer.poweredBy')}</span>
                </div>
            </div>
        </footer>
    );
}
