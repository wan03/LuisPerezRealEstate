'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, BookOpen, ArrowRight, BookMarked, Filter } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface Article {
    slug: string;
    title: string;
    description: string | null;
    category: string | null;
    image_url: string | null;
    published_at: string | null;
    rss_guid: string | null;
    read_time: string | null;
}

const CATEGORY_KEYS = [
    { key: 'blog.allGuides', value: 'All Guides' },
    { key: 'blog.financing', value: 'Financing' },
    { key: 'blog.dueDiligence', value: 'Due Diligence' },
    { key: 'blog.taxes', value: 'Taxes' },
    { key: 'blog.marketTrends', value: 'Market Trends' },
];

export default function ArticleGrid({ articles }: { articles: Article[] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All Guides');
    const { t } = useTranslation();

    const filteredArticles = useMemo(() => {
        return articles.filter(article => {
            const matchesSearch = !searchQuery ||
                article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (article.description || '').toLowerCase().includes(searchQuery.toLowerCase());

            const matchesCategory = activeCategory === 'All Guides' ||
                (article.category || '').toLowerCase() === activeCategory.toLowerCase();

            return matchesSearch && matchesCategory;
        });
    }, [articles, searchQuery, activeCategory]);

    return (
        <>
            {/* Search */}
            <section className="relative overflow-hidden bg-bg2 border-b border-line py-20 px-5 md:px-8 text-ink">
                <div className="grid-bg" style={{ opacity: 0.25 }} />
                <div className="relative z-[2] max-w-4xl mx-auto text-center">
                    <div className="font-mono text-[10px] tracking-[0.1em] uppercase text-mut2 mb-4">{t('blog.subtitle')}</div>
                    <h1 className="text-[clamp(40px,7vw,72px)] font-black uppercase tracking-[-0.03em] leading-[0.9] mb-10">{t('blog.title')}</h1>

                    <div className="relative max-w-2xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-mut z-[2]" size={18} />
                        <input
                            type="text"
                            placeholder={t('blog.searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="lp-input pl-11 pr-4 py-4 text-[14px]"
                        />
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-5 md:px-8 py-16 md:py-20">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* Sidebar Filters */}
                    <aside className="lg:w-64 space-y-10 shrink-0">
                        <div>
                            <h3 className="font-mono text-[10px] text-mut2 uppercase tracking-[0.1em] mb-5 flex items-center gap-2">
                                <Filter size={13} /> {t('blog.categories')}
                            </h3>
                            <div className="space-y-1.5">
                                {CATEGORY_KEYS.map(({ key, value }) => (
                                    <button
                                        key={value}
                                        onClick={() => setActiveCategory(value)}
                                        className={`w-full text-left px-4 py-3 font-mono text-[11px] tracking-[0.08em] uppercase font-bold border transition-colors ${value === activeCategory ? 'bg-lime text-bg border-lime' : 'text-mut border-line hover:text-ink hover:border-mut'
                                            }`}
                                    >
                                        {t(key)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="corner-brackets bg-panel border border-line p-8 relative overflow-hidden">
                            <BookMarked className="absolute -bottom-4 -right-4 text-line" size={120} />
                            <h4 className="font-black text-lg uppercase tracking-[-0.02em] mb-4 leading-tight relative z-[2]">{t('blog.roadmapTitle')}</h4>
                            <p className="text-mut text-[13px] font-medium mb-6 leading-relaxed relative z-[2]">{t('blog.roadmapDescription')}</p>
                            <Link href="/dashboard" className="relative z-[2] inline-flex w-full items-center justify-center gap-2 font-extrabold text-[12px] tracking-[0.025em] uppercase px-5 py-3 bg-lime text-bg hover:bg-[#d2ff56] transition-colors active:translate-y-px">
                                {t('blog.goToDashboard')}
                            </Link>
                        </div>
                    </aside>

                    {/* Article List */}
                    <div className="flex-1 space-y-8">
                        {/* Active filter indicator */}
                        {(searchQuery || activeCategory !== 'All Guides') && (
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className="font-mono text-[10px] text-mut2 uppercase tracking-[0.1em]">{t('blog.showing')}</span>
                                {searchQuery && (
                                    <span className="border border-line bg-panel text-lime px-3 py-1 font-mono text-[11px] font-bold flex items-center gap-1">
                                        &quot;{searchQuery}&quot;
                                        <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-org">&times;</button>
                                    </span>
                                )}
                                {activeCategory !== 'All Guides' && (
                                    <span className="border border-line bg-panel text-lime px-3 py-1 font-mono text-[11px] font-bold flex items-center gap-1">
                                        {activeCategory}
                                        <button onClick={() => setActiveCategory('All Guides')} className="ml-1 hover:text-org">&times;</button>
                                    </span>
                                )}
                                <span className="text-mut font-mono text-[11px]">{filteredArticles.length} {filteredArticles.length !== 1 ? t('blog.results') : t('blog.result')}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px]">
                            {filteredArticles.length > 0 ? filteredArticles.map((article) => (
                                <Link key={article.slug} href={`/learn/${article.slug}`} className="group border border-line bg-panel overflow-hidden hover:border-lime hover:-translate-y-[3px] transition-all flex flex-col">
                                    <div className="h-48 w-full relative bg-bg2">
                                        {article.image_url ? (
                                            <img
                                                src={article.image_url}
                                                alt={article.title}
                                                className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'radial-gradient(circle at 70% 20%,rgba(59,98,255,.18),transparent 60%)' }}>
                                                <BookOpen size={48} className="text-line" />
                                            </div>
                                        )}
                                        <span className="absolute top-5 left-5 bg-bg text-lime px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.1em] border border-line">
                                            {article.category}
                                        </span>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="font-mono text-[10px] text-mut uppercase tracking-[0.1em]">
                                                {article.published_at ? new Date(article.published_at).toLocaleDateString() : t('blog.guide')}
                                            </span>
                                            {article.rss_guid && <span className="w-1 h-1 bg-mut2" />}
                                            {article.rss_guid && <span className="font-mono text-[10px] text-blue2 uppercase tracking-[0.1em]">{t('blog.marketFeed')}</span>}
                                        </div>
                                        <h3 className="text-[20px] font-extrabold uppercase tracking-[-0.01em] leading-[1.08] mb-3">{article.title}</h3>
                                        <p className="text-mut font-medium text-[13.5px] leading-[1.55] mb-6 flex-1">{article.description}</p>
                                        <div className="flex items-center justify-between mt-auto pt-5 border-t border-line">
                                            <span className="font-mono text-[10px] text-mut uppercase tracking-[0.1em]">{article.read_time}</span>
                                            <span className="font-mono text-[11px] font-bold text-mut group-hover:text-lime transition-colors flex items-center gap-1">{t('blog.readGuide')} <ArrowRight size={14} /></span>
                                        </div>
                                    </div>
                                </Link>
                            )) : (
                                <div className="col-span-2 bg-panel p-16 border border-line flex flex-col items-center justify-center text-center">
                                    <BookOpen size={48} className="text-line mb-4" />
                                    <p className="text-mut font-mono uppercase tracking-[0.1em] text-[11px] mb-2">{t('blog.noArticlesTitle')}</p>
                                    <p className="text-mut text-[13px] font-mono">{t('blog.noArticlesBody')}</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}
