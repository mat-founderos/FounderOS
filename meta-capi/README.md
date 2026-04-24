# meta-capi

Meta Conversions API integration for founderos.com application form. Fires a `Lead` event to Meta when an inbound application scores `>= 11` (the qualified threshold computed by `application-routing-v2.js`).

## How it plugs in

```
/apply (Webflow page)
  └── application-routing-v2.js   ─ scores form answers
        └── score >= 11           ─ redirects to /book-now?route=qualified
              └── meta-capi       ─ fires Lead event to Meta (this subproject)
```

## Load path

This folder is served via GitHub Pages alongside the rest of the FounderOS website scripts:

```
https://matt-gray-founder-os.github.io/FounderOS/meta-capi/<filename>.js
```

Webflow pages embed the script tag. Every push to `main` auto-deploys to GitHub Pages, so the Webflow site picks up changes on the next page load.

## Status

Scaffold only — branch `meta-capi`. Implementation design in progress. See `CLAUDE.md` for the current set of open design questions and the integration contract.

## Layout

```
meta-capi/
├── CLAUDE.md   operator + agent context, integration plan
└── README.md   this file
```

JS modules land here during implementation.
