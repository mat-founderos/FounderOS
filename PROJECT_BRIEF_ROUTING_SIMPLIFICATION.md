# Project Brief: founderos.com Application Routing Simplification

**Author:** Don Robinson
**Date:** April 17, 2026 (revised 2026-04-21 to reflect new 5-event SOP)
**Status:** APPROVED - Ready to implement
**Repo:** Matt-Gray-Founder-OS/FounderOS (~/dev/FounderOS)
**Related:** meetings-sync (n8n DFY Asset Pipeline), founder-os-web/fos-skills (PLG tools)

**SOP UPDATE 2026-04-21:** This brief was originally written assuming a single Brand Strategy Call event would replace 4 events. The final SOP collapsed inbound to 5 round robins (one per source) + deletes 2 Intro Call events. Steps 1-7 still describe a single-event collapse for /apply specifically (which is correct - /apply uses cxvc-8mr-npb only). Step 8 lists final disposition for all 7 affected events. Read CLAUDE.md "Calendly Round Robins" section for the canonical 5-event mapping before acting on any step here.

---

## Problem Statement

The current application routing system on founderos.com uses UTM source to determine which Calendly event type to show prospects. This conflates attribution (where did they come from) with routing (what call type do they get). The result:

1. **4 Calendly events for 2 call types** - Brand Strategy Call (organic), Brand Strategy Call (ads), Intro Call (organic), Intro Call (ads)
2. **4 routing scripts** - application-routing-ads.js, application-routing-v2.js, application-routing-backup.js, application-routing-aria.js
3. **Inconsistent script loading** - /apply loads v2 (UTM-aware), /thank-you/workshop was loading ads (not UTM-aware). Fixed Apr 16 but the architectural problem remains.
4. **Dual booking bug** - Jai Thomas (Apr 16) booked both a Brand Strategy Call and Intro Call from one form submission because the routing scored him into closer on an organic page.

## Root Cause

Verified Apr 16 2026 via HubSpot trace, Calendly API, and JS audit:
- Jai Thomas submitted workshop registration at 05:30:43 UTC from IG organic traffic
- application-routing-ads.js (loaded on /thank-you/workshop at the time) scored him >= 19 with solo decision authority
- Routed to /book-now?route=closer_ads which showed Brand Strategy Call Calendly embed
- He booked it at 05:29:09 UTC (the booking preceded the form timestamp due to browser tab sequencing)
- Then the normal workshop flow also routed him to Intro Call at 05:32:52 UTC
- Two Calendly events, two DFY wow assets generated, two HubSpot meetings created

## Target Architecture

### Principles
1. **UTMs are attribution only.** Captured on page load, persisted, passed to Calendly as prefill params. Never used for routing.
2. **Routing is score-based only.** Form answers determine qualified vs nurture. Period.
3. **One Calendly round robin event for /apply.** cxvc-8mr-npb (brand-strategy-call). Daniel Matallana + Robert Sjulson + Matthew Calabia (admin). Calendly handles distribution. Other inbound sources have their own dedicated round robins (TOOLS, Alberto, ARIA, Outbound setters) - all Brand Strategy Call type.
4. **One routing script.** application-routing-v2.js becomes the single script. All other variants deleted.
5. **Score + route written to HubSpot.** Closers see application_score on the contact record. Reports segment by score. No tier system - raw score is sufficient.

### Data Foundation

**Scoring model** (unchanged from current - 7 scored questions, max ~30 points):

Q1: What's the single biggest challenge holding your business back right now?
- My team needs me for every decision (team_decisions): 5
- My business depends on me for everything (bottleneck): 4
- Lead flow is unpredictable (lead_flow): 4
- Revenue has plateaued (revenue_plateau): 3
- I need help with my offer/pricing (offer_clarity): 2
- I want marketing/systems handled for me (dfy_request): 1
- I need help delegating (team_delegation): 1
- Just getting started (getting_started): 0

Q2: What is your business currently generating each month?
- $100K+/month (100k_plus): 5
- $30K-$100K/month (30k_100k): 3
- $10K-$30K/month (10k_30k): 2
- Under $10K/month (under_10k / aleast_10k): 1
- Not yet generating revenue (pre_revenue): 0 [HARD DQ]

Q3: How many hours per week working in your business?
- 60-80 hours (60_80): 4
- 80+ hours (80_plus): 4
- 40-60 hours (40_60): 3
- 20-40 hours (20_40): 2
- Under 20 hours (under_20): 1

Q7: Who's involved in investment decisions?
- Just me (just_me): 4
- Business partner (partner_business): 2
- Spouse/partner (partner_spouse): 2

Q8: Have you invested in coaching/programs before?
- Yes, and it delivered (yes_delivered): 4
- Yes, but it didn't deliver (yes_didnt_deliver): 3
- No, first time (no_first_time): 2

