import DOMPurify from 'isomorphic-dompurify';

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
        .single();

    if (error || !data) {
        return null;
    }
    return data as Article;
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const article = await getArticle(slug);

    if (!article) notFound();

    const sanitizedContent = DOMPurify.sanitize(article.content);

    return (
        <div className="bg-bg min-h-screen pb-32 text-ink">
            {/* Top Bar */}
            <div className="bg-bg2 border-b border-line sticky top-[72px] z-40">
                <div className="max-w-4xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
                    <Link href="/learn" className="flex items-center gap-2 text-mut hover:text-lime transition-colors font-mono text-[11px] tracking-[0.1em] uppercase font-bold">
                        <ChevronLeft size={16} /> Back to Library
                    </Link>
                    <div className="flex items-center gap-4">
                        <button className="text-mut hover:text-ink transition-colors"><Bookmark size={18} /></button>
                        <button className="text-mut hover:text-ink transition-colors"><Share2 size={18} /></button>
                        <button className="text-mut hover:text-ink transition-colors md:block hidden"><Printer size={18} /></button>
                    </div>
                </div>
            </div>

            <article className="max-w-4xl mx-auto px-5 md:px-8 pt-16">
                {/* Meta */}
                <div className="mb-12">
                    <div className="flex items-center gap-4 mb-6 flex-wrap">
                        <span className="font-mono text-[11px] font-bold tracking-[0.1em] uppercase text-lime">
                            {article.category}
                        </span>
                        <div className="flex items-center gap-1.5 text-mut font-mono text-[11px] uppercase tracking-[0.1em]">
                            <Clock size={13} /> {article.read_time}
                        </div>
                        {article.published_at && (
                            <div className="flex items-center gap-1.5 text-mut font-mono text-[11px] uppercase tracking-[0.1em] border-l border-line pl-4">
                                {new Date(article.published_at).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                    <h1 className="text-[clamp(38px,6vw,80px)] font-black uppercase tracking-[-0.03em] leading-[0.92] mb-8">
                        {article.title}
                    </h1>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 py-6 border-y border-line">
                        <div className="flex items-center gap-3">
                            <span className="lp-mark w-10 h-10 text-[13px]">LP</span>
                            <div>
                                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-ink">{article.author || 'Luis Perez'}</p>
                                <p className="font-mono text-[10px] text-mut uppercase tracking-[0.1em] mt-0.5">Highlands County Authority</p>
                            </div>
                        </div>
                        {article.source_url && (
                            <a
                                href={article.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-lime flex items-center gap-2 hover:gap-3 transition-all"
                            >
                                View Original Content <ArrowRight size={12} />
                            </a>
                        )}
                    </div>
                    <p className="text-lg md:text-xl text-mut font-medium leading-relaxed border-l-2 border-lime pl-6">
                        {article.description}
                    </p>
                </div>

                {/* Hero Image / Placeholder */}
                <div className="aspect-video bg-panel border border-line mb-16 flex items-center justify-center overflow-hidden">
                    {article.image_url ? (
                        <img
                            src={article.image_url}
                            alt={article.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="text-line font-black text-9xl uppercase tracking-[-0.03em] select-none">Masterclass</div>
                    )}
                </div>

                {/* Content Section */}
                <div
                    className="prose prose-invert prose-lg max-w-none leading-[1.8] prose-headings:font-black prose-headings:tracking-[-0.02em] prose-headings:uppercase prose-p:mb-8 prose-p:text-mut prose-h2:text-3xl prose-h2:mt-12 prose-h2:text-ink prose-h3:text-2xl prose-h3:mt-8 prose-h3:text-ink prose-a:text-blue2 prose-a:no-underline hover:prose-a:text-lime prose-strong:text-ink prose-li:text-mut"
                    dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                />

                {/* CTA */}
                <div className="corner-brackets mt-20 p-10 md:p-12 bg-panel border border-line flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="max-w-md">
                        <h3 className="text-2xl font-black uppercase tracking-[-0.02em] mb-2">Ready to take the <span className="text-lime">next step?</span></h3>
                        <p className="text-mut font-medium text-[14px] leading-relaxed">Get a custom property report and transaction roadmap for Highlands County.</p>
                    </div>
                    <BlogCTA />
                </div>
            </article>
        </div>
    );
}
