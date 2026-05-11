import type { AuditResult, ToolAuditResult } from "@/types";
import { formatCurrency } from "@/lib/utils";

// ─── Prompt builders ──────────────────────────────────────────────────────────

function buildSystemPrompt(): string {
  return `You are a financial advisor specializing in SaaS spend optimization for startups.
You write concise, direct summaries — no fluff, no filler phrases like "great news" or "exciting opportunity."
Always use specific dollar amounts. Always be honest: if a team is spending well, say so plainly.
Never invent numbers that weren't given to you. Never use markdown formatting.`;
}

function buildUserPrompt(result: Omit<AuditResult, "aiSummary">): string {
  const { formData, toolResults, totalMonthlySavings, totalAnnualSavings, savingsTier } = result;

  const toolList = formData.tools
    .map((t) => {
      const r = toolResults.find((r) => r.toolEntry.toolId === t.toolId);
      return r ? `${r.toolName} ${r.planName}` : t.toolId;
    })
    .join(", ");

  const topResult = [...toolResults]
    .filter((r) => r.monthlySavings > 0)
    .sort((a, b) => b.monthlySavings - a.monthlySavings)[0];

  const perToolFindings = toolResults
    .map((r: ToolAuditResult) => {
      if (r.monthlySavings > 0) {
        return `- ${r.toolName} (${r.planName}): ${r.reasoning} Saves ${formatCurrency(r.monthlySavings)}/mo.`;
      }
      return `- ${r.toolName} (${r.planName}): optimal, no changes needed.`;
    })
    .join("\n");

  if (savingsTier === "optimal") {
    return `Write an 80-100 word summary for a startup AI spend audit with these results:

Team: ${formData.teamSize} people, primary use case: ${formData.useCase}
Tools audited: ${toolList}
Result: No savings identified — all tools are on optimal plans for this team's size and use case.

Per-tool findings:
${perToolFindings}

Rules:
- Open by affirming the team is spending well — be specific about which tools and why
- Mention the team size and use case
- End with one forward-looking tip (e.g. revisit as team grows)
- No sign-off, no pleasantries, no "In conclusion", no markdown`;
  }

  return `Write an 80-100 word summary for a startup AI spend audit with these results:

Team: ${formData.teamSize} people, primary use case: ${formData.useCase}
Tools audited: ${toolList}
Total monthly savings identified: ${formatCurrency(totalMonthlySavings)}/mo (${formatCurrency(totalAnnualSavings)}/yr)
Top recommendation: ${topResult ? `${topResult.toolName} — ${topResult.reasoning}` : "review plan tiers"}

Per-tool findings:
${perToolFindings}

Rules:
- Lead with the single biggest saving (tool name + exact dollar amount)
- Work through the other findings briefly
- End with one concrete next step the reader can take today
- No sign-off, no pleasantries, no "In conclusion", no markdown`;
}

// ─── Fallback template (used when API fails) ─────────────────────────────────

export function buildFallbackSummary(result: Omit<AuditResult, "aiSummary">): string {
  const { formData, toolResults, totalMonthlySavings, totalAnnualSavings, savingsTier } = result;
  const toolCount = formData.tools.length;

  if (savingsTier === "optimal") {
    return `Your team of ${formData.teamSize} is running a well-optimised AI stack across ${toolCount} tool${toolCount !== 1 ? "s" : ""}. Every plan is matched to your team size and ${formData.useCase} use case — no overages, no seat waste, no plan mismatches. No action needed today. Revisit this audit when your team grows or you add new tools.`;
  }

  const topResult = [...toolResults]
    .filter((r) => r.monthlySavings > 0)
    .sort((a, b) => b.monthlySavings - a.monthlySavings)[0];

  const otherSavings = toolResults
    .filter((r) => r.monthlySavings > 0 && r !== topResult);

  let summary = `Your team of ${formData.teamSize} has ${formatCurrency(totalMonthlySavings)}/month — ${formatCurrency(totalAnnualSavings)}/year — in identified AI spend savings. `;

  if (topResult) {
    summary += `The biggest opportunity is ${topResult.toolName}: ${topResult.reasoning} `;
  }

  if (otherSavings.length > 0) {
    const others = otherSavings
      .map((r) => `${r.toolName} (${formatCurrency(r.monthlySavings)}/mo)`)
      .join(", ");
    summary += `Additional savings on ${others}. `;
  }

  summary += `Start with the highest-savings item and work down the list.`;
  return summary;
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Generates a ~100 word personalised audit summary using the Anthropic API.
 * Returns null on any failure — caller must use buildFallbackSummary() instead.
 * Never throws.
 */
export async function generateAISummary(
  result: Omit<AuditResult, "aiSummary">
): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.warn("[ai-summary] ANTHROPIC_API_KEY not set — skipping AI summary");
    return null;
  }

  try {
    // 8-second timeout — audit response must stay fast
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 200,
        system: buildSystemPrompt(),
        messages: [
          {
            role: "user",
            content: buildUserPrompt(result),
          },
        ],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ai-summary] API error ${response.status}:`, errorText);
      return null;
    }

    const data = await response.json();
    const text: string = data?.content?.[0]?.text ?? "";

    if (!text.trim()) {
      console.warn("[ai-summary] Empty response from API");
      return null;
    }

    // Trim to reasonable length — model occasionally exceeds 100 words
    const words = text.trim().split(/\s+/);
    if (words.length > 120) {
      return words.slice(0, 115).join(" ") + "…";
    }

    return text.trim();
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      console.warn("[ai-summary] Request timed out after 8s — using fallback");
    } else {
      console.error("[ai-summary] Unexpected error:", err);
    }
    return null;
  }
}
