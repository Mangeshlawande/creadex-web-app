import { NextRequest, NextResponse } from "next/server";
import { runAudit } from "@/lib/audit-engine";
import type { AuditFormData, ApiResponse, AuditResult } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AuditFormData;

    // Basic validation
    if (!body.teamSize || !body.useCase || !Array.isArray(body.tools)) {
      return NextResponse.json<ApiResponse<never>>(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    if (body.tools.length === 0) {
      return NextResponse.json<ApiResponse<never>>(
        { error: "Add at least one tool" },
        { status: 400 }
      );
    }

    // Run deterministic audit
    const auditResult = runAudit(body);

    // TODO Day 4: Generate AI summary via Anthropic API
    // TODO Day 5: Persist to Supabase

    const fullResult: AuditResult = {
      ...auditResult,
      aiSummary: null, // placeholder
    };

    return NextResponse.json<ApiResponse<AuditResult>>({ data: fullResult });
  } catch (err) {
    console.error("[/api/audit] Error:", err);
    return NextResponse.json<ApiResponse<never>>(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