Q10: What best describes your business?
- Coaching (coaching): 4
- Consulting (consulting): 4
- Agency (agency): 4
- Course creator (course_creator): 3
- SaaS (saas): 2
- E-commerce (ecommerce): 2
- Creator (creator): 1
- Other (other): 1
- Not sure yet (not_sure_yet): 0

Q (profit margin - additional scored question):
- 60-80% (60_80): 4
- 80%+ (80_plus): 4
- 40-60% (40_60): 3
- 20-40% (20_40): 2
- Under 20% (under_20): 1

**Qualified threshold: score >= 11**
- Validated against 71 scored contacts in HubSpot (mean score 17.1, range 1-25)
- Current distribution: 38% closer, 32% setter, 30% nurture
- At threshold 11, ~83% of applicants qualify for a call
- Fathom data confirms 20% of closes come from sub-$50K revenue founders (who score 8-14). Threshold of 11 keeps most of them in.

**Hard disqualifiers (bypass score, always nurture):**
- pre_revenue: redirect to /fos-light-offer?dq=pre_revenue
- procurement_required: redirect to /fos-light-offer?dq=procurement

---

## Implementation Plan

### Step 1: Update application_route HubSpot Property
**What:** Add "qualified" as an option value to the existing application_route enum property.
**Why:** New routing writes "qualified" or "nurture" instead of "direct_to_closer" / "setter".
**How:** HubSpot API PATCH to add the option. Existing values preserved for historical data.
**Risk:** None. Additive change.

### Step 2: Rewrite application-routing-v2.js
**What:** Simplify the routing script to score-only logic with no UTM route modification.
**File:** ~/dev/FounderOS/application-routing-v2.js
**Changes:**
- DELETE: UTM_ROUTE_MAP, getUTMSource(), adjustRouteByUTM() functions
- DELETE: ROUTE_URLS with 4 paths (direct_to_closer, setter with closer/setter/closer_ads/setter_ads)
- REPLACE ROUTE_URLS with: { qualified: "/book-now", nurture: "/fos-light-offer?dq=not_ready" }
- SIMPLIFY determineRoute(): if (disqualifier !== "none") return "nurture"; if (score >= 11) return "qualified"; return "nurture";
- Decision authority check REMOVED from routing (still captured as HubSpot property via hidden field)
- KEEP: calculateScore(), getDisqualifier(), collectParams(), setHiddenField()
- KEEP: Writing application_score, application_route, application_disqualifier to hidden fields
- KEEP: UTM params passed through collectParams() to the redirect URL for Calendly prefill
- SET debug: false in all initApplicationRouting calls

**Test:** Load staging /apply page, fill form with various score combinations, verify:
- Score >= 11 non-DQ -> redirects to /book-now with UTM params
- Score < 11 -> redirects to /fos-light-offer?dq=not_ready
- pre_revenue -> redirects to /fos-light-offer?dq=pre_revenue
- Hidden fields populated correctly (check HubSpot submission)

### Step 3: Update /book-now Page Inline JS (Webflow)
**What:** Replace the 4-route Calendly switching logic with a single round robin embed.
**Where:** Webflow Designer > /book-now page > Page Settings > Custom Code (Before </body>)
**Current code (to replace):**
```js
const routes = {
  closer: { calendly: "https://calendly.com/d/cxqn-5hd-8fz/brand-strategy-call", ... },
  setter: { calendly: "https://calendly.com/d/cw2s-j7z-zyk/intro-call", ... },
  setter_ads: { calendly: "https://calendly.com/d/cvfx-kyh-8w6/intro-call-paid-media-ads", ... },
  closer_ads: { calendly: "https://calendly.com/d/cxvc-8mr-npb/brand-strategy-call-ads", ... }
};
const selected = routes[route] || routes["setter"];
```
**New code:**
```js
const CALENDLY_URL = "https://calendly.com/d/cxvc-8mr-npb/brand-strategy-call";

const params = new URLSearchParams(window.location.search);
const email = params.get("email") || "";
const firstName = params.get("first_name") || "";
const lastName = params.get("last_name") || "";
const utm_source = params.get("utm_source") || "";
const utm_medium = params.get("utm_medium") || "";
const utm_campaign = params.get("utm_campaign") || "";
const utm_content = params.get("utm_content") || "";
const utm_term = params.get("utm_term") || "";
const fullName = (firstName + " " + lastName).trim();

const calendlyURL = CALENDLY_URL +
  "?name=" + encodeURIComponent(fullName) +
  "&email=" + encodeURIComponent(email) +
  "&utm_source=" + encodeURIComponent(utm_source) +
  "&utm_medium=" + encodeURIComponent(utm_medium) +
  "&utm_campaign=" + encodeURIComponent(utm_campaign) +
  "&utm_content=" + encodeURIComponent(utm_content) +
  "&utm_term=" + encodeURIComponent(utm_term);

window.addEventListener("load", function(){
  Calendly.initInlineWidget({
    url: calendlyURL,
    parentElement: document.getElementById("calendly-widget")
  });
});
```
**Heading/subheading:** Static, no dynamic switching. Don to provide copy.
**Risk:** Medium. This is the live booking page. Test on staging first.

