# Routing Simplification Handoff - Matthew Calabia
**Created:** 2026-04-20
**Owner:** Matthew Calabia (Webflow)
**Deadline:** 2026-04-21 09:00 ET (7 hours from handoff)
**Approver:** Don Robinson (all code changes require Don's explicit approval with a deterministic reason)

---

## What This Branch Does

The `routing-simplification` branch fixes a live bug where organic leads get routed to the closer's Brand Strategy Call instead of the setter's Intro Call. Root cause: `application-routing-ads.js` runs on organic pages and has zero UTM awareness.

**The fix:** `application-routing-v2.js` was rewritten to use score-only routing. Two routes out (qualified/nurture), no UTM involvement in routing decisions. UTMs ride along as attribution params only.

**Branch status:** 8 commits ahead of main, 1 behind (utmScript.js - clean merge). Code review complete Apr 20.

---

## Hard Gates

1. **No code changes without Don's approval.** If something needs to change, tell Don exactly what and why before touching it.
2. **3 manual browser test cycles minimum.** Not automated. Not Claude. Matthew in a real browser on the staging pages.
3. **Every step verified before moving to next.** No skipping.
4. **No merge to main without Don's explicit approval.**
5. **Webflow audit before go-live.** Every stale page that no longer accepts traffic must be identified and cleaned.

---

## Step-by-Step Execution Plan

### Phase 1: Branch Prep (15 min)

- [ ] Clone the repo (or pull latest): `git clone git@github.com:Matt-Gray-Founder-OS/FounderOS.git && cd FounderOS`
- [ ] Checkout the branch: `git checkout routing-simplification`
- [ ] Merge main into the branch to pick up utmScript.js changes: `git merge main`
- [ ] Resolve any conflicts (expect none - utmScript.js was changed on both but branch has superset)
- [ ] Verify the merge is clean: `git status`

### Phase 2: Understand What Changed (20 min)

Read these files to understand the routing logic:

| File | What Changed |
|------|-------------|
| `application-routing-v2.js` | Rewritten. Score-only routing. Two routes: qualified (score >= threshold + solo decision) or nurture. No _ads suffix. UTMs captured but not used for routing. |
| `applicationFormControlNew.js` | Form ID canonicalized from `application-form-ads` to `fos-application-main`. Dead code removed. |
| `application-form-name-handler.js` | Minor cleanup. |
| `utmScript.js` | 30-day cookies, fbclid + hsa_* param capture for HubSpot Ads attribution. |
| `PROJECT_BRIEF_ROUTING_SIMPLIFICATION.md` | Full design doc with target architecture, Calendly events to keep/delete, execution order. |

**Key gap to close:** The `/book-now` Webflow page currently reads the `route` URL param and loads Calendly embeds for 4 values: `closer`, `closer_ads`, `setter`, `setter_ads`. The new routing sends `?route=qualified` or `?route=nurture`. The `/book-now` inline JS must be updated to handle these new values.

### Phase 3: Fix /book-now Page (30 min)

This is Webflow-side work. The `/book-now` page inline JS needs to:

1. Accept `?route=qualified` and load the Brand Strategy Call Calendly embed (the organic one: `calendly.com/d/cxqn-5hd-8fz`)
2. Accept `?route=nurture` and redirect to the nurture flow (or show a "we'll be in touch" message)
3. Keep backward compatibility for any in-flight traffic using old route params (`closer`, `setter`) for 48 hours after go-live
4. Pass UTM params from the URL through to Calendly as prefill params

**IF any code changes are needed in the repo scripts** (not Webflow inline JS), stop and DM Don with:
- Exact file and line
- What needs to change
- Why (deterministic reason, not "seems like it should")

### Phase 4: Swap Script References in Webflow (15 min)

The Webflow pages currently load `application-routing-ads.js` from GitHub Pages. After the branch merges to main:

1. Update all Webflow pages that load `application-routing-ads.js` to load `application-routing-v2.js` instead
2. Pages to update: `/apply`, `/thank-you/workshop`, and any other page with the form embed
3. Use jsDelivr CDN URLs if raw.githubusercontent.com is blocked by MIME type:
   `https://cdn.jsdelivr.net/gh/Matt-Gray-Founder-OS/FounderOS@main/application-routing-v2.js`

### Phase 5: Manual Testing - 3 Full Cycles (60 min)

**Test Cycle 1: Organic Lead - Should Route to Setter (Intro Call)**

- [ ] Open `/apply` in incognito (no UTMs in URL)
- [ ] Fill out the application form with test data
- [ ] Submit
- [ ] Verify redirect goes to `/book-now?route=qualified` (or appropriate route)
- [ ] Verify the correct Calendly embed loads (Intro Call for organic leads, not Brand Strategy Call)
- [ ] Verify UTMs are NOT present in the Calendly prefill params (because there are none)
- [ ] Check HubSpot: verify the form submission landed with correct properties

**Test Cycle 2: Paid Ads Lead - Should Route Based on Score**

- [ ] Open `/apply?utm_source=meta&utm_medium=paid&utm_campaign=test` in incognito
- [ ] Fill out form with high-scoring answers (high revenue, solo decision maker)
- [ ] Submit
- [ ] Verify redirect goes to `/book-now?route=qualified`
- [ ] Verify Calendly embed loads with UTM params passed through as prefill
- [ ] Check HubSpot: verify utm_source=meta, utm_medium=paid landed on the contact

**Test Cycle 3: Nurture Path - Low Score Lead**

- [ ] Open `/apply` in incognito
- [ ] Fill out form with low-scoring answers
- [ ] Submit
- [ ] Verify redirect goes to nurture path (not `/book-now`)
- [ ] Check HubSpot: verify the form submission landed

**Document results for each cycle:**
- Screenshot of the Calendly embed that loaded (or redirect destination)
- Screenshot of HubSpot contact record showing properties
- Note any unexpected behavior

### Phase 6: Webflow Stale Page Audit (30 min)

Manually check every Webflow page that has an application form or Calendly embed:

- [ ] `/apply` - Should have new routing script
- [ ] `/book-now` - Should handle new route params
- [ ] `/thank-you/workshop` - Should have new routing script (this is where the Jai Thomas bug occurred)
- [ ] Any other `/thank-you/*` pages with form embeds
- [ ] Check for any pages still loading `application-routing-ads.js` (the old buggy script)
- [ ] Check for any pages with hardcoded Calendly event type IDs that reference the _ads variants
- [ ] List every page checked and its status

### Phase 7: Go-Live (15 min)

Only after all 3 test cycles pass and stale page audit is clean:

1. DM Don with test results and request merge approval
2. After approval: `git checkout main && git merge routing-simplification && git push origin main`
3. Verify GitHub Pages deploys the new scripts
4. Verify Webflow pages are loading the new scripts (check network tab)
5. Run one final smoke test on `/apply` with incognito browser

---

## Blockers - Escalate Immediately

If any of these come up, DM Don immediately. Do not try to solve them alone:

- Webflow API access issues
- Calendly embed not loading on `/book-now` with new route params
- HubSpot form submissions not landing
- GitHub Pages not serving updated scripts after merge
- Any situation where you need to change code in the repo

---

## Calendly Events Reference

| Call Type | Keep | Calendly URL |
|-----------|------|-------------|
| Brand Strategy Call (organic) | YES - becomes THE Brand Strategy Call | calendly.com/d/cxqn-5hd-8fz |
| Brand Strategy Call (ads) | DELETE after migration | calendly.com/d/cxvc-8mr-npb |
| Intro Call (organic) | YES - becomes THE Intro Call | calendly.com/d/cw2s-j7z-zyk |
| Intro Call (ads) | DELETE after migration | calendly.com/d/cvfx-kyh-8w6 |

Do NOT delete the _ads variants until 48 hours after go-live, in case any in-flight bookings reference them.

---

## After Go-Live

- Monitor HubSpot for 2 hours: verify form submissions are routing correctly
- Check DFY Asset Pipeline (n8n LeGGfFKaeGGOjB5Y): update FRONT_END_EVENTS set to only include the 2 surviving Calendly event type IDs (this is a Don task, not Matthew)
- Delete deprecated routing scripts from repo after 1 week (Don task)
