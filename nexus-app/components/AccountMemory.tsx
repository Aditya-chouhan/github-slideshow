"use client";

import { useEffect, useState } from "react";
import type { AccountRecord } from "@/lib/types";
import clsx from "clsx";

const STATUS_CONFIG = {
  researched: { label: "Researched", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30" },
  contacted: { label: "Contacted", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  replied: { label: "Replied", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" },
  meeting: { label: "Meeting", color: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
  closed: { label: "Closed ✓", color: "text-green-400 bg-green-500/10 border-green-500/30" },
  "not-fit": { label: "Not Fit", color: "text-nx-muted bg-nx-border/50 border-nx-border" },
};

export function AccountMemory({ refresh, onSelect }: { refresh?: number; onSelect?: (record: AccountRecord) => void }) {
  const [accounts, setAccounts] = useState<AccountRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/accounts");
        const data = (await res.json()) as { accounts: AccountRecord[] };
        setAccounts(data.accounts);
      } catch { setAccounts([]); }
      finally { setLoading(false); }
    }
    load();
  }, [refresh]);

  async function updateStatus(id: string, status: AccountRecord["status"]) {
    await fetch("/api/accounts", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  }

  if (loading) return <div className="text-center py-12 text-nx-muted text-sm">Loading account memory...</div>;

  if (accounts.length === 0) return (
    <div className="text-center py-16 text-nx-muted">
      <div className="text-4xl mb-3">🧠</div>
      <p className="font-semibold text-white mb-1">No accounts yet</p>
      <p className="text-sm">Research your first prospect to begin building memory.</p>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-nx-muted uppercase tracking-wider">Account Memory — {accounts.length} accounts</h3>
        <span className="text-xs text-nx-muted">{accounts.filter((a) => a.intelligence.icpFit === "strong").length} strong fit</span>
      </div>
      {accounts.map((acc) => {
        const s = STATUS_CONFIG[acc.status];
        return (
          <div key={acc.id} className="rounded-lg border border-nx-border bg-nx-surface p-4 hover:border-indigo-500/40 transition-colors cursor-pointer" onClick={() => onSelect?.(acc)}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-white">{acc.input.contactName}</span>
                  <span className="text-nx-muted text-sm">·</span>
                  <span className="text-sm text-nx-text">{acc.input.company}</span>
                  <span className={clsx("text-xs font-semibold", acc.intelligence.icpFit === "strong" ? "text-green-400" : acc.intelligence.icpFit === "moderate" ? "text-amber-400" : "text-red-400")}>{acc.intelligence.icpFit} fit</span>
                </div>
                <div className="text-xs text-nx-muted mt-0.5">{acc.input.contactRole}</div>
                {acc.intelligence.signals.length > 0 && <div className="text-xs text-amber-400 mt-1.5">⚡ {acc.intelligence.signals[0].title}</div>}
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <span className={clsx("text-xs px-2 py-0.5 rounded-full border font-semibold", s.color)}>{s.label}</span>
                <select className="text-xs bg-nx-bg border border-nx-border rounded px-2 py-1 text-nx-muted cursor-pointer" value={acc.status}
                  onChange={(e) => { e.stopPropagation(); updateStatus(acc.id, e.target.value as AccountRecord["status"]); }}
                  onClick={(e) => e.stopPropagation()}>
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}