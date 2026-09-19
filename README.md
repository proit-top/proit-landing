# PROIT landing

Astro static site for **PROIT**, https://proit.top. Production target: existing Netlify project. No infrastructure changes are required for the static output.

## Run

```sh
npm ci
npm run dev -- --host 127.0.0.1
npm run check
npm run build
npm run preview -- --host 127.0.0.1 --port 4322
```

`dist/` contains the production artifact. No production push or deployment is part of local development.

## Verification

```sh
npx playwright install chromium
# Run a local dev or preview server first.
TEST_BASE_URL=http://127.0.0.1:4322 npm test
```

Tests cover routes, metadata, internal links and fragments, assets, WCAG checks with axe, responsive layouts, form/chat states, keyboard focus, reduced motion and no-JavaScript fallback. API responses are intercepted **test fixtures**, not a real backend. Reports/screenshots are ignored by Git.

## Contact and chat adapters

The default configuration deliberately sends nothing. No public contact address was provided, so none was invented. Build-time variables:

- `PUBLIC_CONTACT_ENDPOINT`: approved public HTTPS contact API URL, or same-origin path.
- `PUBLIC_CHAT_ENDPOINT`: approved public HTTPS chat API URL, or same-origin path.

These values are visible in the client. Never put credentials, tokens or signed secret URLs here. Keep provider keys server-side. Rebuild after configuration changes. Do not enable submission until the privacy policy, operator information and data processors are approved.

Contact POST JSON:

```json
{"name":"...","contact":"...","message":"...","consent":true,"privacyVersion":"draft-1"}
```

Accepted response: HTTP 2xx, `Content-Type: application/json`, `{"ok":true}`. A 200 HTML fallback, empty body, or `{ "ok": false }` is not success.

Chat POST JSON:

```json
{"message":"...","conversationId":"optional opaque identifier","consent":true,"privacyVersion":"draft-1"}
```

Accepted response: `{"ok":true,"reply":"plain text","conversationId":"optional opaque identifier"}`. Reply is rendered as text, never HTML. Conversation history is held in the open page only, not localStorage. Backend must authenticate/authorize any referenced conversation; opaque IDs alone are not an authorization model.

Client: 15-second timeout, no automatic retries, no false success, preserve unsent text on error. Requests omit cookies. Server responsibilities: independent input validation/limits, consent audit, origin allowlist/CORS, rate limiting/spam protection, safe logging/redaction, retention/deletion rules, duplicate handling, AI privacy/safety and provider credentials. These controls are not implemented by a static landing.

When the policy is approved, replace `privacyVersion: 'draft-1'` in both components with its actual version.

## Legal and Google readiness

`/privacy/` and `/terms/` are explicitly marked owner-review drafts with unknown fields. They have `noindex, follow` and are excluded from the sitemap until approved. The site **is not ready for Google verification** until operator contacts, legal text, application identity, requested scopes and data use are confirmed. Remove noindex and update the sitemap filter only after approval. Existing HTTPS/domain/hosting are not changed by this project.

Pages: `/`, `/ai/`, `/contacts/`, `/support/`, `/privacy/`, `/terms/`, `404.html`.

## Design

Dark-only brand direction per the brief: graphite, pale green, system Arial/Helvetica grotesk. Native CSS and semantic HTML, no WebGL, React, Three.js, GSAP, external fonts, trackers or imagery providers. Geometric orbit is an original abstract illustration, not monitoring data. Motion is entry/state feedback only, disabled by reduced-motion preferences. Native details and mobile navigation work without JavaScript. Modal chat requires JavaScript.

Assets: `public/control-orbit.svg` (editable source), `public/control-orbit.webp` (runtime raster to avoid expensive vector painting), `public/favicon.svg`, `public/og.png`. `scripts/make-og.py` regenerates OG locally using Pillow and Liberation Sans (not required for npm builds).

## Known dependency advisory gate

The inherited Astro 5.18.2 toolchain currently reports npm audit findings for Astro, sharp and esbuild. Audit suggests a major Astro upgrade; no force-upgrade was applied. This site outputs static HTML and has no runtime Astro server, dynamic image optimizer, server islands or user-controlled template attributes. That limits relevant attack surfaces but does not eliminate the package advisories. Review and approve a separately tested upgrade before release; never expose the local dev server publicly.

See `SECURITY.md`. Internal briefs, reports, prompts and secrets are Git-ignored.
