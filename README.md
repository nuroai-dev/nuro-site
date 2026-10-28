# Nuro temporary site

The refreshed Nuro website, using the existing Astro 5 framework and standalone Node adapter. React islands handle Nuro’s glass character, the animated logo, the waitlist and the Vaul contact drawer. English lives at `/`; Swedish at `/sv/`.

Navigation remains About, Press, Career and Contact, alongside the waitlist and legal links. Team is part of About; `/team` redirects there.

## Local development

```sh
npm ci
WAITLIST_DIR=/tmp/nuro-site-data CONTACT_DIR=/tmp/nuro-site-data npm run dev
```

The dev server defaults to port 3300. A missing Resend key in development stores contact messages locally without sending mail. Use synthetic data only for tests.

```sh
npm run check
PUBLIC_SITE_TEST_URL=http://localhost:3300 npm run check:forms
npm run build
npm run check:production
```

The form checks require a loopback server with temporary data directories and no live mail key. They create test registrations and a test contact message.

## Deploy with the existing hosting stack

Use a persistent Node container, with one application process writing to a mounted `/data` volume, as defined in `gate.json`. The storage queue coordinates writes within that process; do not run multiple independent writers or serverless replicas against these files.

1. Install with `npm ci` and build with `npm run build`.
2. Mount a durable, backed-up volume at `/data`, outside the repository and static web root. Keep the same volume across restarts and releases. To preserve existing registrations, mount or securely migrate the current site’s `waitlist.jsonl` and `contact.jsonl` before switching traffic.
3. Configure server-only environment variables from `.env.example` on the hosting platform:
   - `RESEND_API_KEY`: the existing site’s Resend key.
   - `CONTACT_FROM`: a sender on the verified Resend domain.
   - `CONTACT_TO`: the team’s existing contact inbox.
   - `WAITLIST_DIR` and `CONTACT_DIR`: `/data` by default.
   - `WAITLIST_EXPORT_TOKEN`: a long random bearer token for administrative exports.
   - `CONTACT_EXPORT_TOKEN`: optional separate token; defaults to the waitlist token.
4. Start with `npm start`. This checks required configuration and writable storage before serving traffic. `HOST` defaults to `0.0.0.0`; `PORT` defaults to `3000`. Gate runs build and start using this same entry point.
5. Before linking the public site, verify a real registration persists across a restart, and verify contact delivery to the configured inbox using an approved test address/message. A successful build and writable-directory check cannot verify the host’s volume persistence, backups or Resend domain configuration.

Do not deploy only `dist/client` to static hosting. The earlier Vercel review URL was a static demo; it has no registration backend. This version has no demo-success bypass: forms call the API and show errors if it fails. A new GitHub repository alone does not replace or activate that older deployment.

## Form behavior

- `POST /api/waitlist` stores an email immediately. Optional adult roles and age bands are saved by `PATCH` using a per-signup edit token. The token hash is stored server-side. Duplicate emails are rejected case-insensitively.
- Student/Elev is unavailable in both new and legacy forms and is rejected by the API. The site’s waitlist is for adults; age bands refer to their children or students.
- Waitlist registration does **not** send an immediate email, matching the existing site. It saves the subscriber for future Nuro updates. The UI confirms only after the save succeeds.
- `POST /api/contact` stores the message, then delivers it with the existing Resend integration and reply-to address. A delivery failure returns an error, and the stored message remains available for recovery.
- `GET /api/waitlist-export` and `/api/contact-export` require their bearer tokens. Never put tokens or exported personal data in Git or browser code.

The repository contains no production credentials or form submissions. Keep `/data` out of source control. Hosting and DNS remain separate from this source repository.

## Remaining launch checks

The refreshed build and local integration checks passed on 28 October 2026, including stored registrations surviving a Node restart and mocked Resend delivery/error handling. Live hosting, durable-volume retention and actual inbox delivery still need verification with the site’s deployment credentials.

The inherited Astro 5 dependency tree also needs a security update before public launch. `npm audit --omit=dev` reports a critical Astro advisory and additional high/moderate advisories. The critical [upstream advisory](https://github.com/withastro/astro/security/advisories/GHSA-26w7-cxv4-gfx2) concerns processing untrusted AVIF images with Sharp; it is fixed upstream in Astro 7.2.8. This repository retains the current framework version rather than silently bundling a major framework migration into the design/form changes. Review the full current audit and upgrade Astro, its integrations and affected dependencies together, then rerun the checks above. No claim is made that the production site is currently exploitable or that a build passing clears those advisories.
