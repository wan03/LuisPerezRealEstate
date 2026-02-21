import { createClient } from '@/utils/supabase/server';
import LandingContent from '@/components/LandingContent';

async function getListings() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
    if (error) {
        console.error('Error fetching listings:', error);
        return [];
    }
    return data ?? [];
}

async function getArticles() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('articles')
        .select('slug, title, category, description')
        .order('created_at', { ascending: false })
        .limit(3);
    if (error) {
        console.error('Error fetching articles:', error);
        return [];
    }
    return data ?? [];
}

export default async function LandingPage() {
    const [listings, articles] = await Promise.all([getListings(), getArticles()]);

    return <LandingContent listings={listings} articles={articles} />;
}
