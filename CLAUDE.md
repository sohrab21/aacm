# AACM - Agile Academy Content Machine

AI-powered content creation and Bar Raiser review tool for Agile Academy, a leadership consulting firm. Creates thought leadership content (LinkedIn posts, articles, whitepapers) that reflects the firm's distinctive voice: opinionated, mechanisms-focused, grounded in multi-company case studies.

## Tech Stack

- **Next.js 16.1.6** (App Router) + **TypeScript** + **Tailwind CSS 4** + **React 19**
- **Anthropic Claude API** (claude-sonnet-4-6) for all AI features
- **Brave Search API** (optional) for web research
- **Vercel Postgres + Drizzle ORM** for review persistence
- **localStorage** for conversation persistence (Create mode only)
- **Resend** for magic link login emails
- **jose** for JWT token handling (Edge-compatible)

## Architecture

Review-only mode (Create mode code preserved but hidden from UI for review-first launch):

### Review Mode (active)
Paste any draft → get a structured Bar Raiser review. Two review modes:
- **Critique + Directions** — full feedback with actionable improvement suggestions
- **Critique Only** — focused critique without direction guidance

Content types: LinkedIn Post, Website Article, Whitepaper, Newspaper Article (German), IMD Article.

Reviews are persisted to Vercel Postgres. Users can browse past reviews via the collapsible Review History panel and export any review as a markdown file.

### Create Mode (hidden — re-enable when ready)
Chat interface (`PipelineChat.tsx`) with a multi-phase pipeline:
1. **Research** → web research + 5 differentiated topic proposals
2. **Interview** → 3-5 targeted questions to gather author insights before writing
3. **Write + Auto-Review** → generates article via SSE streaming, then auto-reviews with Bar Raiser standards
4. **Revise** → click "Revise" on any final draft, provide notes on what to prioritize, get a rewritten draft that addresses the critique, then re-reviewed. Repeatable indefinitely.

Code preserved in `PipelineChat.tsx`, `api/pipeline/route.ts`, `api/create/route.ts`, `lib/conversations.ts`. To re-enable: uncomment CreateChat import and Create div in `page.tsx`, restore mode toggle in `Header.tsx`.

## Key Files

### API Routes (server-side, all prompts live here)
- `src/app/api/pipeline/route.ts` — Core pipeline: research, interview, write, revise phases. SSE streaming for write and revise phases. **This is the largest and most important file.**
- `src/app/api/review/route.ts` — Standalone Bar Raiser review endpoint. Rating scale 1-10. Injects reference examples per content type from `reference-examples.ts`.
- `src/app/api/create/route.ts` — Direct article creation (legacy/fallback).

### Database
- `src/lib/db/schema.ts` — `reviews` table definition (Drizzle ORM). Columns: id, userEmail, contentType, reviewMode, draft, context, review, rating, overrideRating, overrideNotes, createdAt
- `src/lib/db/index.ts` — Database connection (postgres.js + Drizzle)
- `drizzle.config.ts` — Drizzle Kit config (migrations, schema path)

