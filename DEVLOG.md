# Dev Log

## Day 1 — 

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

## Day 2 — 

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

## Day 3 — 


---

## Day 4 — 

_Fill in during Day 4_

---

## Day 5 — 

_Fill in during Day 5_

---

## Day 6 —

_Fill in during Day 6_

---

## Day 7 — 

_Fill in during Day 7_