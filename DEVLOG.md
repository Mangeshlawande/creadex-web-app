# Dev Log

## Day 1 — YYYY-MM-DD

**Hours worked:** 4

**What I did:**
- Scaffolded the full Next.js + TypeScript project with App Router
- Set up Tailwind CSS with custom design tokens (dark theme, brand green)
- Defined all TypeScript types (`AuditFormData`, `ToolAuditResult`, `AuditResult`, `LeadData`)
- Built the full pricing data library for all 8 required tools with sourced plan pricing
- Implemented the core deterministic audit engine with rules for: Cursor, GitHub Copilot, Claude, ChatGPT, Windsurf
- Set up Zustand store with localStorage persistence for form state
- Created API route shells for `/api/audit` and `/api/leads`
- Set up GitHub Actions CI (lint + type-check + test on push to main)
- Wrote 6 unit tests for the audit engine — all passing
- Deployed a working "hello world" to Vercel

**What I learned:**
- Next.js 14 App Router `layout.tsx` handles Google Fonts via `next/font/google` — no external CDN needed, fonts are self-hosted automatically
- Zustand's `persist` middleware needs to be used carefully with SSR — the store hydrates on the client, so any initial server render won't have the persisted values. Need to handle this with a `useEffect` or Zustand's `useHydration` pattern on Day 2

**Blockers / what I'm stuck on:**
- Pricing for Anthropic API and OpenAI API is token-based, not seat-based. Need to think through how the audit handles API-direct spend — probably treat `monthlySpend` as the user-entered figure and skip the plan-comparison logic for API tools, instead suggesting they check if they qualify for committed-use discounts. Will finalize this on Day 2 when I build the form.

**Plan for tomorrow:**
- Build the Spend Input Form component (the multi-tool selector with plan dropdowns, seat inputs, spend inputs)
- Handle the form state → Zustand → API submit flow end-to-end
- Research and verify all pricing URLs for PRICING_DATA.md
- Do outreach to 3 potential user interview subjects (X DMs to founders)

---

## Day 2 — YYYY-MM-DD

**Hours worked:** 4

**What I did:**
- Built `AuditForm` client component with tool selector, plan dropdowns, seat and spend inputs
- Built `ToolCard` sub-component — handles per-tool field changes and auto-updates monthly spend from catalog price × seats
- Wired form state through Zustand store → persists across page reloads via localStorage
- Added `useHydrated` hook to prevent SSR/client mismatch on persisted Zustand state
- Replaced audit page placeholder with working `<AuditForm />`
- Added `audit-store.ts` in-memory store so results survive the redirect to `/results/[id]`
- Added `GET /api/audit/[id]` route for fetching a single audit
- Verified all 8 tool pricing URLs — updated dates in `PRICING_DATA.md`
- Sent outreach to 3 people for user interviews (X DMs + 1 college network)

**What I learned:**
- Zustand `persist` hydrates asynchronously on the client — without `useHydrated`, Next.js server render gets default state, client render gets stored state, and React throws a hydration error. The fix is a `useEffect` that flips a boolean once mounted, then conditionally render the form only after hydration.
- When the plan dropdown changes, auto-recalculating monthly spend from `pricePerSeat × seats` is a nice UX touch — but it means the user's manually entered spend gets overwritten. Solved by letting the recalculation happen on tool/plan/seat change, but showing a note if they manually edit the spend field to a different value.

**Blockers / what I'm stuck on:**
- The `nanoid` import from the audit engine works fine in the API route but `nanoid` v5 is ESM-only. If Jest can't resolve it, I'll need to add `transformIgnorePatterns` to jest config or mock it. Testing tomorrow.

**Plan for tomorrow:**
- Build full results page: `SavingsHero`, `ToolResultCard`, `AISummaryBlock`, `CredexCTA`, `LeadCaptureForm`, `ShareButton`
- Build public shareable `/r/[id]` route with PII stripped and OG tags
- Custom 404 page
- Run full end-to-end: form → submit → results page renders

---

## Day 3 — YYYY-MM-DD

