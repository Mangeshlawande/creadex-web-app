import { NextRequest, NextResponse } from "next/server";
import type { LeadData, ApiResponse } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as LeadData;

    if (!body.email || !body.auditId) {
      return NextResponse.json<ApiResponse<never>>(
        { error: "Email and auditId required" },
        { status: 400 }
      );
    }

    // TODO Day 5: Validate email format with Zod
    // TODO Day 5: Rate limiting / honeypot check
    // TODO Day 5: Store in Supabase
    // TODO Day 5: Send confirmation via Resend

    console.log("[/api/leads] Lead captured (stub):", body.email, body.auditId);

    return NextResponse.json<ApiResponse<{ success: true }>>({
      data: { success: true },
    });
  } catch (err) {
    console.error("[/api/leads] Error:", err);
    return NextResponse.json<ApiResponse<never>>(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
