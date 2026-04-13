'use client';

import { useState } from 'react';
import type { SalesResult } from '@/lib/types';

interface Props { result: SalesResult; }
type Tab = 'email' | 'linkedin' | 'followup' | 'contacts' | 'icp';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="text-xs px-3 py-1.5 rounded-lg bg-[#1e293b] hover:bg-indigo-600 text-[#94a3b8] hover:text-white transition-colors font-medium">
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

export default function OutreachPanel({ result }: Props) {
  const [tab, setTab] = useState<Tab>('email');
  const tabs: { id: Tab; label: string }[] = [
    { id: 'email', label: 'Cold Email' }, { id: 'linkedin', label: 'LinkedIn DM' },
    { id: 'followup', label: 'Follow-up' }, { id: 'contacts', label: 'Contacts' }, { id: 'icp', label: 'ICP Analysis' },
  ];

  return (
    <div className="rounded-2xl border border-[#1e293b] bg-[#111827] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e293b]">
        <div>
          <h3 className="font-bold text-white">{result.company}</h3>
          <p className="text-xs text-[#94a3b8]">Intelligence brief · {new Date(result.completedAt).toLocaleTimeString()}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-[#94a3b8]">ICP Score</div>
            <span className={`font-bold text-lg ${result.icp.score >= 75 ? 'text-emerald-400' : result.icp.score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{result.icp.score}</span>
            <span className="text-xs text-[#94a3b8]">/100</span>
          </div>
          <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
            result.icp.recommendation === 'pursue' ? 'bg-emerald-900/50 text-emerald-400 border-emerald-800'
            : result.icp.recommendation === 'nurture' ? 'bg-amber-900/50 text-amber-400 border-amber-800'
            : 'bg-red-900/50 text-red-400 border-red-800'
          }`}>{result.icp.recommendation.toUpperCase()}</div>
        </div>
      </div>

      {result.whyNow.signals.length > 0 && (
        <div className="px-5 py-3 border-b border-[#1e293b] flex gap-2 flex-wrap">
          {result.whyNow.signals.map((signal, i) => (
            <div key={i} className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              signal.urgency === 'high' ? 'bg-indigo-900/50 text-indigo-300 border border-indigo-800' : 'bg-[#1e293b] text-[#94a3b8]'
            }`}>⚡ {signal.type}: {signal.detail.slice(0, 60)}{signal.detail.length > 60 ? '…' : ''}</div>
          ))}
        </div>
      )}

      <div className="flex border-b border-[#1e293b] overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors ${
              tab === t.id ? 'text-indigo-400 border-b-2 border-indigo-500 -mb-px' : 'text-[#94a3b8] hover:text-white'
            }`}>{t.label}</button>
        ))}
      </div>

      <div className="p-5">
        {tab === 'email' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div><span className="text-xs text-[#94a3b8]">Subject: </span><span className="text-sm font-medium text-white">{result.outreach.coldEmail.subject}</span></div>
              <CopyButton text={`Subject: ${result.outreach.coldEmail.subject}\n\n${result.outreach.coldEmail.body}`} />
            </div>
            <div className="rounded-xl bg-[#0a0e1a] border border-[#1e293b] p-4">
              <pre className="text-sm text-[#e2e8f0] whitespace-pre-wrap font-sans leading-relaxed">{result.outreach.coldEmail.body}</pre>
            </div>
            <p className="text-xs text-[#94a3b8]">Quality score: <span className="text-indigo-400 font-semibold">{result.outreach.qualityScore}/100</span> · {result.outreach.iterations} pass{result.outreach.iterations > 1 ? 'es' : ''}</p>
          </div>
        )}
        {tab === 'linkedin' && (
          <div className="space-y-3">
            <div className="flex justify-end"><CopyButton text={result.outreach.linkedinDM} /></div>
            <div className="rounded-xl bg-[#0a0e1a] border border-[#1e293b] p-4">
              <pre className="text-sm text-[#e2e8f0] whitespace-pre-wrap font-sans leading-relaxed">{result.outreach.linkedinDM}</pre>
            </div>
          </div>
        )}
        {tab === 'followup' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div><span className="text-xs text-[#94a3b8]">Subject: </span><span className="text-sm font-medium text-white">{result.outreach.followUpEmail.subject}</span></div>
              <CopyButton text={`Subject: ${result.outreach.followUpEmail.subject}\n\n${result.outreach.followUpEmail.body}`} />
            </div>
            <div className="rounded-xl bg-[#0a0e1a] border border-[#1e293b] p-4">
              <pre className="text-sm text-[#e2e8f0] whitespace-pre-wrap font-sans leading-relaxed">{result.outreach.followUpEmail.body}</pre>
            </div>
          </div>
        )}
        {tab === 'contacts' && (
          <div className="space-y-3">
            {result.contacts.contacts.length === 0
              ? <p className="text-[#94a3b8] text-sm">No contacts found</p>
              : result.contacts.contacts.map((contact, i) => (
                <div key={i} className="rounded-xl bg-[#0a0e1a] border border-[#1e293b] p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div><p className="font-semibold text-white">{contact.name}</p><p className="text-xs text-indigo-400">{contact.title}</p></div>
                    {contact.linkedinUrl && <a href={contact.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-xs px-2.5 py-1 rounded-lg bg-blue-900/40 text-blue-400 border border-blue-800 hover:bg-blue-800/40 transition-colors">LinkedIn →</a>}
                  </div>
                  <p className="text-xs text-[#94a3b8]">{contact.background}</p>
                  {contact.emailHint && <p className="text-xs text-[#94a3b8] mt-1">Email pattern: <code className="text-indigo-300">{contact.emailHint}</code></p>}
                </div>
              ))
            }
          </div>
        )}
        {tab === 'icp' && (
          <div className="space-y-3">
            <p className="text-sm text-[#e2e8f0]">{result.icp.rationale}</p>
            <div className="space-y-3">
              {result.icp.dimensions.map((dim, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#94a3b8]">{dim.name}</span>
                    <span className={`text-xs font-semibold ${dim.score >= 75 ? 'text-emerald-400' : dim.score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{dim.score}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#1e293b]">
                    <div className={`h-full rounded-full ${dim.score >= 75 ? 'bg-emerald-500' : dim.score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${dim.score}%` }} />
                  </div>
                  <p className="text-xs text-[#94a3b8] mt-1">{dim.note}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
