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
            <section className="bg-slate-900 py-24 px-4 text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-black italic mb-6 uppercase tracking-tighter">{t('blog.title')}</h1>
                    <p className="text-slate-400 font-bold text-xl mb-12 uppercase tracking-widest">{t('blog.subtitle')}</p>

                    <div className="relative max-w-2xl mx-auto">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={24} />
                        <input
                            type="text"
                            placeholder={t('blog.searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white text-slate-900 rounded-3xl py-6 pl-16 pr-8 font-black text-lg focus:outline-none focus:ring-4 focus:ring-indigo-600/20 shadow-2xl transition-all"
                        />
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-20">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* Sidebar Filters */}
                    <aside className="lg:w-64 space-y-10 shrink-0">
                        <div>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                <Filter size={14} /> {t('blog.categories')}
                            </h3>
                            <div className="space-y-2">
                                {CATEGORY_KEYS.map(({ key, value }) => (
                                    <button
                                        key={value}
                                        onClick={() => setActiveCategory(value)}
                                        className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all ${value === activeCategory ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-600 hover:bg-slate-100'
                                            }`}
                                    >
                                        {t(key)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-indigo-900 rounded-[32px] p-8 text-white relative overflow-hidden">
                            <BookMarked className="absolute -bottom-4 -right-4 text-white/10" size={120} />
                            <h4 className="font-black text-lg mb-4 italic leading-tight">{t('blog.roadmapTitle')}</h4>
                            <p className="text-indigo-300 text-xs font-medium mb-6">{t('blog.roadmapDescription')}</p>
                            <Link href="/dashboard" className="block w-full text-center bg-white text-indigo-900 py-3 rounded-xl font-black text-xs uppercase tracking-widest">
                                {t('blog.goToDashboard')}
                            </Link>
                        </div>
                    </aside>

                    {/* Article List */}
                    <div className="flex-1 space-y-8">
                        {/* Active filter indicator */}
                        {(searchQuery || activeCategory !== 'All Guides') && (
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('blog.showing')}</span>
                                {searchQuery && (
                                    <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1">
                                        &quot;{searchQuery}&quot;
                                        <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-red-500">&times;</button>
                                    </span>
                                )}
                                {activeCategory !== 'All Guides' && (
                                    <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1">
                                        {activeCategory}
                                        <button onClick={() => setActiveCategory('All Guides')} className="ml-1 hover:text-red-500">&times;</button>
                                    </span>
                                )}
                                <span className="text-slate-400 text-xs font-bold">{filteredArticles.length} {filteredArticles.length !== 1 ? t('blog.results') : t('blog.result')}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {filteredArticles.length > 0 ? filteredArticles.map((article) => (
                                <Link key={article.slug} href={`/learn/${article.slug}`} className="bg-white rounded-[32px] overflow-hidden border border-slate-200 hover:border-indigo-600 transition-all group shadow-sm flex flex-col">
                                    <div className="h-48 bg-slate-200 w-full relative">
                                        {article.image_url ? (
                                            <img
                                                src={article.image_url}
                                                alt={article.title}
                                                className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-slate-900 flex items-center justify-center">
                                                <BookOpen size={48} className="text-white/20" />
                                            </div>
                                        )}
                                        <span className="absolute top-6 left-6 bg-white text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                                            {article.category}
                                        </span>
                                    </div>
                                    <div className="p-8 flex-1 flex flex-col">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                {article.published_at ? new Date(article.published_at).toLocaleDateString() : t('blog.guide')}
                                            </span>
                                            {article.rss_guid && <span className="w-1 h-1 rounded-full bg-slate-300" />}
                                            {article.rss_guid && <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{t('blog.marketFeed')}</span>}
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors leading-tight">{article.title}</h3>
                                        <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8 flex-1">{article.description}</p>
                                        <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
                                            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">{article.read_time}</span>
                                            <span className="text-slate-900 font-black flex items-center gap-1 text-sm italic">{t('blog.readGuide')} <ArrowRight size={16} /></span>
                                        </div>
                                    </div>
                                </Link>
                            )) : (
                                <div className="col-span-2 bg-white rounded-3xl p-16 border border-slate-200 flex flex-col items-center justify-center text-center">
                                    <BookOpen size={48} className="text-slate-200 mb-4" />
                                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs mb-2">{t('blog.noArticlesTitle')}</p>
                                    <p className="text-slate-400 text-sm">{t('blog.noArticlesBody')}</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}