### Review History API
- `src/app/api/reviews/route.ts` — GET /api/reviews (list user's reviews, newest first, limit 50)
- `src/app/api/reviews/[id]/route.ts` — GET /api/reviews/:id (full review detail) + PATCH (override rating/notes), scoped to user

### Auth
- `src/lib/auth.ts` — JWT + cookie utilities (create/verify tokens, set/clear cookies, domain check)
- `src/proxy.ts` — Route protection (Next.js 16 proxy): redirects unauthenticated users to /login
- `src/app/login/page.tsx` — Login page with email input and "check your email" state
- `src/app/api/auth/send-magic-link/route.ts` — Validates email domain, creates 15-min JWT, sends email via Resend
- `src/app/api/auth/verify/route.ts` — Verifies magic link token, sets 7-day session cookie, redirects to /
- `src/app/api/auth/logout/route.ts` — Clears session cookie
- `src/app/api/auth/me/route.ts` — Returns current user's email

### Domain Logic
- `src/lib/positioning.ts` — Agile Academy philosophy, distinctive positions, proprietary frameworks, voice characteristics, and existing content topics. **Edit this when the firm publishes new content or updates positioning.**
- `src/lib/reference-examples.ts` — Curated published text excerpts per content type (LinkedIn Post, Whitepaper, Newspaper Article). Injected into Bar Raiser system prompt as quality benchmarks. **Add new examples when the firm publishes approved content for missing types (IMD Article, Website Article).**
- `src/lib/knowledge-base.ts` — Condensed knowledge base (~3-5k tokens) distilled from 78 Agile Leader course transcripts. Contains frameworks (Expert/Achiever/Catalyst, Hackman, Lencioni, CVF), case studies (Tesla, Apple, Haier, Amazon, Netflix, Nucor, Southwest), Sohrab's distinctive positions, and concrete tools. Injected into Bar Raiser system prompt only in "Critique + Directions" mode so improvement directions can reference specific course content. **Edit when course content is updated or new frameworks/case studies are added.**
- `src/lib/search.ts` — Brave Search integration for content landscape research.
- `src/lib/conversations.ts` — localStorage CRUD for conversation history. Storage key: `aacm_conversations`.

### UI Components
- `src/components/PipelineChat.tsx` — Main chat interface (~1100 lines). Conversation sidebar, message rendering, SSE streaming, interview flow, proposal selection, content type selector.
- `src/components/ReviewForm.tsx` — Review mode input form. Content type + review mode selectors.
- `src/components/ReviewOutput.tsx` — Renders structured Bar Raiser review with section headers, improvement directions, copy and markdown export. Includes override rating UI (set/edit your own rating + notes for saved reviews).
- `src/components/ReviewHistory.tsx` — Collapsible panel showing past reviews. Lazy-fetches on first open, re-fetches after new submissions. Shows override rating alongside AI rating when present.
- `src/components/Header.tsx` — Agile Academy branding, user email, sign out button.

### App Shell
- `src/app/page.tsx` — Review-only UI. Create mode code commented out for easy re-enablement.
- `src/app/layout.tsx` — Root layout, metadata, Inter font.
- `src/app/globals.css` — Tailwind theme: green accent (#3fc16b), surfaces, typography.

## Brand Colors (AA Styleguide)

- Primary Green: `#3FC06B` (buttons, CTAs, success states)
- Green hover: `#36a35b`
- Green light: `#eef9f2`
- Link Blue: `#173BE6` (text links)
- Neutral: `#467AAA` (UI elements, filters, toggles)
- Neutral Light: `#EDF4FA` (hover highlights)
- Danger: `#E94560`
- Text: `#222222` (dark), `#666666` (secondary), `#6C757D` (muted)
- Borders: `#E1E1E1`
- Surfaces: `#F8F9FA` (light bg), `#FDFDFD` (super light)
- Font: System font stack (no external fonts)
- Border radius: 4px (buttons), 8px (inputs), 12px (cards)
- Shadows: Smooth multi-layer (see globals.css)

## Voice & Positioning (non-negotiable)

- Direct, declarative, opinionated — no hedging
- "Good intentions don't work. Mechanisms do."
- Every piece takes a clear "against" position
- Historical pattern recognition across Toyota, Apple, Amazon, Netflix, Spotify, Haier
- NO em dashes, NO corporate jargon (leverage, synergy, paradigm shift)
- Prescriptive specificity: exact costs, timelines, role descriptions
- Business-first framing — starts with strategic challenge, never "Scrum methodology"

## Environment Variables

```
ANTHROPIC_API_KEY=required
BRAVE_SEARCH_API_KEY=optional (falls back to Claude's training knowledge)
JWT_SECRET=required (generate with: openssl rand -hex 32)
RESEND_API_KEY=required (from resend.com)
NEXT_PUBLIC_APP_URL=required (e.g. https://aacm.vercel.app)
DATABASE_URL=required (Vercel Postgres connection string)
```

## Authentication

Magic link login restricted to `@scrum-academy.com` emails. No database needed.

**Flow:** User enters email → receives magic link via Resend → clicks link → JWT session cookie set for 7 days.

**Security:** Magic link tokens expire in 15 minutes. Session cookies are HTTP-only, Secure in production, SameSite=Lax. Email domain validated at both send and verify steps. To revoke all sessions: rotate JWT_SECRET.

## Common Development Tasks

- **Change firm positioning/philosophy:** Edit `src/lib/positioning.ts`
- **Adjust Bar Raiser review criteria:** Edit system prompts in `src/app/api/review/route.ts`
- **Adjust article writing style:** Edit system prompts in `src/app/api/pipeline/route.ts` (CREATE_SYSTEM_PROMPT) and `src/app/api/create/route.ts`
- **Add new UI features:** Most chat logic is in `src/components/PipelineChat.tsx`
- **Change branding/colors:** `src/app/globals.css` for theme tokens (follows AA Styleguide), `src/components/Header.tsx` for logo
- **Add content types:** Update `contentType` options in `ReviewForm.tsx` and `PipelineChat.tsx`
- **Add reference examples for new content types:** Edit `src/lib/reference-examples.ts` — add an entry keyed by the content type name with a title and the full approved text
- **Update course knowledge base:** Edit `src/lib/knowledge-base.ts` — add new frameworks, case studies, or positions. Keep total under ~5k tokens. This content is injected into "Critique + Directions" reviews only.
- **Override ratings (feedback loop):** Users can set their own rating (1-10) + notes on any saved review via the UI. Data stored in `override_rating` / `override_notes` columns. PATCH `/api/reviews/:id`

## Sibling Project

**Sevi AI** (`../Sevi AI/sevi-ai/`) — same architecture adapted for dental content (Dr. Severine Saleh's practice). Key differences: language selector instead of content type dropdown, dental domain positioning, blue accent color.
