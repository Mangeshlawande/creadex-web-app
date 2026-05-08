import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Audit Your AI Spend — SpendWise",
  description: "Tell us what AI tools you use and we'll show exactly where you're overspending.",
};

export default function AuditPage() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-surface-border max-w-6xl mx-auto">
        <Link href="/" className="font-display text-xl text-brand-400">
          SpendWise
        </Link>
        <span className="text-sm text-slate-400">Step 1 of 1 — Your AI tools</span>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="font-display text-4xl text-white mb-3">
            What AI tools does your team use?
          </h1>
          <p className="text-slate-400">
            Add each tool, plan, and what you currently pay. We&apos;ll show savings opportunities instantly.
          </p>
        </div>

        {/* TODO Day 2: Replace with <AuditForm /> client component */}
        <div className="card p-8 text-center text-slate-500">
          <p className="text-lg mb-2">🔧 Form component coming Day 2</p>
          <p className="text-sm">
            Scaffold is wired up — audit engine, types, store all ready.
          </p>
        </div>
      </div>
    </main>
  );
}
