# AACM - Agile Academy Content Machine

AI-powered content creation and Bar Raiser review tool for Agile Academy, a leadership consulting firm. Creates thought leadership content (LinkedIn posts, articles, whitepapers) that reflects the firm's distinctive voice: opinionated, mechanisms-focused, grounded in multi-company case studies.

## Tech Stack

- **Next.js 16.1.6** (App Router) + **TypeScript** + **Tailwind CSS 4** + **React 19**
- **Anthropic Claude API** (claude-sonnet-4-6) for all AI features
- **Brave Search API** (optional) for web research
- **localStorage** for conversation persistence (no database)

## Architecture

Two modes accessible from a single page:

### Create Mode (main workflow)
Chat interface (`PipelineChat.tsx`) with a multi-phase pipeline:
1. **Research** → web research + 5 differentiated topic proposals
2. **Interview** → 3-5 targeted questions to gather author insights before writing
3. **Write + Auto-Review** → generates article via SSE streaming, then auto-reviews with Bar Raiser standards

### Review Mode
Paste any draft → get a structured Bar Raiser review. Two review modes:
- **Critique + Directions** — full feedback with actionable improvement suggestions
- **Critique Only** — focused critique without direction guidance

Content types: LinkedIn Post, Website Article, Whitepaper, Newspaper Article (German), IMD Article.

## Key Files

### API Routes (server-side, all prompts live here)
- `src/app/api/pipeline/route.ts` — Core pipeline: research, interview, write phases. SSE streaming for write phase. **This is the largest and most important file.**
- `src/app/api/review/route.ts` — Standalone Bar Raiser review endpoint. Rating scale 1-10.
- `src/app/api/create/route.ts` — Direct article creation (legacy/fallback).

### Domain Logic
- `src/lib/positioning.ts` — Agile Academy philosophy, distinctive positions, proprietary frameworks, voice characteristics, and existing content topics. **Edit this when the firm publishes new content or updates positioning.**
- `src/lib/search.ts` — Brave Search integration for content landscape research.
- `src/lib/conversations.ts` — localStorage CRUD for conversation history. Storage key: `aacm_conversations`.

### UI Components
- `src/components/PipelineChat.tsx` — Main chat interface (~1100 lines). Conversation sidebar, message rendering, SSE streaming, interview flow, proposal selection, content type selector.
- `src/components/ReviewForm.tsx` — Review mode input form. Content type + review mode selectors.
- `src/components/ReviewOutput.tsx` — Renders structured Bar Raiser review with section headers and improvement directions.
- `src/components/Header.tsx` — Agile Academy branding + Create/Review mode toggle.

### Legacy Components (pre-pipeline UI, kept for reference)
- `src/components/PipelineForm.tsx`, `PipelineOutput.tsx` — Old pipeline form UI
- `src/components/CreateForm.tsx`, `CreateOutput.tsx` — Old create form UI
- `src/components/TopicProposals.tsx` — Old proposals display

### App Shell
- `src/app/page.tsx` — Wires Create and Review modes together. Handles Create-to-Review handoff.
- `src/app/layout.tsx` — Root layout, metadata, Inter font.
- `src/app/globals.css` — Tailwind theme: green accent (#3fc16b), surfaces, typography.

## Brand Colors

- Accent: `#3fc16b` (green)
- Accent hover: `#35a85d`
- Accent light: `#eef9f2`
- Danger: `#E94560`

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
```

## Common Development Tasks

- **Change firm positioning/philosophy:** Edit `src/lib/positioning.ts`
- **Adjust Bar Raiser review criteria:** Edit system prompts in `src/app/api/review/route.ts`
- **Adjust article writing style:** Edit system prompts in `src/app/api/pipeline/route.ts` (CREATE_SYSTEM_PROMPT) and `src/app/api/create/route.ts`
- **Add new UI features:** Most chat logic is in `src/components/PipelineChat.tsx`
- **Change branding/colors:** `src/app/globals.css` for theme, `src/components/Header.tsx` for logo
- **Add content types:** Update `contentType` options in `ReviewForm.tsx` and `PipelineChat.tsx`

## Sibling Project

**Sevi AI** (`../Sevi AI/sevi-ai/`) — same architecture adapted for dental content (Dr. Severine Saleh's practice). Key differences: language selector instead of content type dropdown, dental domain positioning, blue accent color.
