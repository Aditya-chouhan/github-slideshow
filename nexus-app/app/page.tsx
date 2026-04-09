"use client";

import { useState } from "react";
import { AgentPipeline } from "@/components/AgentPipeline";
import { OutreachPanel } from "@/components/OutreachPanel";
import { AccountMemory } from "@/components/AccountMemory";
import type { AccountRecord, ProspectInput } from "@/lib/types";
import clsx from "clsx";

type View = "research" | "memory";
type Stage = "form" | "running" | "done";

const DEFAULT_FORM: ProspectInput = {
  company: "", website: "", contactName: "", contactRole: "",
  contactLinkedIn: "", yourProduct: "", yourName: "", yourCompany: "",
};

export default function Terminal() {
  const [view, setView] = useState<View>("research");
  const [stage, setStage] = useState<Stage>("form");
  const [form, setForm] = useState<ProspectInput>(DEFAULT_FORM);
  const [result, setResult] = useState<AccountRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [memoryRefresh, setMemoryRefresh] = useState(0);
  const [selectedAccount, setSelectedAccount] = useState<AccountRecord | null>(null);

  function handleSubmit(e: React.FormEvent) { e.preventDefault(); setError(null); setResult(null); setStage("running"); }
  function handleComplete(record: AccountRecord) { setResult(record); setStage("done"); setMemoryRefresh((n) => n + 1); }
  function handleError(msg: string) { setError(msg); setStage("form"); }
  function handleNewResearch() { setStage("form"); setResult(null); setError(null); }
  function update(field: keyof ProspectInput, value: string) { setForm((prev) => ({ ...prev, [field]: value })); }

  return (
    <div className="min-h-screen bg-nx-bg text-nx-text flex flex-col">
      <header className="border-b border-nx-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">N</div>
          <div><span className="font-bold text-white text-sm">NEXUS</span><span className="text-nx-muted text-sm"> / Sales Terminal</span></div>
        </div>
        <div className="flex items-center gap-1 bg-nx-surface border border-nx-border rounded-lg p-1">
          {(["research", "memory"] as View[]).map((v) => (
            <button key={v} onClick={() => { setView(v); setSelectedAccount(null); }}
              className={clsx("px-4 py-1.5 rounded-md text-sm font-semibold transition-colors capitalize",
                view === v ? "bg-indigo-500/20 text-indigo-400" : "text-nx-muted hover:text-white")}>
              {v === "research" ? "⚡ Research" : "🧠 Memory"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse-slow" />
          <span className="text-xs text-green-400 font-semibold">5 Agents Online</span>
        </div>
      </header>

      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        {view === "research" && (
          <div className="space-y-6">
            {stage === "form" && (
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />Powered by Claude Opus
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Research Any Prospect in 60 Seconds</h1>
                <p className="text-nx-muted max-w-xl mx-auto">5 AI agents: Why Now Engine → Contact Research → ICP Scorer → Outreach Writer → Memory.</p>
              </div>
            )}
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                <strong>Error: </strong>{error}<button onClick={() => setError(null)} className="ml-3 underline">Dismiss</button>
              </div>
            )}
            {stage === "form" && (
              <form onSubmit={handleSubmit} className="rounded-xl border border-nx-border bg-nx-surface p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <Section title="Target Company">
                    <Field label="Company Name *" placeholder="e.g. Stripe" value={form.company} onChange={(v) => update("company", v)} required />
                    <Field label="Website" placeholder="e.g. stripe.com" value={form.website ?? ""} onChange={(v) => update("website", v)} />
                  </Section>
                  <Section title="Target Contact">
                    <Field label="Full Name *" placeholder="e.g. Patrick Collison" value={form.contactName} onChange={(v) => update("contactName", v)} required />
                    <Field label="Role / Title *" placeholder="e.g. VP of Sales" value={form.contactRole} onChange={(v) => update("contactRole", v)} required />
                    <Field label="LinkedIn URL" placeholder="linkedin.com/in/..." value={form.contactLinkedIn ?? ""} onChange={(v) => update("contactLinkedIn", v)} />
                  </Section>
                </div>
                <div className="border-t border-nx-border pt-4">
                  <Section title="Your Information">
                    <div className="grid grid-cols-3 gap-3">
                      <Field label="Your Name *" placeholder="e.g. Aditya" value={form.yourName} onChange={(v) => update("yourName", v)} required />
                      <Field label="Your Company *" placeholder="e.g. NEXUS AI" value={form.yourCompany} onChange={(v) => update("yourCompany", v)} required />
                      <Field label="What You Sell *" placeholder="e.g. AI sales automation" value={form.yourProduct} onChange={(v) => update("yourProduct", v)} required />
                    </div>
                  </Section>
                </div>
                <button type="submit" className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                  <span>⚡</span>Run 5-Agent Research Pipeline
                </button>
              </form>
            )}
            {stage === "running" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-white text-lg">Researching {form.contactName} at {form.company}</h2>
                  <span className="text-xs text-nx-muted">Do not close this tab</span>
                </div>
                <AgentPipeline input={form} onComplete={handleComplete} onError={handleError} />
              </div>
            )}
            {stage === "done" && result && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-white text-lg">Research Complete — {result.input.contactName} at {result.input.company}</h2>
                  <button onClick={handleNewResearch} className="text-sm text-indigo-400 hover:text-white border border-indigo-500/30 hover:border-indigo-400 px-3 py-1.5 rounded-lg transition-colors">+ New Research</button>
                </div>
                <OutreachPanel record={result} />
              </div>
            )}
          </div>
        )}
        {view === "memory" && (
          <div className="space-y-4">
            {selectedAccount ? (
              <div>
                <button onClick={() => setSelectedAccount(null)} className="text-sm text-nx-muted hover:text-white mb-4 flex items-center gap-1">← Back to Memory</button>
                <OutreachPanel record={selectedAccount} />
              </div>
            ) : (
              <AccountMemory refresh={memoryRefresh} onSelect={setSelectedAccount} />
            )}
          </div>
        )}
      </div>

      <footer className="border-t border-nx-border px-6 py-3 flex items-center justify-between text-xs text-nx-muted">
        <span>NEXUS Sales Terminal · Powered by Claude + Tavily</span>
        <span className="flex items-center gap-4">
          {([["bg-amber-400","Why Now"],["bg-indigo-400","Contact Research"],["bg-cyan-400","ICP Scorer"],["bg-purple-400","Outreach Writer"],["bg-green-400","Memory"]] as [string,string][]).map(([c,l]) => (
            <span key={l} className="flex items-center gap-1.5"><span className={clsx("w-1.5 h-1.5 rounded-full", c)} />{l}</span>
          ))}
        </span>
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><div className="text-xs font-semibold text-nx-muted uppercase tracking-wider mb-3">{title}</div><div className="space-y-3">{children}</div></div>;
}

function Field({ label, placeholder, value, onChange, required = false }: { label: string; placeholder: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <div>
      <label className="text-xs text-nx-muted block mb-1">{label}</label>
      <input type="text" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} required={required}
        className="w-full px-3 py-2 rounded-lg bg-nx-bg border border-nx-border text-nx-text text-sm placeholder-nx-border focus:outline-none focus:border-indigo-500/60 transition-colors" />
    </div>
  );
}