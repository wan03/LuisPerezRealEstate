import { createClient } from '@/utils/supabase/server';
import ArticleGrid from '@/components/ArticleGrid';

async function getArticles() {
    const supabase = await createClient();
    const { data: articles, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching articles:', error);
        return [];
    }
    return articles;
}

export default async function EducationHub() {
    const articles = await getArticles();

    return (
        <div className="bg-bg min-h-screen text-ink">
            <ArticleGrid articles={articles} />
        </div>
    );
}
