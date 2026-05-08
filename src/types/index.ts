// ─── Tool & Plan Definitions ──────────────────────────────────────────────────

export type ToolId =
  | "cursor"
  | "github_copilot"
  | "claude"
  | "chatgpt"
  | "anthropic_api"
  | "openai_api"
  | "gemini"
  | "windsurf";

export type UseCase = "coding" | "writing" | "data" | "research" | "mixed";

export interface PlanDefinition {
  id: string;
  name: string;
  pricePerSeat: number; // USD/month
  minSeats?: number;
  maxSeats?: number;
  features: string[];
  bestFor: UseCase[];
}

export interface ToolDefinition {
  id: ToolId;
  name: string;
  vendor: string;
  pricingUrl: string;
  plans: PlanDefinition[];
}

// ─── Form / Input Types ───────────────────────────────────────────────────────

export interface ToolEntry {
  toolId: ToolId;
  planId: string;
  seats: number;
  monthlySpend: number; // what they ACTUALLY pay (may differ from catalog due to discounts, etc.)
}

export interface AuditFormData {
  teamSize: number;
  useCase: UseCase;
  tools: ToolEntry[];
}

// ─── Audit Engine Types ───────────────────────────────────────────────────────

export type RecommendationType =
  | "downgrade_plan"      // same vendor, cheaper plan
  | "reduce_seats"        // too many seats for team size
  | "switch_tool"         // different vendor/tool
  | "buy_via_credits"     // same tool but through Credex credits
  | "optimal";            // already on the best plan

export interface ToolAuditResult {
  toolEntry: ToolEntry;
  toolName: string;
  planName: string;
  currentMonthlyCost: number;
  recommendationType: RecommendationType;
  recommendedPlanId?: string;
  recommendedToolId?: ToolId;
  recommendedMonthlyCost: number;
  monthlySavings: number;
  annualSavings: number;
  reasoning: string; // one sentence, finance-grade logic
}

export interface AuditResult {
  id: string; // nanoid for shareable URL
  createdAt: string;
  formData: AuditFormData; // stored without PII for shareable version
  toolResults: ToolAuditResult[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  aiSummary: string | null; // from Anthropic API, nullable if fails
  savingsTier: "high" | "medium" | "low" | "optimal"; // drives CTA logic
}

// ─── Lead Capture Types ───────────────────────────────────────────────────────

export interface LeadData {
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: number;
  auditId: string;
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
