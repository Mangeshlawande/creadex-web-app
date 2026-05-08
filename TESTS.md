# Tests

## How to Run

```bash
npm test                   # run all tests once
npm run test:watch         # watch mode
npm test -- --coverage     # with coverage report
```

---

## Test Files

### `src/__tests__/audit-engine.test.ts`

Core audit engine unit tests. These run entirely in-memory with no network calls, no database, no API keys required.

| Test | What It Covers |
|---|---|
| Cursor Business → Pro downgrade (team < 5) | Verifies the engine correctly recommends a plan downgrade when a small team is on Cursor Business and identifies the exact dollar savings |
| Excess seat detection | Verifies that `seats > teamSize` triggers a `reduce_seats` recommendation with correct savings math |
| Claude Team → Pro for < 5 users | Verifies the 5-seat minimum rule for Claude Team is enforced and the savings calculation is correct |
| Optimal detection — no fake savings | Verifies the engine returns `optimal` and `$0 savings` for a perfectly matched plan — no manufactured recommendations |
| Savings tier: `high` at ≥ $500/mo | Verifies the `savingsTier` classification logic at the high threshold |
| Savings tier: `optimal` at $0 | Verifies the `savingsTier` classification for zero-savings audits |
| Annual savings = monthly × 12 | Verifies the savings math integrity — annual is always exactly 12× monthly |

---

## Planned Tests (Days 2–6)

- `src/__tests__/api-audit.test.ts` — Integration tests for the `/api/audit` route (request validation, error handling)
- `src/__tests__/api-leads.test.ts` — Integration tests for `/api/leads` (email validation, rate limit stub)
- `src/__tests__/utils.test.ts` — Unit tests for `formatCurrency`, `cn`, and other utilities
- `src/__tests__/store.test.ts` — Unit tests for the Zustand store actions
