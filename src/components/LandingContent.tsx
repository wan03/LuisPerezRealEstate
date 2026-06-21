'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, MonitorSmartphone, Video, Check } from 'lucide-react';
import ListingCard from '@/components/ListingCard';
import PITICalculator from '@/components/PITICalculator';
import HeroCTA from '@/components/HeroCTA';
import FinalCTA from '@/components/FinalCTA';
import Ticker from '@/components/Ticker';
import Reveal from '@/components/Reveal';
import CountUp from '@/components/CountUp';
import { useTranslation } from '@/lib/i18n';

interface Listing {
    id: string;
    title: string;
    price: number;
    is_vacant_land: boolean | null;
    zoning_type: string | null;
    flood_zone: string | null;
    school_data: { rating: number } | null;
    video_url: string | null;
}

interface Article {
    slug: string;
    title: string;
    category: string;
    description: string | null;
}

const FALLBACK_ARTICLES = [
    { title: 'The Florida CDD Fee Guide', slug: 'cdd-guide', category: 'Financing', description: null },
    { title: 'Choosing the Right Septic Pro', slug: 'septic-101', category: 'Due Diligence', description: null },
    { title: 'Homestead Exemption Hacks', slug: 'homestead-exemption', category: 'Taxes', description: null },
];

export default function LandingContent({ listings, articles }: { listings: Listing[]; articles: Article[] }) {
    const { t } = useTranslation();

    const articleList = articles.length > 0 ? articles : FALLBACK_ARTICLES;

    const ghostBtn = 'inline-flex items-center justify-center gap-2 font-extrabold text-[14px] tracking-[0.025em] uppercase px-6 py-[15px] bg-panel2 text-ink hover:bg-elev transition-colors active:translate-y-px';
    const blueBtn = 'inline-flex items-center justify-center gap-2 font-extrabold text-[14px] tracking-[0.025em] uppercase px-6 py-[15px] bg-blue text-white hover:bg-blue2 transition-colors active:translate-y-px';

    const processSteps = [
        { n: '01', Icon: Phone, title: t('process.step1Title'), body: t('process.step1Body') },
        { n: '02', Icon: MonitorSmartphone, title: t('process.step2Title'), body: t('process.step2Body') },
        { n: '03', Icon: Video, title: t('process.step3Title'), body: t('process.step3Body') },
        { n: '04', Icon: Check, title: t('process.step4Title'), body: t('process.step4Body') },
    ];

    return (
        <div className="bg-bg text-ink">
            {/* ============ HERO ============ */}
            <header className="relative overflow-hidden border-b border-line">
                <div className="grid-bg" />
                {/* floating accent dots */}
                <span className="absolute w-2.5 h-2.5 rounded-full" style={{ top: '22%', left: '17%', background: 'var(--blue)', boxShadow: '0 0 0 5px rgba(59,98,255,.15)' }} />
                <span className="absolute w-2.5 h-2.5 rounded-full" style={{ top: '66%', left: '27%', background: 'var(--lime)', boxShadow: '0 0 0 5px rgba(196,242,74,.12)' }} />
                <span className="absolute w-2.5 h-2.5 rounded-full" style={{ top: '40%', left: '7%', background: 'var(--org)', boxShadow: '0 0 0 5px rgba(255,106,61,.12)' }} />

                <div className="relative z-[2] max-w-7xl mx-auto px-5 md:px-8 grid lg:grid-cols-[1.3fr_0.7fr] gap-10 lg:gap-12 items-center py-14 md:py-20 lg:py-[90px]">
                    <div>
                        <div className="inline-flex items-center gap-2.5 border border-line bg-bg2 px-3.5 py-2 mb-6">
                            <span className="lp-live-dot" />
                            <span className="font-mono text-[11px] tracking-[0.12em] uppercase">{t('hero.serving')}</span>
                        </div>
                        <h1 className="text-[clamp(42px,7.4vw,102px)] font-black uppercase tracking-[-0.04em] leading-[0.86] mb-6">
                            {t('hero.heading')}<br />
                            <em className="not-italic text-blue2">{t('hero.headingHighlight')}</em>{' '}
                            <span style={{ color: 'transparent', WebkitTextStroke: '2px var(--ink)' }}>{t('hero.headingTail')}</span>
                        </h1>
                        <p className="text-[17px] text-mut max-w-[44ch] mb-7 leading-[1.65]">{t('hero.subheading')}</p>
                        <div className="flex flex-wrap gap-3">
                            <HeroCTA />
                            <Link href="#marketplace" className={ghostBtn}>{t('hero.browseListings')}</Link>
                        </div>
                    </div>

                    {/* Number panel */}
                    <div className="corner-brackets bg-panel border border-line p-7">
                        <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-mut">{t('hero.samplePanelLabel')}</div>
                        <div className="text-[58px] font-black tracking-[-0.035em] leading-none mt-1.5 mb-1">
                            $<CountUp end={2253} /><small className="text-[20px] text-mut font-semibold">{t('piti.perMonth')}</small>
                        </div>
                        <div className="font-mono text-[11px] text-lime mb-4">▴ {t('hero.samplePanelNote')}</div>
                        <div className="flex flex-col gap-2.5">
                            <div>
                                <div className="flex justify-between font-mono text-[11px] text-mut mb-1"><span>{t('hero.samplePI')}</span><b className="text-ink">$1,758</b></div>
                                <div className="lp-track"><i style={{ width: '73%', background: 'var(--blue)' }} /></div>
                            </div>
                            <div>
                                <div className="flex justify-between font-mono text-[11px] text-mut mb-1"><span>{t('hero.sampleTax')}</span><b className="text-ink">$295</b></div>
                                <div className="lp-track"><i style={{ width: '12%', background: 'var(--org)' }} /></div>
                            </div>
                            <div>
                                <div className="flex justify-between font-mono text-[11px] text-mut mb-1"><span>{t('hero.sampleIns')}</span><b className="text-ink">$200</b></div>
                                <div className="lp-track"><i style={{ width: '8%', background: 'var(--lime)' }} /></div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ============ TICKER ============ */}
            <Ticker />

            <main className="max-w-7xl mx-auto px-5 md:px-8">

                {/* ============ MARKETPLACE (01) ============ */}
                <Reveal id="marketplace" className="py-14 md:py-[88px]">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-11">
                        <div>
                            <div className="font-mono text-[10px] tracking-[0.1em] uppercase text-mut2 mb-2">01 / {t('marketplace.badge')}</div>
                            <h2 className="text-[clamp(32px,4.2vw,56px)] font-black uppercase tracking-[-0.03em] leading-[0.96]">{t('marketplace.title')}</h2>
                        </div>
                        <Link href="/learn" className="font-mono text-[11px] font-bold text-lime inline-flex gap-2 items-center hover:gap-3 transition-all">{t('marketplace.viewAll')} →</Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-[18px]">
                        {listings.length > 0 ? listings.map((listing) => (
                            <ListingCard key={listing.id} listing={{
                                id: listing.id,
                                title: listing.title,
                                price: Number(listing.price),
                                location: 'Polk County, FL',
                                isVacantLand: listing.is_vacant_land ?? false,
                                zoning: listing.zoning_type ?? undefined,
                                floodZone: listing.flood_zone ?? undefined,
                                schoolRating: listing.school_data?.rating ?? undefined,
                                videoUrl: listing.video_url ?? undefined,
                            }} />
                        )) : (
                            <div className="bg-panel border border-line p-12 flex items-center justify-center col-span-full">
                                <p className="text-mut font-bold uppercase tracking-widest text-xs">{t('marketplace.emptyState')}</p>
                            </div>
                        )}
                    </div>
                </Reveal>

                {/* ============ PROCESS (02) ============ */}
                <Reveal id="process" className="py-14 md:py-[88px]">
                    <div className="mb-11">
                        <div className="font-mono text-[10px] tracking-[0.1em] uppercase text-mut2 mb-2">02 / {t('process.sectionLabel')}</div>
                        <h2 className="text-[clamp(32px,4.2vw,56px)] font-black uppercase tracking-[-0.03em] leading-[0.96]">{t('process.title')} <em className="not-italic text-blue2">{t('process.titleHighlight')}</em></h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line">
                        {processSteps.map(({ n, Icon, title, body }) => (
                            <div key={n} className="group bg-panel hover:bg-panel2 transition-colors p-6 md:px-6 md:py-[30px] relative">
                                <div className="font-mono text-[36px] font-bold text-line leading-none mb-3.5 group-hover:text-blue transition-colors">{n}</div>
                                <Icon className="absolute top-[26px] right-[22px] text-line group-hover:text-lime transition-colors" size={22} />
                                <h4 className="text-[15px] font-black uppercase tracking-[-0.01em] mb-2">{title}</h4>
                                <p className="text-[13px] text-mut leading-relaxed">{body}</p>
                            </div>
                        ))}
                    </div>
                </Reveal>

                {/* ============ PITI ENGINE (03) ============ */}
                <Reveal id="piti" className="py-14 md:py-[88px]">
                    <PITICalculator initialPrice={345000} />
                </Reveal>

                {/* ============ PROOF (04) ============ */}
                <Reveal id="proof" className="py-14 md:py-[88px]">
                    <div className="mb-11">
                        <div className="font-mono text-[10px] tracking-[0.1em] uppercase text-mut2 mb-2">04 / {t('proof.badge')}</div>
                        <h2 className="text-[clamp(32px,4.2vw,56px)] font-black uppercase tracking-[-0.03em] leading-[0.96]">{t('proof.title2')} <em className="not-italic text-blue2">{t('proof.titleHighlight2')}</em></h2>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-[18px] mb-9">
                        <div className="border border-line bg-panel p-6">
                            <div className="text-[52px] font-black tracking-[-0.03em] leading-none text-blue2"><CountUp end={48} onView /></div>
                            <div className="font-mono text-[11px] text-mut mt-[7px]">{t('proof.stat1Label')}</div>
                        </div>
                        <div className="border border-line bg-panel p-6">
                            <div className="text-[52px] font-black tracking-[-0.03em] leading-none text-lime"><CountUp end={21} suffix="d" onView /></div>
                            <div className="font-mono text-[11px] text-mut mt-[7px]">{t('proof.stat2Label')}</div>
                        </div>
                        <div className="border border-line bg-panel p-6">
                            <div className="text-[52px] font-black tracking-[-0.03em] leading-none text-org"><CountUp end={4200} prefix="$" onView /></div>
                            <div className="font-mono text-[11px] text-mut mt-[7px]">{t('proof.stat3Label')}</div>
                        </div>
                    </div>

                    {/* Stories */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-[18px]">
                        {[
                            { img: '/success-stories/success_story_1_family_1770935873666.png', badge: t('proof.story1Badge'), badgeBg: 'var(--lime)', badgeColor: 'var(--bg)', quote: t('proof.story1Quote'), name: t('proof.story1Name'), sub: t('proof.story1Subtitle') },
                            { img: '/success-stories/success_story_2_retired_couple_1770935887330.png', badge: t('proof.story2Badge'), badgeBg: 'var(--blue)', badgeColor: '#fff', quote: t('proof.story2Quote'), name: t('proof.story2Name'), sub: t('proof.story2Subtitle') },
                            { img: '/success-stories/success_story_3_young_entrepreneur_1770935906217.png', badge: t('proof.story3Badge'), badgeBg: 'var(--org)', badgeColor: '#1a0904', quote: t('proof.story3Quote'), name: t('proof.story3Name'), sub: t('proof.story3Subtitle') },
                        ].map((s, i) => (
                            <div key={i} className="group border border-line bg-panel overflow-hidden hover:border-blue hover:-translate-y-[3px] transition-all">
                                <div className="relative aspect-[16/11] overflow-hidden">
                                    <img src={s.img} alt={s.name} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                                    <span className="absolute top-3 left-3 font-mono text-[10px] font-bold uppercase px-2 py-1" style={{ background: s.badgeBg, color: s.badgeColor }}>{s.badge}</span>
                                </div>
                                <div className="p-5">
                                    <blockquote className="text-[14px] leading-relaxed mb-3">{s.quote}</blockquote>
                                    <div className="font-mono text-[10.5px] text-mut uppercase"><b className="text-blue2">{s.name}</b> · {s.sub}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Reveal>

                {/* ============ LIBRARY (05) ============ */}
                <Reveal id="library" className="py-14 md:py-[88px]">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-11">
                        <div>
                            <div className="font-mono text-[10px] tracking-[0.1em] uppercase text-mut2 mb-2">05 / {t('library.badge')}</div>
                            <h2 className="text-[clamp(32px,4.2vw,56px)] font-black uppercase tracking-[-0.03em] leading-[0.96]">{t('library.title')}</h2>
                        </div>
                        <Link href="/learn" className="font-mono text-[11px] font-bold text-lime inline-flex gap-2 items-center hover:gap-3 transition-all">{t('common.fullHub')} →</Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-[18px]">
                        {articleList.map((article) => (
                            <Link key={article.slug} href={`/learn/${article.slug}`} className="group border border-line bg-panel p-6 hover:border-lime hover:-translate-y-[3px] transition-all">
                                <span className="block font-mono text-[10px] tracking-[0.1em] uppercase text-lime mb-3">{article.category}</span>
                                <h3 className="text-[18px] font-extrabold uppercase tracking-[-0.01em] leading-[1.08] mb-2.5">{article.title}</h3>
                                <p className="text-mut text-[13.5px] mb-4 leading-[1.55]">{article.description || t('library.fallbackDescription')}</p>
                                <span className="font-mono text-[11px] font-bold text-mut group-hover:text-lime transition-colors">{t('library.readArticle')} →</span>
                            </Link>
                        ))}
                    </div>
                </Reveal>

                {/* ============ FINAL CTA ============ */}
                <Reveal id="cta" className="pb-14 md:pb-[88px]">
                    <FinalCTA />
                </Reveal>
            </main>
        </div>
    );
}
