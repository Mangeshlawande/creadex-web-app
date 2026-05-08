# Metrics

_200–500 words. Fill in by Day 6._

## North Star Metric

**Qualified leads per week** — the number of users who complete an audit AND submit their email.

_Why_: This is a B2B lead-gen tool used occasionally (not daily). DAU is meaningless. "Audits started" overstates engagement. "Emails captured" is the moment a cold visitor becomes a Credex prospect — the only metric that maps directly to revenue.

---

## 3 Input Metrics

1. **Audit completion rate** (started → submitted)
   - If this is low, the form is too long or confusing
   - Target: >60%

2. **Email capture rate** (audit shown → email submitted)
   - Measures whether the results page delivers enough perceived value
   - Target: >25% (industry benchmark for B2B tools with email gate after value)

3. **High-savings audit rate** (audits showing >$500/mo savings)
   - Determines how often we surface the Credex CTA prominently
   - Want this to be high → means targeting the right users

---

## What We'd Instrument First

1. `audit_started` — page load on `/audit`
2. `audit_submitted` — POST to `/api/audit` with tool count
3. `audit_results_viewed` — results page loaded with `auditId`
4. `email_captured` — POST to `/api/leads`
5. `credex_cta_clicked` — click on the "Book a consultation" button

All events should include: `auditId`, `savingsTier`, `toolCount`, `totalMonthlySavings` (bucketed).

---

## Pivot Trigger

If **audit completion rate < 30% after 200 sessions**: the form is the problem. Either too many fields (cut to 3 required), or the value proposition isn't clear before they start. Run a 5-second test on the landing page.

If **email capture rate < 10% after 100 completed audits**: the results page isn't delivering enough perceived value. Either the savings numbers are too low (wrong audience) or the design doesn't communicate them clearly enough.
