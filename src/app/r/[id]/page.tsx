import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAuditFromDb } from "@/lib/supabase";
import { getAudit } from "@/lib/audit-store";
import { formatCurrency } from "@/lib/utils";
import { SavingsHero } from "@/components/audit/SavingsHero";
import { ToolResultCard } from "@/components/audit/ToolResultCard";
import { AISummaryBlock } from "@/components/audit/AISummaryBlock";
import { CredexCTA } from "@/components/audit/CredexCTA";

interface Props {
  params: { id: string };
}

async function loadAudit(id: string) {
  // 1. Try Supabase first (persists across server restarts)
  const dbAudit = await getAuditFromDb(id);
  if (dbAudit) return dbAudit;

  // 2. Fall back to in-memory store (same process, dev convenience)
  return getAudit(id) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const audit = await loadAudit(params.id);
  if (!audit) return { title: "Audit not found — SpendWise" };

  const title =
    audit.savingsTier === "optimal"
      ? "AI stack is optimised — SpendWise Audit"
      : `${formatCurrency(audit.totalMonthlySavings)}/mo in AI savings found — SpendWise`;

  const description =
    audit.savingsTier === "optimal"
      ? `${audit.formData.teamSize}-person team · ${audit.formData.tools.length} tools · No overspend detected.`
      : `${audit.formData.teamSize}-person team · ${audit.formData.tools.length} tools · ${formatCurrency(audit.totalAnnualSavings)}/yr savings identified.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

/**
 * Public shareable version — shows tools + savings, strips all PII.
 * Email, company name, role never appear here.
 * Reads from Supabase so share links survive server restarts.
 */
export default async function PublicResultsPage({ params }: Props) {
  const audit = await loadAudit(params.id);
  if (!audit) notFound();

  return (
    <main className="min-h-screen">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-surface-border max-w-3xl mx-auto">
        <Link href="/" className="font-display text-xl text-brand-400">
          SpendWise
        </Link>
        <Link
          href="/audit"
          className="text-sm bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Audit my stack →
        </Link>
      </nav>

      {/* Public banner */}
      <div className="max-w-2xl mx-auto px-6 pt-4">
        <div className="bg-surface-card border border-surface-border rounded-xl px-4 py-3 text-xs text-slate-500 flex items-center gap-2">
          <span>🔗</span>
          <span>
            This is a shared audit — identifying details have been removed.{" "}
            <Link href="/audit" className="text-brand-400 hover:underline">
              Run your own free audit →
            </Link>
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 pb-20">
        <SavingsHero result={audit} />
        <div className="border-t border-surface-border mb-8" />

        <section className="mb-6">
          <AISummaryBlock result={audit} />
        </section>

        <section className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
            Tool breakdown
          </h2>
          <div className="space-y-3">
            {audit.toolResults
              .sort((a, b) => b.monthlySavings - a.monthlySavings)
              .map((r, i) => (
                <ToolResultCard key={i} result={r} />
              ))}
          </div>
        </section>

        <section className="mb-6">
          <CredexCTA result={audit} />
        </section>

        <div className="card p-6 text-center">
          <p className="text-slate-400 text-sm mb-3">
            Want to audit your own AI spend?
          </p>
          <Link
            href="/audit"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all hover:scale-105"
          >
            Run my free audit →
          </Link>
          <p className="text-slate-600 text-xs mt-2">Free · No login · 2 minutes</p>
        </div>
      </div>
    </main>
  );
}