**Hours worked:** 5

**What I did:**
- Built `SavingsHero` — big savings number with tier badge (high/medium/low/optimal), handles both savings and "you're spending well" states
- Built `ToolResultCard` — per-tool breakdown with current → recommended arrow, savings in green, optimal tools dimmed
- Built `AISummaryBlock` — shows Anthropic API summary or fallback templated summary (Day 4 will wire the API)
- Built `CredexCTA` — prominent consultation CTA for >$500/mo savings, soft "stay updated" for lower tiers
- Built `LeadCaptureForm` — email gate with honeypot spam protection, optional company/role fields, POST to `/api/leads`
- Built `ShareButton` — copies `/r/[id]` to clipboard with "Link copied!" feedback
- Replaced results page shell with full working page — all components wired, sorted by savings desc
- Built `/r/[id]` public shareable route — same components, no lead capture form, no PII, viral CTA
- Added `generateMetadata` to both results pages for correct OG/Twitter card tags
- Added custom `not-found.tsx` for expired/missing audits
- Wrote 5 additional tests: multi-tool savings sum, ChatGPT solo downgrade, coding team switch, Windsurf downgrade, unique nanoid per run

**What I learned:**
- Next.js `notFound()` in a server component triggers the nearest `not-found.tsx` — but it only works if the file is in the `app/` directory, not inside `[id]/`. Moved it to `src/app/not-found.tsx` for global coverage.
- For the shareable URL, the instinct is to do a DB lookup server-side. But until Supabase is wired (Day 5), the in-memory store works for the same process. Noted the limitation clearly in the not-found page copy ("link may have expired").

**Blockers / what I'm stuck on:**
- The Anthropic API summary call is stubbed as `null` — `AISummaryBlock` falls back to the template summary correctly, but I want the real thing. Day 4.
- Lead capture POST currently logs to console and returns `{ success: true }` — no actual storage yet. Day 5.

**Plan for tomorrow:**
- Wire Anthropic API for the AI summary paragraph (`src/lib/ai-summary.ts`)
- Handle API failures gracefully — timeout, 429, network error all fall back to template
- Test the full flow with real API key
- Fill in `PROMPTS.md` with what I tried and what didn't work

---

## Day 4 — YYYY-MM-DD

**Hours worked:** 3

**What I did:**
- Wired `generateAISummary()` into `POST /api/audit` — the full API call with 8-second timeout
- Confirmed graceful fallback: disconnected API key intentionally, verified `AISummaryBlock` renders template summary without any error shown to user
- Iterated on prompts 4 times — documented all attempts and what failed in `PROMPTS.md`
- Final prompt split into two variants: one for savings-found audits, one for optimal audits
- Verified word count trimming: model occasionally returns 110-120 words, trimmed to 115 max with ellipsis
- Tested timeout handling: aborted fetch after 8s correctly returns null, fallback renders
- Filled in `PROMPTS.md` completely with system prompt, user prompt, rationale, failed attempts, fallback template

**What I learned:**
- The `AbortController` + `setTimeout` pattern for fetch timeouts works cleanly in Next.js API routes. One gotcha: must call `clearTimeout()` after a successful response, otherwise the timeout fires anyway and logs a spurious "AbortError" even when the request succeeded.
- Splitting the prompt by savings vs optimal tier produces noticeably better output than a single conditional prompt. The model's tone shifts appropriately — assertive for savings, affirming for optimal — without needing few-shot examples.

**Blockers / what I'm stuck on:**
- None today. Day 4 scope was tight and went smoothly.

**Plan for tomorrow:**
- Wire Supabase: `saveAuditToDb` and `getAuditFromDb` in the audit routes
- Complete leads route: Zod validation + rate limiting + `saveLeadToDb` + Resend email
- Write `supabase/schema.sql` migration
- Test full flow: form → audit stored in DB → results page loads after server restart

---

## Day 5 — YYYY-MM-DD

---

## Day 6 — YYYY-MM-DD

_Fill in during Day 6_

---

## Day 7 — YYYY-MM-DD

_Fill in during Day 7_
