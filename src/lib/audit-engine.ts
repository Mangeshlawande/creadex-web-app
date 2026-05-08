import type {
  AuditFormData,
  AuditResult,
  ToolAuditResult,
  ToolEntry,
  RecommendationType,
} from "@/types";
import { TOOL_MAP, getPlan } from "./pricing-data";
import { nanoid } from "nanoid";

// ─── Per-tool audit logic ─────────────────────────────────────────────────────

function auditTool(entry: ToolEntry, formData: AuditFormData): ToolAuditResult {
  const tool = TOOL_MAP.get(entry.toolId);
  const plan = getPlan(entry.toolId, entry.planId);

  if (!tool || !plan) {
    throw new Error(`Unknown tool/plan: ${entry.toolId}/${entry.planId}`);
  }

  const currentMonthlyCost = entry.monthlySpend;

  // ── Cursor ──────────────────────────────────────────────────────────────────
  if (entry.toolId === "cursor") {
    // Business plan for small teams: team < 5 doesn't need centralized billing / SSO
    if (entry.planId === "cursor_business" && formData.teamSize <= 4) {
      const recommendedPlan = tool.plans.find((p) => p.id === "cursor_pro")!;
      const recommendedCost = recommendedPlan.pricePerSeat * entry.seats;
      const savings = currentMonthlyCost - recommendedCost;
      return buildResult(entry, tool.name, plan.name, currentMonthlyCost, "downgrade_plan", "cursor_pro", undefined, recommendedCost, savings,
        `Teams under 5 don't need Cursor Business SSO/admin features — Pro at $${recommendedPlan.pricePerSeat}/seat saves $${savings}/mo with identical AI capability.`);
    }
    // More seats than team size
    if (entry.seats > formData.teamSize) {
      const correctCost = (plan.pricePerSeat || 20) * formData.teamSize;
      const savings = currentMonthlyCost - correctCost;
      return buildResult(entry, tool.name, plan.name, currentMonthlyCost, "reduce_seats", entry.planId, undefined, correctCost, savings,
        `You have ${entry.seats} Cursor seats but only ${formData.teamSize} team members — removing ${entry.seats - formData.teamSize} unused seats saves $${savings}/mo.`);
    }
    // Non-coding use case on Cursor
    if (formData.useCase !== "coding" && formData.useCase !== "mixed") {
      const claudeProCost = 20 * entry.seats;
      const savings = currentMonthlyCost - claudeProCost;
      if (savings > 0) {
        return buildResult(entry, tool.name, plan.name, currentMonthlyCost, "switch_tool", undefined, "claude", claudeProCost, savings,
          `Cursor is an IDE-focused coding assistant — for ${formData.useCase} workflows, Claude Pro offers equivalent capability at $${claudeProCost}/mo total.`);
      }
    }
  }

  // ── GitHub Copilot ───────────────────────────────────────────────────────────
  if (entry.toolId === "github_copilot") {
    // Enterprise for teams that likely don't use codebase personalization
    if (entry.planId === "copilot_enterprise" && formData.teamSize <= 10) {
      const plan = tool.plans.find((p) => p.id === "copilot_business")!;
      const recommendedCost = plan.pricePerSeat * entry.seats;
      const savings = currentMonthlyCost - recommendedCost;
      if (savings > 0) {
        return buildResult(entry, tool.name, "Enterprise", currentMonthlyCost, "downgrade_plan", "copilot_business", undefined, recommendedCost, savings,
          `Copilot Enterprise's codebase personalization requires GitHub Enterprise — teams under 10 rarely leverage this. Business at $19/seat saves $${savings}/mo.`);
      }
    }
    // Individual vs Cursor Pro comparison for coding-heavy teams
    if (entry.planId === "copilot_individual" && entry.seats >= 3 && formData.useCase === "coding") {
      const cursorProCost = 20 * entry.seats;
      const currentCost = 10 * entry.seats;
      // In this case they may already be optimal, just note the alternative
      if (cursorProCost > currentCost) {
        // They're already cheaper — mark as optimal
      }
    }
  }

  // ── Claude ───────────────────────────────────────────────────────────────────
  if (entry.toolId === "claude") {
    // Team plan minimum is 5 seats — below that it's per-seat Pro
    if (entry.planId === "claude_team" && entry.seats < 5) {
      const proPlan = tool.plans.find((p) => p.id === "claude_pro")!;
      const recommendedCost = proPlan.pricePerSeat * entry.seats;
      const savings = currentMonthlyCost - recommendedCost;
      if (savings > 0) {
        return buildResult(entry, tool.name, "Team", currentMonthlyCost, "downgrade_plan", "claude_pro", undefined, recommendedCost, savings,
          `Claude Team requires a 5-seat minimum at $30/seat — for ${entry.seats} users, individual Pro plans at $20/seat saves $${savings}/mo with the same model access.`);
      }
    }
    // Max plan: only justified for heavy power users (developers building on Claude)
    if ((entry.planId === "claude_max_5x" || entry.planId === "claude_max_20x") && formData.useCase === "writing") {
      const proPlan = tool.plans.find((p) => p.id === "claude_pro")!;
      const recommendedCost = proPlan.pricePerSeat * entry.seats;
      const savings = currentMonthlyCost - recommendedCost;
      if (savings > 0) {
        return buildResult(entry, tool.name, plan.name, currentMonthlyCost, "downgrade_plan", "claude_pro", undefined, recommendedCost, savings,
          `Claude Max is designed for developers hitting Pro usage limits — for writing use cases, Claude Pro at $20/seat covers typical usage patterns, saving $${savings}/mo.`);
      }
    }
  }

  // ── ChatGPT ──────────────────────────────────────────────────────────────────
  if (entry.toolId === "chatgpt") {
    // Team plan: compare vs Plus for very small teams
    if (entry.planId === "chatgpt_team" && entry.seats <= 2) {
      const plusPlan = tool.plans.find((p) => p.id === "chatgpt_plus")!;
      const recommendedCost = plusPlan.pricePerSeat * entry.seats;
      const savings = currentMonthlyCost - recommendedCost;
      if (savings > 0) {
        return buildResult(entry, tool.name, "Team", currentMonthlyCost, "downgrade_plan", "chatgpt_plus", undefined, recommendedCost, savings,
          `ChatGPT Team's admin workspace adds overhead for ${entry.seats} users — Plus at $20/seat provides identical GPT-4o access for solo/duo teams, saving $${savings}/mo.`);
      }
    }
    // Coding-primary use case: suggest Cursor or Copilot
    if (formData.useCase === "coding" && entry.planId !== "chatgpt_free") {
      const cursorProCost = 20 * entry.seats;
      const savings = currentMonthlyCost - cursorProCost;
      if (savings > 0) {
        return buildResult(entry, tool.name, plan.name, currentMonthlyCost, "switch_tool", undefined, "cursor", cursorProCost, savings,
          `For coding-primary teams, Cursor Pro ($20/seat) has IDE-native autocomplete and context-aware completions vs ChatGPT's chat-only interface — comparable cost, purpose-built for your use case.`);
      }
    }
  }

  // ── Windsurf ─────────────────────────────────────────────────────────────────
  if (entry.toolId === "windsurf") {
    if (entry.planId === "windsurf_teams" && formData.teamSize < 5) {
      const proPlan = tool.plans.find((p) => p.id === "windsurf_pro")!;
      const recommendedCost = proPlan.pricePerSeat * entry.seats;
      const savings = currentMonthlyCost - recommendedCost;
      if (savings > 0) {
        return buildResult(entry, tool.name, "Teams", currentMonthlyCost, "downgrade_plan", "windsurf_pro", undefined, recommendedCost, savings,
          `Windsurf Teams requires 5-seat minimum — for ${entry.seats} devs, individual Pro at $15/seat has identical capability, saving $${savings}/mo.`);
      }
    }
  }

  // ── Default: optimal ─────────────────────────────────────────────────────────
  return buildResult(entry, tool.name, plan.name, currentMonthlyCost, "optimal", undefined, undefined, currentMonthlyCost, 0,
    `${tool.name} ${plan.name} is well-matched to your team size and use case — no savings opportunity identified.`);
}