### Step 4: Update Webflow Page Custom Code
**What:** Ensure all pages loading the application form use application-routing-v2.js with debug: false.
**Pages to verify:**
- /apply (69c35608ec1b01f9a575d358) - already on v2, set debug false
- /thank-you template (6805f839c69e0bf87f694138) - updated to v2 on Apr 16, set debug false
- Any other pages with #fos-application-main form (check staging pages)
**Also:** Remove any remaining localhost script references (already cleaned up Apr 17)
**Also:** Set debug: false in ApplicationFormNameHandler init

### Step 5: Clean Up Repo
**What:** Delete deprecated routing scripts from the FounderOS GitHub repo.
**Delete:**
- application-routing-ads.js (replaced by v2)
- application-routing-backup.js (stale copy of ads)
**Keep:**
- application-routing-v2.js (the one script)
- application-routing-aria.js (ARIA is a separate product flow, routes to aria.founderos.com)
**Risk:** Low. Verify no Webflow page still references deleted files before pushing. Search all pages for "application-routing-ads" and "application-routing-backup" references.

### Step 6: Update DFY Asset Pipeline (n8n)
**What:** Update the FRONT_END_EVENTS set in the DFY Asset Pipeline n8n workflow to include only the new round robin Calendly event type ID.
**Workflow:** LeGGfFKaeGGOjB5Y (DFY Asset Pipeline - Pre-Call Wow)
**Current FRONT_END_EVENTS:** Contains IDs for all 4 Calendly events plus legacy events
**New FRONT_END_EVENTS:** Replace with the single round robin event type ID (from the new Calendly event Don creates)
**Also:** Remove any event type IDs for deleted Calendly events after Step 8
**Risk:** Low. Only affects which Calendly bookings trigger wow asset generation.

### Step 7: Update PLG Tools Routing (NEXT SESSION)
**What:** The PLG tools on tools.founderos.com (fos-skills project at ~/dev/founder-os-web/fos-skills/) and potentially other interactive tools on founderos.com also act as application entry points. They have their own scoring logic and may route to different Calendly events.
**Status:** NOT YET AUDITED for this change. The PLG tools were confirmed to have no Calendly/routing logic in the fos-skills HTML files themselves, but the tools may link to the /apply page or /book-now page with specific UTM params that previously triggered different routing.
**Action items for next session:**
- Audit all PLG tools for links to /apply or /book-now with route params
- Audit any tool-specific scoring logic that differs from the website application
- Ensure PLG tool leads flow through the same /apply -> /book-now -> round robin path
- Update any tool-specific Calendly event references
- The ARIA triage form (form-config.js) has its own scoring (max 17, thresholds 12/7) and routes to aria.founderos.com - this is a SEPARATE flow and should NOT be changed in this project
**Key context:** ARIA v2 form uses form-config.js with different questions, different scoring weights, different thresholds, and routes to the ARIA AI chat agent. It is NOT part of the website application flow.

### Step 8: Retire Duplicate Calendly Events (AFTER validation)
**What:** Delete the duplicate Calendly events after confirming zero traffic on old routes.
**Timeline:** 2+ weeks after new round robin receives all traffic.
**Final Calendly disposition (updated Apr 21 2026):**

5 Brand Strategy Call round robins survive (one per source). 2 Intro Call events deleted. No new event creation needed - cxvc-8mr-npb is the sole /apply event.

| Source | Slug | Event Type ID | Disposition |
|--------|------|---------------|-------------|
| /apply (Webflow inbound) | cxvc-8mr-npb | 1bbff147 | KEEP - sole /apply event |
| tools.founderos.com (PLG) | ct4n-hw4-d8m | 61d20b25 | KEEP |
| Alberto (DM agent) | ct4g-kpp-zx8 | d08b16d4 | KEEP |
| ARIA (chat agent) | ct4f-4rm-hv9 | 274a141d | KEEP |
| Outbound setters | cxqn-5hd-8fz | d95b3816 | KEEP |
| (legacy) Intro Call organic | cw2s-j7z-zyk | 8c143efd | DELETE T+48h |
| (legacy) Intro Call paid ads | cvfx-kyh-8w6 | c4a71026 | DELETE T+48h |

**Risk:** Low. Only the Intro Call events are deleted, and only after T+48h.

