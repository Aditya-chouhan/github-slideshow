'use client';

import { useState, useRef, useCallback } from 'react';
import AgentPipeline from '@/components/AgentPipeline';
import OutreachPanel from '@/components/OutreachPanel';
import AccountMemory from '@/components/AccountMemory';
import type { AgentEvent, SalesResult } from '@/lib/types';

export default function SalesTerminal() {
  const [company, setCompany] = useState('');
  const [running, setRunning] = useState(false);
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [result, setResult] = useState<SalesResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [memoryRefresh, setMemoryRefresh] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(async () => {
    if (!company.trim() || running) return;
    setRunning(true); setEvents([]); setResult(null); setError(null);
    abortRef.current = new AbortController();
    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: company.trim() }),
        signal: abortRef.current.signal,
      });
      if (!response.ok) throw new Error(`API error ${response.status}`);
      if (!response.body) throw new Error('No response body');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value, { stream: true }).split('\n').filter(l => l.trim());
        for (const line of lines) {
          try {
            const event = JSON.parse(line) as AgentEvent;
            setEvents(prev => [...prev, event]);
            if (event.type === 'pipeline_complete') { setResult(event.result); setMemoryRefresh(n => n + 1); }
            if (event.type === 'error') setError(event.message);
          } catch {}
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') setError(err.message);
    } finally { setRunning(false); }
  }, [company, running]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Sales Terminal</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Company Intelligence & Outreach</h1>
        <p className="text-[#94a3b8] text-sm mt-1">Type a company name. 5 AI agents research, score, and write personalised outreach — in 90 seconds.</p>
      </div>

      <div className="flex gap-3 mb-8">
        <input
          type="text" value={company}
          onChange={e => setCompany(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && run()}
          placeholder="Enter company name (e.g. Stripe, Notion, Linear…)"
          disabled={running}
          className="flex-1 px-4 py-3 rounded-xl bg-[#111827] border border-[#1e293b] text-white placeholder-[#475569] text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
        />
        <button onClick={run} disabled={running || !company.trim()}
          className="px-6 py-3 rounded-xl font-semibold text-white text-sm bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 disabled:opacity-40 transition-opacity whitespace-nowrap">
          {running ? <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Running…</span> : 'Run 5 Agents →'}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {(events.length > 0 || running) && (
            <div><h2 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">Agent Pipeline</h2><AgentPipeline events={events} running={running} /></div>
          )}
          {error && <div className="rounded-xl border border-red-800 bg-red-950/30 px-4 py-3 text-sm text-red-400">Error: {error}</div>}
          {result && <div><h2 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">Intelligence Brief</h2><OutreachPanel result={result} /></div>}
          {events.length === 0 && !running && !result && (
            <div className="rounded-2xl border border-dashed border-[#1e293b] p-12 text-center">
              <div className="text-3xl mb-3">⚡</div>
              <p className="text-[#94a3b8] text-sm">Enter a company name and click Run 5 Agents to start</p>
              <p className="text-xs text-[#475569] mt-1">Try: Stripe · Notion · Linear · OpenAI · HubSpot</p>
            </div>
          )}
        </div>
        <div className="space-y-6">
          <div><h2 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">Brain Memory</h2><AccountMemory refreshTrigger={memoryRefresh} /></div>
          <div className="rounded-2xl border border-[#1e293b] bg-[#111827] p-5">
            <h3 className="font-semibold text-white text-sm mb-3">How it works</h3>
            <div className="space-y-2">
              {[['\u26a1','Why Now','Finds urgent buying signals from web'],['\ud83d\udc64','Contact Intel','Identifies 3 decision-makers'],['\ud83c\udfaf','ICP Scorer','Scores fit across 6 dimensions'],['\u270d\ufe0f','Outreach','Writes & self-evaluates copy'],['\ud83e\udde0','Memory','Saves to NEXUS Brain for Marketing']].map(([emoji,name,desc]) => (
                <div key={name} className="flex gap-3 text-xs"><span>{emoji}</span><div><span className="font-medium text-white">{name}</span><span className="text-[#94a3b8]"> — {desc}</span></div></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
