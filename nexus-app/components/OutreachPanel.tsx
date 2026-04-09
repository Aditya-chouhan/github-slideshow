"use client";

import { useState } from "react";
import type { AccountRecord } from "@/lib/types";
import clsx from "clsx";

type Tab = "email" | "dm" | "connect" | "intel";

export function OutreachPanel({ record }: { record: AccountRecord }) {
  const [tab, setTab] = useState<Tab>("email");
  const [copied, setCopied] = useState<string | null>(null);
  const { outreach, intelligence } = record;

  async function copy(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  const tabs = [
    { key: "email" as Tab, label: "Cold Email", icon: "📧" },
    { key: "dm" as Tab, label: "LinkedIn DM", icon: "💬" },
    { key: "connect" as Tab, label: "Connect Note", icon: "🤝" },
    { key: "intel" as Tab, label: "Intel Brief", icon: "📊" },
  ];

  const fitColors = {
    strong: "text-green-400 border-green-500/30 bg-green-500/10",
    moderate: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    weak: "text-red-400 border-red-500/30 bg-red-500/10",
  };

  return (
    <div className="rounded-xl border border-nx-border bg-nx-surface overflow-hidden">
      <div className="px-5 py-4 border-b border-nx-border flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-white text-lg">{record.input.contactName}</h3>
            <span className={clsx("text-xs font-semibold px-2 py-0.5 rounded-full border", fitColors[intelligence.icpFit])}>{intelligence.icpFit.toUpperCase()} FIT</span>
          </div>
          <p className="text-sm text-nx-muted mt-0.5">{record.input.contactRole} · {record.input.company}</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-nx-muted">Why Now</div>
          <div className="text-xs text-white max-w-48 text-right">{intelligence.whyNowSummary.slice(0, 80)}...</div>
        </div>
      </div>

      <div className="flex border-b border-nx-border">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={clsx("flex-1 px-3 py-2.5 text-xs font-semibold transition-colors", tab === t.key ? "bg-indigo-500/10 text-indigo-400 border-b-2 border-indigo-500" : "text-nx-muted hover:text-white")}>{t.icon} {t.label}</button>
        ))}
      </div>

      <div className="p-5">
        {tab === "email" && (
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1"><span className="text-xs text-nx-muted uppercase tracking-wider">Subject Line</span><CopyBtn text={outreach.coldEmail.subject} id="subj" copied={copied} onCopy={copy} /></div>
              <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-4 py-2.5 font-semibold text-white text-sm">{outreach.coldEmail.subject}</div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1"><span className="text-xs text-nx-muted uppercase tracking-wider">Email Body</span><CopyBtn text={outreach.coldEmail.body} id="body" copied={copied} onCopy={copy} /></div>
              <div className="rounded-lg border border-nx-border bg-[#0d1117] px-4 py-3 text-sm text-nx-text whitespace-pre-wrap leading-relaxed">{outreach.coldEmail.body}</div>
            </div>
            <Reasoning text={outreach.coldEmail.reasoning} />
          </div>
        )}
        {tab === "dm" && (
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1"><span className="text-xs text-nx-muted uppercase tracking-wider">LinkedIn DM</span><CopyBtn text={outreach.linkedInDM.message} id="dm" copied={copied} onCopy={copy} /></div>
              <div className="rounded-lg border border-nx-border bg-[#0d1117] px-4 py-3 text-sm text-nx-text whitespace-pre-wrap leading-relaxed">{outreach.linkedInDM.message}</div>
            </div>
            <Reasoning text={outreach.linkedInDM.reasoning} />
          </div>
        )}
        {tab === "connect" && (
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-nx-muted uppercase tracking-wider">Connection Note</span>
                <div className="flex items-center gap-2"><span className="text-xs text-nx-muted">{outreach.linkedInConnect.note.length}/300 chars</span><CopyBtn text={outreach.linkedInConnect.note} id="conn" copied={copied} onCopy={copy} /></div>
              </div>
              <div className="rounded-lg border border-nx-border bg-[#0d1117] px-4 py-3 text-sm text-nx-text whitespace-pre-wrap leading-relaxed">{outreach.linkedInConnect.note}</div>
            </div>
            <Reasoning text={outreach.linkedInConnect.reasoning} />
          </div>
        )}
        {tab === "intel" && (
          <div className="space-y-4 text-sm">
            <div><div className="text-xs text-nx-muted uppercase tracking-wider mb-2">Company Overview</div><p className="text-nx-text">{intelligence.companyOverview}</p></div>
            <div>
              <div className="text-xs text-nx-muted uppercase tracking-wider mb-2">Why Now Signals</div>
              <div className="space-y-2">
                {intelligence.signals.map((sig, i) => (
                  <div key={i} className={clsx("rounded-lg border px-3 py-2", sig.relevance === "high" ? "border-amber-500/30 bg-amber-500/5" : sig.relevance === "medium" ? "border-indigo-500/20 bg-indigo-500/5" : "border-nx-border bg-nx-surface")}>
                    <div className="flex items-center gap-2">
                      <span className={clsx("text-xs font-bold px-1.5 py-0.5 rounded", sig.relevance === "high" ? "bg-amber-500/20 text-amber-400" : sig.relevance === "medium" ? "bg-indigo-500/20 text-indigo-400" : "bg-nx-border text-nx-muted")}>{sig.relevance.toUpperCase()}</span>
                      <span className="font-semibold text-white">{sig.title}</span>
                    </div>
                    <p className="text-nx-muted text-xs mt-1">{sig.summary}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs text-nx-muted uppercase tracking-wider mb-2">Contact Intel</div>
              <div className="rounded-lg border border-nx-border bg-[#0d1117] p-3 space-y-2">
                <div><span className="text-nx-muted">Background: </span><span className="text-nx-text">{intelligence.contact.background}</span></div>
                <div><span className="text-nx-muted">Recent: </span><span className="text-nx-text">{intelligence.contact.recentActivity}</span></div>
                <div><span className="text-nx-muted">Priorities: </span><span className="text-nx-text">{intelligence.contact.likelyPriorities.join(" · ")}</span></div>
                <div><span className="text-nx-muted">Best angle: </span><span className="text-indigo-300 font-medium">{intelligence.contact.bestAngle}</span></div>
              </div>
            </div>
            <div><div className="text-xs text-nx-muted uppercase tracking-wider mb-1">ICP Assessment</div><p className="text-nx-text">{intelligence.icpReason}</p></div>
          </div>
        )}
      </div>
    </div>
  );
}

function CopyBtn({ text, id, copied, onCopy }: { text: string; id: string; copied: string | null; onCopy: (t: string, k: string) => void }) {
  return <button onClick={() => onCopy(text, id)} className="text-xs text-nx-muted hover:text-white transition-colors px-2 py-1 rounded border border-nx-border hover:border-nx-muted">{copied === id ? "✓ Copied" : "Copy"}</button>;
}

function Reasoning({ text }: { text: string }) {
  return <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 px-3 py-2"><span className="text-xs text-purple-400 font-semibold">Agent reasoning: </span><span className="text-xs text-nx-muted">{text}</span></div>;
}