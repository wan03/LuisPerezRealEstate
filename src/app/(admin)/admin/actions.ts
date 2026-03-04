'use server';

import { createClient } from '@supabase/supabase-js';

// Initialize a supabase admin client with the service role key to bypass RLS
// Note: This requires SUPABASE_SERVICE_ROLE_KEY to be set in the environment
const getAdminClient = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
};

export async function fetchSystemStats() {
    const supabaseAdmin = getAdminClient();

    try {
        // Fetch Pipeline (Threads)
        const { count: threadCount } = await supabaseAdmin
            .from('chat_threads')
            .select('*', { count: 'exact', head: true });

        // Fetch Clients
        const { count: clientCount } = await supabaseAdmin
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'client');

        // Fetch Articles
        const { count: articleCount } = await supabaseAdmin
            .from('articles')
            .select('*', { count: 'exact', head: true });

        return {
            threadCount: threadCount || 0,
            clientCount: clientCount || 0,
            articleCount: articleCount || 0,
        };
    } catch (error) {
        console.error('Failed to fetch system stats:', error);
        return {
            threadCount: 0,
            clientCount: 0,
            articleCount: 0,
        };
    }
}
