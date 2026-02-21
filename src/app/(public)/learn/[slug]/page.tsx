import Link from 'next/link';
import { ChevronLeft, Share2, Printer, Bookmark, Clock, ArrowRight } from 'lucide-react';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import BlogCTA from '@/components/BlogCTA';

interface Article {
    id: string;
    title: string;
    slug: string;
    category: string;
    description: string;
    content: string;
    read_time: string;
    created_at: string;
    published_at?: string;
    author?: string;
    source_url?: string;
    image_url?: string;
}

async function getArticle(slug: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .single(); // Supabase types might be inferred if generated types were available, but for now we rely on runtime or explicit cast if we had generated types. Since we don't, 'data' is any.

    if (error || !data) {
        return null;
    }
    return data as Article;
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const article = await getArticle(slug);

    if (!article) notFound();

    return (
        <div className="bg-white min-h-screen pb-32 text-black">
            {/* Top Bar */}
            <div className="bg-slate-50 border-b border-slate-200 sticky top-20 z-40">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/learn" className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-bold text-sm">
                        <ChevronLeft size={18} /> Back to Library
                    </Link>
                    <div className="flex items-center gap-4">
                        <button className="text-slate-400 hover:text-slate-600 transition-colors"><Bookmark size={20} /></button>
                        <button className="text-slate-400 hover:text-slate-600 transition-colors"><Share2 size={20} /></button>
                        <button className="text-slate-400 hover:text-slate-600 transition-colors md:block hidden"><Printer size={20} /></button>
                    </div>
                </div>
            </div>

            <article className="max-w-4xl mx-auto px-4 pt-16">
                {/* Meta */}
                <div className="mb-12 text-black">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full">
                            {article.category}
                        </span>
                        <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                            <Clock size={14} /> {article.read_time}
                        </div>
                        {article.published_at && (
                            <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-widest border-l border-slate-200 pl-3">
                                {new Date(article.published_at).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 leading-[0.95] mb-8 italic">
                        {article.title}
                    </h1>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 py-6 border-y border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-indigo-600">LP</div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-slate-900">{article.author || 'Luis Perez'}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Highlands County Authority</p>
                            </div>
                        </div>
                        {article.source_url && (
                            <a
                                href={article.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2 hover:text-indigo-700 transition-colors"
                            >
                                View Original Content <ArrowRight size={12} />
                            </a>
                        )}
                    </div>
                    <p className="text-xl md:text-2xl text-slate-500 font-medium leading-relaxed italic border-l-4 border-slate-200 pl-6">
                        {article.description}
                    </p>
                </div>

                {/* Hero Image / Placeholder */}
                <div className="aspect-video bg-slate-900 rounded-[40px] mb-16 flex items-center justify-center overflow-hidden shadow-2xl">
                    {article.image_url ? (
                        <img
                            src={article.image_url}
                            alt={article.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="text-white/10 font-black text-9xl italic uppercase select-none -rotate-6">Masterclass</div>
                    )}
                </div>

                {/* Content Section */}
                <div className="prose prose-slate prose-xl max-w-none text-slate-700 font-medium leading-[1.8] text-black">
                    {article.content.trim().split('\n\n').map((para, i) => {
                        // Improved parser for basic md/html coming from RSS
                        const cleanPara = para.replace(/<[^>]*>/g, "").trim();
                        if (!cleanPara) return null;

                        if (para.startsWith('# ')) {
                            return <h1 key={i} className="text-4xl font-black text-slate-900 mt-16 mb-8 uppercase tracking-tighter italic leading-tight">{cleanPara.replace('# ', '')}</h1>;
                        }
                        if (para.startsWith('## ') || para.startsWith('#### ')) {
                            return <h2 key={i} className="text-3xl font-black text-slate-900 mt-12 mb-6 uppercase tracking-tighter">{cleanPara.replace(/#/g, '').trim()}</h2>;
                        }
                        if (para.startsWith('1. ') || para.match(/^\d+\. /)) {
                            return <div key={i} className="my-6 pl-8 border-l-2 border-indigo-100 italic font-black text-black">{cleanPara}</div>
                        }
                        return <p key={i} className="mb-8 text-slate-700">{cleanPara}</p>;
                    })}
                </div>

                {/* CTA */}
                <div className="mt-20 p-12 bg-slate-50 rounded-[40px] border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-8 text-black">
                    <div className="max-w-md">
                        <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Ready to take the next step?</h3>
                        <p className="text-slate-500 font-medium">Get a custom property report and transaction roadmap for Highlands County.</p>
                    </div>
                    <BlogCTA />
                </div>
            </article>
        </div>
    );
}
