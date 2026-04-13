'use client';

import { useEffect, useState } from 'react';
import type { AccountRecord } from '@/lib/types';

interface Props {
  refreshTrigger?: number;
  onSelectAccount?: (account: AccountRecord) => void;
}

export default function AccountMemory({ refreshTrigger, onSelectAccount }: Props) {
  const [accounts, setAccounts] = useState<AccountRecord[]>([]);

  useEffect(() => {
    fetch('/api/accounts').then(r => r.json()).then(d => setAccounts(d.accounts || [])).catch(() => {});
  }, [refreshTrigger]);

  if (accounts.length === 0) {
    return (
      <div className="rounded-2xl border border-[#1e293b] bg-[#111827] p-5">
        <h3 className="font-semibold text-white text-sm mb-1">NEXUS Brain Memory</h3>
        <p className="text-xs text-[#94a3b8]">No accounts yet. Research a company to save it here.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#1e293b] bg-[#111827] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#1e293b] flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white text-sm">NEXUS Brain Memory</h3>
          <p className="text-xs text-[#94a3b8]">{accounts.length} account{accounts.length !== 1 ? 's' : ''} stored</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Live
        </div>
      </div>
      <div className="divide-y divide-[#1e293b]">
        {accounts.slice(0, 8).map(account => (
          <button key={account.id} onClick={() => onSelectAccount?.(account)}
            className="w-full px-5 py-3 flex items-center justify-between hover:bg-[#0a0e1a] transition-colors text-left group">
            <div className="min-w-0">
              <p className="font-medium text-white text-sm group-hover:text-indigo-300 transition-colors truncate">{account.company}</p>
              <p className="text-xs text-[#94a3b8]">{new Date(account.createdAt).toLocaleDateString()} · {account.contacts.length} contact{account.contacts.length !== 1 ? 's' : ''}</p>
            </div>
            <div className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${
              account.recommendation === 'pursue' ? 'bg-emerald-900/50 text-emerald-400'
              : account.recommendation === 'nurture' ? 'bg-amber-900/50 text-amber-400'
              : 'bg-red-900/50 text-red-400'
            }`}>{account.icpScore}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
