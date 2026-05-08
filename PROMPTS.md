# Prompts

## AI Summary Generation Prompt

Used in: `src/lib/ai-summary.ts` (built Day 4)
Model: `claude-3-5-sonnet-20241022`
Max tokens: 200

### System Prompt

```
You are a financial advisor specializing in SaaS spend optimization for startups. 
You write concise, direct summaries — no fluff, no filler phrases like "great news" or "exciting opportunity."
Always use specific numbers. Always be honest: if a team is spending well, say so plainly.

```

### User Prompt Template

```
Write a 80-100 word summary for a startup AI spend audit with these results:

Team: {{teamSize}} people, primary use case: {{useCase}}
Tools audited: {{toolList}}
Total monthly savings identified: ${{monthlySavings}}
Top recommendation: {{topRecommendation}}

Specific findings:
{{perToolFindings}}

Rules:
- Lead with the biggest single saving if savings > $0, or affirm they're spending well if savings = 0
- Name the specific tools and dollar amounts
- One concrete next step
- No sign-off, no pleasantries, no "In conclusion"
```

### Why This Approach

- **Specific numbers in the prompt**: Prevents the model from inventing figures or being vague
- **Negative constraints** ("no sign-off"): Cheaper than few-shot examples for formatting
- **Honest framing for zero-savings case**: The spec requires honest "you're spending well" messaging — the prompt enforces this
- **80-100 word target**: Long enough to be substantive, short enough to read on a results page without scrolling

### What Didn't Work

> _Fill in during Day 4 after you iterate on the prompt_

- Attempt 1: Without the "no fluff" instruction, the model opened with "Great news! I've analyzed your AI spend..." — generic and condescending
- ...

### Fallback Template (when API fails)

```
Your team of {{teamSize}} is currently spending ${{totalMonthlySpend}}/month across {{numTools}} AI tools.
{{#if savings > 0}}
We identified ${{monthlySavings}}/month in savings opportunities — ${{annualSavings}}/year — primarily through {{topRecommendationShort}}.
{{else}}
Your current AI stack appears well-optimized for your team size and use case.
{{/if}}
```
