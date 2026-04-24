# Meta CAPI Integration (subproject of FounderOS)

## Status: Scaffold only — branch `meta-capi`, no code yet. Not merged to main.
## Purpose: Fire a Meta Conversions API `Lead` event from the Webflow front end when an application scores qualified (>= 11 per `application-routing-v2.js` QUALIFIED_THRESHOLD).
## Parent: Matt-Gray-Founder-OS/FounderOS (GitHub Pages, founderos.com).
## Deploy: Client-side JS loaded on /apply via `<script src="matt-gray-founder-os.github.io/FounderOS/meta-capi/{file}.js">`. Merge to main to deploy — repo auto-publishes to GitHub Pages on push.

## Integration point
`application-routing-v2.js` scores every application form submission. When `score >= QUALIFIED_THRESHOLD` (currently 11) the user redirects to `/book-now?route=qualified`. The CAPI module hooks into that same decision branch and fires a single `Lead` event to Meta Graph API with hashed user data + UTM context for ads attribution.

## Why CAPI at all
Client Meta Pixel events are blocked by ad blockers and ITP. CAPI is the server-to-server backup that lets Meta attribute the conversion to the ad campaign even when the pixel fires nothing. Even calling it from the front end, the request path is independent of pixel script loads — so an ad-blocker blocking `connect.facebook.net` does not block a `fetch("https://graph.facebook.com/...")` call.

## Dedup with Meta Pixel
Both the Pixel `fbq('track', 'Lead', ...)` and the CAPI call must emit the **same `event_id`** so Meta dedupes them on server side. Without this, a qualified lead who successfully fires BOTH gets double-counted.

## Open design questions
1. Fire timing: on qualified-redirect moment, or on Calendly booking completion? (Pixel typically fires on redirect; CAPI can do either or both.)
2. Enhanced match data — which fields to hash and send: email (required), phone, first_name, last_name, zip, city, country. Need sha256 normalization per Meta spec.
3. `event_source_url`: the page where the conversion "happened" — `/apply` or `/book-now`?
4. `action_source`: `website` for Webflow front end.
5. External token scope: does the existing Meta API token (vaulted) include `ads_management` required for CAPI, or do we need a dedicated CAPI access token from Events Manager? (Answered in Vault Check — see watch-for.)

## Watch-for (to populate during implementation)
- Token exposure: the access token for CAPI is what Meta requires for server-auth. We have to hide this via a proxy (n8n / Supabase edge / Vercel function). Calling Meta Graph API directly from client-side code requires embedding the token in JS, which IS a security risk regardless of how we phrase it. Need operator decision: proxy endpoint, OR use only Pixel enhanced conversions (no CAPI token from client).
- Rate limits: Meta Graph API has per-token per-hour limits. Client-side fire per user is fine; bursts are not a concern at inbound application volumes.
- `test_event_code`: set during dev so events show up in Events Manager "Test Events" tab and don't pollute production signal.

## Related
- `application-routing-v2.js` (sibling) — the routing script we hook into
- `CHANGELOG.md` (parent repo root) — all changes logged there
- Top-level `CLAUDE.md` — founderos.com scripts overview
