'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Video, Calculator, GraduationCap } from 'lucide-react';
import ListingCard from '@/components/ListingCard';
import PITICalculator from '@/components/PITICalculator';
import HeroCTA from '@/components/HeroCTA';
import FinalCTA from '@/components/FinalCTA';
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

    return (
        <div className="bg-slate-50">
            {/* Hero Section */}
            <section className="bg-slate-900 text-white py-24 md:py-32 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 bg-indigo-600/20 border border-indigo-500/30 px-4 py-2 rounded-full mb-8">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                            <span className="text-xs font-black tracking-widest uppercase text-indigo-300">{t('hero.badge')}</span>
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
                            {t('hero.heading')} <span className="italic text-indigo-400">{t('hero.headingHighlight')}</span>
                        </h1>
                        <p className="text-xl text-slate-400 font-medium mb-10 leading-relaxed max-w-2xl">
                            {t('hero.subheading')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <HeroCTA />
                            <Link href="/learn" className="bg-slate-800 text-white px-8 py-5 rounded-2xl font-black text-lg hover:bg-slate-700 transition-all text-center border border-slate-700">
                                {t('hero.exploreKnowledge')}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 py-20 space-y-32">

                {/* Marketplace Section */}
                <section className="space-y-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-slate-900 pb-8">
                        <div>
                            <div className="flex items-center gap-2 text-indigo-600 font-black uppercase tracking-widest text-sm mb-2">
                                <Video size={16} /> {t('marketplace.badge')}
                            </div>
                            <h2 className="text-5xl font-black italic uppercase">{t('marketplace.title')}</h2>
                        </div>
                        <Link href="/" className="text-slate-900 font-black flex items-center gap-2 group text-lg">
                            {t('marketplace.viewAll')} <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {listings.length > 0 ? listings.map((listing) => (
                            <ListingCard key={listing.id} listing={{
                                id: listing.id,
                                title: listing.title,
                                price: Number(listing.price),
                                location: 'Highlands County, FL',
                                isVacantLand: listing.is_vacant_land ?? false,
                                zoning: listing.zoning_type ?? undefined,
                                floodZone: listing.flood_zone ?? undefined,
                                schoolRating: listing.school_data?.rating ?? undefined,
                                videoUrl: listing.video_url ?? undefined,
                            }} />
                        )) : (
                            <div className="bg-white rounded-3xl p-12 border border-slate-200 flex items-center justify-center col-span-3">
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">{t('marketplace.emptyState')}</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Tools Section */}
                <section className="bg-white rounded-[40px] p-8 md:p-16 shadow-2xl shadow-indigo-100 border border-slate-100 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-12 opacity-5">
                        <Calculator size={300} />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-1 gap-12 items-start relative z-10">
                        <div className="max-w-3xl">
                            <div className="flex items-center gap-2 text-indigo-600 font-black uppercase tracking-widest text-sm mb-4">
                                <Calculator size={16} /> {t('tools.badge')}
                            </div>
                            <h2 className="text-5xl font-black uppercase mb-6 leading-tight">{t('tools.title')} <span className="text-indigo-600">{t('tools.titleHighlight')}</span></h2>
                            <p className="text-slate-500 font-bold text-xl mb-12">{t('tools.description')}</p>
                        </div>
                        <PITICalculator initialPrice={125000} />
                    </div>
                </section>

                {/* Success Stories Section */}
                <section className="space-y-16">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full mb-6">
                            <span className="text-xs font-black tracking-widest uppercase text-indigo-600">{t('proof.badge')}</span>
                        </div>
                        <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tight mb-6">{t('proof.title')} <span className="italic text-indigo-600">{t('proof.titleHighlight')}</span></h2>
                        <p className="text-xl text-slate-500 font-bold max-w-2xl mx-auto italic">{t('proof.testimonialMain')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {/* Story 1 */}
                        <div className="group">
                            <div className="relative h-96 rounded-[32px] overflow-hidden mb-6 shadow-xl shadow-slate-200">
                                <img src="/success-stories/success_story_1_family_1770935873666.png" alt="Happy family in Highlands County" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit mb-2">{t('proof.story1Badge')}</div>
                                    <p className="text-white font-black text-xl italic">{t('proof.story1Name')}</p>
                                    <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest">{t('proof.story1Subtitle')}</p>
                                </div>
                            </div>
                            <p className="text-slate-600 font-medium leading-relaxed italic">{t('proof.story1Quote')}</p>
                        </div>

                        {/* Story 2 */}
                        <div className="group">
                            <div className="relative h-96 rounded-[32px] overflow-hidden mb-6 shadow-xl shadow-slate-200">
                                <img src="/success-stories/success_story_2_retired_couple_1770935887330.png" alt="Retired couple on their lakefront porch" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit mb-2">{t('proof.story2Badge')}</div>
                                    <p className="text-white font-black text-xl italic">{t('proof.story2Name')}</p>
                                    <p className="text-emerald-200 text-xs font-bold uppercase tracking-widest">{t('proof.story2Subtitle')}</p>
                                </div>
                            </div>
                            <p className="text-slate-600 font-medium leading-relaxed italic">{t('proof.story2Quote')}</p>
                        </div>

                        {/* Story 3 */}
                        <div className="group">
                            <div className="relative h-96 rounded-[32px] overflow-hidden mb-6 shadow-xl shadow-slate-200">
                                <img src="/success-stories/success_story_3_young_entrepreneur_1770935906217.png" alt="Young man standing on his new land" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit mb-2">{t('proof.story3Badge')}</div>
                                    <p className="text-white font-black text-xl italic">{t('proof.story3Name')}</p>
                                    <p className="text-amber-200 text-xs font-bold uppercase tracking-widest">{t('proof.story3Subtitle')}</p>
                                </div>
                            </div>
                            <p className="text-slate-600 font-medium leading-relaxed italic">{t('proof.story3Quote')}</p>
                        </div>
                    </div>
                </section>

                {/* Education Hub Preview */}
                <section className="space-y-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-slate-900 pb-8">
                        <div>
                            <div className="flex items-center gap-2 text-indigo-600 font-black uppercase tracking-widest text-sm mb-2">
                                <GraduationCap size={16} /> {t('library.badge')}
                            </div>
                            <h2 className="text-5xl font-black italic uppercase">{t('library.title')}</h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {articleList.map((article) => (
                            <Link key={article.slug} href={`/learn/${article.slug}`} className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-indigo-600 transition-all group shadow-sm">
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-4 inline-block">{article.category}</span>
                                <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors mb-4">{article.title}</h3>
                                <p className="text-slate-500 font-medium mb-6">{article.description || t('library.fallbackDescription')}</p>
                                <span className="text-slate-900 font-black flex items-center gap-2 text-sm italic">{t('library.readArticle')} <ArrowRight size={16} /></span>
                            </Link>
                        ))}
                    </div>

                    <div className="text-center pt-8">
                        <Link href="/learn" className="inline-flex items-center justify-center bg-slate-950 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-slate-800 transition-all shadow-xl">
                            {t('library.visitHub')}
                        </Link>
                    </div>
                </section>

                {/* Final CTA */}
                <FinalCTA />
            </div>
        </div>
    );
}
