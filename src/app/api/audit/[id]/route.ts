import { NextRequest, NextResponse } from "next/server";
import { getAudit } from "@/lib/audit-store";
import type { ApiResponse, AuditResult } from "@/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  // TODO Day 5: Replace getAudit() with Supabase query
  const audit = getAudit(params.id);

  if (!audit) {
    return NextResponse.json<ApiResponse<never>>(
      { error: "Audit not found" },
      { status: 404 }
    );
  }

  return NextResponse.json<ApiResponse<AuditResult>>({ data: audit });
}