### Step 9: Meta Conversions API
**What:** Use Calendly's native integration with Meta Conversions API to fire conversion events when a booking is made.
**Why:** Gives Meta cleaner conversion signal on the actual booking event, not a page visit. Removes conversion tracking from our website JS entirely.
**How:** Configure in Calendly's integration settings. Not a code change.
**Credentials:** Meta Ads API token and account ID in Supabase Vault (keys: meta_ads_token, meta_ads_account_id)
**Owner:** Don configures in Calendly UI
**Risk:** None to website. Additive Meta signal.

---

## Staging Plan

All changes deployed to Webflow staging pages first:
- /staging/apply-v3-2 (page ID: 69d5f765d3017c49844768be)
- /staging/apply-v3 (page ID: 69c24a62d56b4ceb3c21f00a)

Testing checklist:
- [ ] Form loads correctly with updated routing script
- [ ] Score computed correctly (test with known answer combinations)
- [ ] Score >= 11 -> redirects to /book-now (or staging equivalent)
- [ ] Score < 11 -> redirects to /fos-light-offer
- [ ] pre_revenue DQ -> redirects to /fos-light-offer?dq=pre_revenue
- [ ] procurement DQ -> redirects to /fos-light-offer?dq=procurement
- [ ] UTMs pass through to Calendly prefill on /book-now
- [ ] application_score appears in HubSpot form submission
- [ ] application_route shows "qualified" or "nurture" in HubSpot
- [ ] application_disqualifier populated correctly
- [ ] Calendly round robin loads correctly on /book-now
- [ ] Booking creates correct HubSpot meeting via meetings-sync pipeline
- [ ] DFY Asset Pipeline fires for the new round robin event type
- [ ] No console errors on any page

## Branch Strategy

**CRITICAL: The FounderOS repo deploys to GitHub Pages on push to main. Any change to main is immediately live on founderos.com.**

All JS changes are developed on a feature branch (e.g., `routing-simplification`). Staging Webflow pages point to the branch URL for testing. The branch is NOT merged to main until all staging tests pass and Don explicitly approves.

Branch script URL pattern: `https://raw.githubusercontent.com/Matt-Gray-Founder-OS/FounderOS/routing-simplification/{filename}.js`

Staging Webflow pages will temporarily load scripts from this branch URL instead of the GitHub Pages URL. After merge to main, staging pages revert to the standard GitHub Pages URL.

## Production Deploy

REQUIRES EXPLICIT APPROVAL FROM DON before:
1. Merging the feature branch to main (live on GitHub Pages immediately)
2. Publishing Webflow /book-now page changes to production
3. Deleting any Calendly events

---

## Files Changed

| File | Action | Risk |
|------|--------|------|
| application-routing-v2.js | Rewrite (simplify) | Medium - live on all form pages |
| application-routing-ads.js | Delete | Low - verify no pages reference it |
| application-routing-backup.js | Delete | Low - backup, not loaded |
| /book-now Webflow custom code | Rewrite | Medium - live booking page |
| /apply Webflow custom code | Update debug flag | Low |
| /thank-you template custom code | Update debug flag | Low |
| DFY Asset Pipeline (n8n) | Update FRONT_END_EVENTS | Low |
| HubSpot application_route property | Add "qualified" option | None |

## Dependencies

- Don creates the Calendly round robin event and provides the URL
- Don configures Calendly weighting for paid ads if needed
- Don configures Meta Conversions API in Calendly
- Matthew confirms no other Webflow pages reference application-routing-ads.js
- PLG tools audit happens in next session before those tools are updated

## Rollback Plan

If the new routing breaks bookings in production:
1. **Immediate (< 5 min):** Revert the FounderOS repo to the commit before merge: `git revert HEAD && git push`. GitHub Pages redeploys with old scripts.
2. **Webflow /book-now:** Re-publish the previous version from Webflow's backup/version history.
3. **Calendly:** Old events are NOT deleted until 2+ weeks post-migration. They still work. Reverting the routing script restores traffic to them.
4. **DFY Asset Pipeline:** FRONT_END_EVENTS still contains old IDs until Step 8. No rollback needed.
5. **HubSpot property:** "qualified" option stays - additive, harmless.

The key safety net: old Calendly events remain active throughout the entire migration period. Rolling back the JS is a single git revert.

## Success Criteria

1. One routing script on all pages
2. One Calendly event receiving all qualified bookings
3. application_score visible on every new HubSpot contact who submits the form
4. UTM attribution preserved end-to-end (form -> HubSpot -> Calendly -> meetings-sync)
5. Zero dual-booking incidents
6. DFY Asset Pipeline fires correctly for the new event type
7. EOW report and Paid Ads Dashboard can segment by application_score and utm_source independently