// ─── Helper builder ───────────────────────────────────────────────────────────

function buildResult(
  entry: ToolEntry,
  toolName: string,
  planName: string,
  currentMonthlyCost: number,
  recommendationType: RecommendationType,
  recommendedPlanId: string | undefined,
  recommendedToolId: import("@/types").ToolId | undefined,
  recommendedMonthlyCost: number,
  monthlySavings: number,
  reasoning: string
): ToolAuditResult {
  return {
    toolEntry: entry,
    toolName,
    planName,
    currentMonthlyCost,
    recommendationType,
    recommendedPlanId,
    recommendedToolId,
    recommendedMonthlyCost,
    monthlySavings: Math.max(0, monthlySavings),
    annualSavings: Math.max(0, monthlySavings * 12),
    reasoning,
  };
}

// ─── Main audit function ──────────────────────────────────────────────────────

export function runAudit(formData: AuditFormData): Omit<AuditResult, "aiSummary"> {
  const toolResults = formData.tools.map((entry) => auditTool(entry, formData));

  const totalMonthlySavings = toolResults.reduce((sum, r) => sum + r.monthlySavings, 0);
  const totalAnnualSavings = totalMonthlySavings * 12;

  const savingsTier: AuditResult["savingsTier"] =
    totalMonthlySavings >= 500
      ? "high"
      : totalMonthlySavings >= 100
      ? "medium"
      : totalMonthlySavings > 0
      ? "low"
      : "optimal";

  return {
    id: nanoid(10),
    createdAt: new Date().toISOString(),
    formData,
    toolResults,
    totalMonthlySavings,
    totalAnnualSavings,
    savingsTier,
  };
}
