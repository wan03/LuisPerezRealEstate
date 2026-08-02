# Refresh the site metadata description

Updates the top-level `description` in the exported `metadata` object in `src/app/layout.tsx` to something more evocative for a real-estate site.

**Before**

> High-performance real estate for the I-4 corridor — Lakeland & Tampa Bay, FL. TikTok-style walkthroughs, precise PITI+ math, and a completely transparent transaction roadmap.

**After**

> Your next Lakeland or Tampa Bay home starts here — cinematic walkthroughs, straight-talking PITI+ math, and a transparent path from first tour to closing day.

The new copy leads with the reader's own move rather than with the brand, keeps the Lakeland / Tampa Bay locality signal that search results rely on, and preserves the three concrete differentiators the old copy carried (video walkthroughs, PITI+ math, transaction transparency). It is a single sentence, and at ~156 characters it now fits within the ~160-character window search engines typically render, where the previous two-sentence version (~186 characters) was liable to be truncated.

## Scope

- One file changed: `src/app/layout.tsx`, one line.
- `title`, `openGraph`, and every other metadata field are untouched, per the spec.
- No other file was modified.

## Notes for the reviewer

- `openGraph.description` still reads "Own the I-4 corridor. High-performance real estate with transparent PITI+ calculators and a bilingual team." That is the copy social platforms show when the site is shared, so the link preview and the search-result snippet now use different voices. The spec explicitly scoped this change to the top-level description and asked that other metadata fields be left alone, so I did not touch it — flagging it in case you want a follow-up to bring the two into line.
- Similar marketing copy lives in `src/messages/en.json` (`subheading`, `tagline`), which is where the on-page hero text comes from. Also left unchanged and out of scope.
- No test asserts on the metadata description, so nothing needed updating alongside it. `node_modules` is not installed in this environment, so I could not run a typecheck or build; the change is a single string literal inside an existing field, so the risk is minimal.
