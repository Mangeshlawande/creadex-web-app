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

_Fill in during Day 2_

---

## Day 3 — YYYY-MM-DD

_Fill in during Day 3_

---

## Day 4 — YYYY-MM-DD

_Fill in during Day 4_

---

## Day 5 — YYYY-MM-DD

_Fill in during Day 5_

---

## Day 6 — YYYY-MM-DD

_Fill in during Day 6_

---

## Day 7 — YYYY-MM-DD

_Fill in during Day 7_
