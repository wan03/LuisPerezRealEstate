import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// RSS Parser for Deno
import { parseFeed } from "https://deno.land/x/rss@1.0.0/mod.ts";

const RSS_URL = "https://www.simplifyingthemarket.com/en/feed?a=498226-c1fe5fd3cb17661d7b425a40707d8252";

Deno.serve(async (req) => {
    try {
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        console.log(`Fetching RSS feed from: ${RSS_URL}`);
        const response = await fetch(RSS_URL);
        const xml = await response.text();
        const feed = await parseFeed(xml);

        let syncedCount = 0;
        const errors = [];

        for (const item of feed.entries) {
            const guid = item.id;
            const title = item.title?.value || "Untitled Article";
            const description = item.description?.value || "";
            const content = item.content?.value || description;
            const link = item.links[0]?.href || "";
            const publishedAt = item.published || item.updated || new Date();

            // Extract image URL from enclosure or content if available
            let imageUrl = null;
            if (item.attachments && item.attachments.length > 0) {
                imageUrl = item.attachments[0].url;
            } else {
                // Fallback: search for first img tag in content
                const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
                if (imgMatch) {
                    imageUrl = imgMatch[1];
                }
            }

            // Generate slug from title
            const slug = title
                .toLowerCase()
                .replace(/[^\w\s-]/g, "")
                .replace(/[\s_-]+/g, "-")
                .replace(/^-+|-+$/g, "");

            // Get category (Simplifying the Market usually has 'Real Estate Market')
            const category = "Market Trends"; // Default for this feed

            // Estimate read time (avg 200 wpm)
            const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
            const readTime = `${Math.ceil(wordCount / 200)} min read`;

            const { error: upsertError } = await supabase
                .from("articles")
                .upsert(
                    {
                        rss_guid: guid,
                        slug: slug,
                        title: title,
                        description: description.replace(/<[^>]*>/g, "").substring(0, 200) + "...",
                        content: content,
                        category: category,
                        read_time: readTime,
                        source_url: link,
                        image_url: imageUrl,
                        author: "Simplifying the Market",
                        published_at: publishedAt.toISOString(),
                    },
                    { onConflict: "rss_guid" }
                );

            if (upsertError) {
                console.error(`Error upserting ${title}:`, upsertError);
                errors.push(`${title}: ${upsertError.message}`);
            } else {
                syncedCount++;
            }
        }

        // Log the sync result
        await supabase.from("rss_sync_meta").insert({
            status: errors.length === 0 ? "success" : "partial_success",
            items_synced: syncedCount,
            error_message: errors.length > 0 ? errors.join("; ") : null,
        });

        return new Response(
            JSON.stringify({
                message: "Sync complete",
                synced: syncedCount,
                errors: errors.length
            }),
            { headers: { "Content-Type": "application/json" } }
        );
    } catch (err) {
        console.error("Critical Sync Error:", err);
        return new Response(
            JSON.stringify({ error: err.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
});
