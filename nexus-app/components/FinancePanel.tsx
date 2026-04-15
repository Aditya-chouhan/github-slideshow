'use client';

import { useState, useRef } from 'react';
import type { FinanceResult, FinanceMode, AgentEvent } from '@/lib/types';

const MODES: { value: FinanceMode; label: string; emoji: string }[] = [
  { value: 'all', label: 'Full Analysis', emoji: '🔬' },
  { value: 'forecast', label: 'ARR Forecast', emoji: '📉' },
  { value: 'spend', label: 'Spend Intel', emoji: '💳' },
];

export default function FinancePanel() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<FinanceMode>('all');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string[]>([]);
  const [result, setResult] = useState<FinanceResult | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const run = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    setProgress([]);
    setResult(null);
    abortRef.current = new AbortController();

    try {
      const res = await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, mode }),
        signal: abortRef.current.signal,
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event: AgentEvent = JSON.parse(line.slice(6));
            if (event.type === 'agent_progress') {
              setProgress(p => [...p.slice(-30), `[${event.agent}] ${event.text}`]);
            } else if (event.type === 'agent_start') {
              setProgress(p => [...p, `${event.emoji} ${event.agent}: ${event.description}`]);
            } else if (event.type === 'agent_complete') {
              setProgress(p => [...p, `✅ ${event.agent}: ${event.summary}`]);
            } else if (event.type === 'finance_complete') {
              setResult(event.result);
            } else if (event.type === 'error') {
              setProgress(p => [...p, `❌ Error: ${event.message}`]);
            }
          } catch {}
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setProgress(p => [...p, `❌ ${(err as Error).message}`]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">📉 Finance Intelligence</h1>
          <p className="text-gray-400 mt-1">ARR forecasting · Spend optimization · Financial health</p>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          {MODES.map(m => (
            <button
              key={m.value}
              onClick={() => setMode(m.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === m.value ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {m.emoji} {m.label}
            </button>
          ))}
        </div>

        <div className="mb-4">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Describe your current ARR, growth rate, team size, burn rate, top spend categories, or paste financial data…"
            className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-gray-100 placeholder-gray-500 resize-none focus:outline-none focus:border-cyan-500 min-h-[120px]"
            onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) run(); }}
          />
        </div>

        <button
          onClick={run}
          disabled={loading || !input.trim()}
          className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-xl transition-colors"
        >
          {loading ? 'Analyzing…' : '⚡ Run Finance Analysis'}
        </button>

        {progress.length > 0 && (
          <div className="mt-6 bg-gray-900 rounded-xl p-4 font-mono text-xs text-gray-300 max-h-48 overflow-y-auto">
            {progress.map((line, i) => <div key={i} className="py-0.5">{line}</div>)}
          </div>
        )}

        {result && (
          <div className="mt-8 space-y-6">
            {/* Forecast */}
            {result.forecast && (
              <div className="bg-gray-900 rounded-xl p-5 border border-cyan-900/40">
                <h2 className="text-lg font-bold text-cyan-400 mb-1">📉 ARR Forecast</h2>
                <p className="text-gray-300 text-sm mb-4">{result.forecast.summary}</p>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {result.forecast.scenarios.map((s, i) => (
                    <div key={i} className={`rounded-lg p-3 ${
                      s.name === 'base' ? 'bg-blue-900/30 border border-blue-800/40' :
                      s.name === 'optimistic' ? 'bg-green-900/30 border border-green-800/40' :
                      'bg-red-900/30 border border-red-800/40'
                    }`}>
                      <div className="text-xs text-gray-400 capitalize mb-1">{s.name}</div>
                      <div className="text-lg font-bold text-white">{s.endOfYearARR}</div>
                      <div className="text-xs text-gray-400">{s.growthRate} growth</div>
                    </div>
                  ))}
                </div>
                {result.forecast.monthlyProjections.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-gray-400 border-b border-gray-700">
                          <th className="text-left py-2">Month</th>
                          <th className="text-right py-2">New ARR</th>
                          <th className="text-right py-2">Churned</th>
                          <th className="text-right py-2">Net ARR</th>
                          <th className="text-right py-2">Cumulative</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.forecast.monthlyProjections.slice(0, 6).map((m, i) => (
                          <tr key={i} className="border-b border-gray-800">
                            <td className="py-1.5 text-gray-300">{m.month}</td>
                            <td className="py-1.5 text-right text-green-400">{m.newARR}</td>
                            <td className="py-1.5 text-right text-red-400">{m.churnedARR}</td>
                            <td className="py-1.5 text-right text-white">{m.netARR}</td>
                            <td className="py-1.5 text-right text-cyan-400 font-mono">{m.cumulativeARR}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {result.forecast.recommendation && (
                  <div className="mt-4 bg-cyan-900/20 rounded-lg p-3 border border-cyan-800/30">
                    <p className="text-xs font-semibold text-cyan-300 mb-1">💡 CFO Recommendation</p>
                    <p className="text-sm text-gray-200">{result.forecast.recommendation}</p>
                  </div>
                )}
              </div>
            )}

            {/* Spend */}
            {result.spend && (
              <div className="bg-gray-900 rounded-xl p-5 border border-yellow-900/40">
                <h2 className="text-lg font-bold text-yellow-400 mb-1">💳 Spend Intelligence</h2>
                <p className="text-gray-300 text-sm mb-2">{result.spend.summary}</p>
                <div className="flex gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-400">Monthly spend: </span>
                    <span className="text-white font-mono">{result.spend.totalMonthlySpend}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Waste: </span>
                    <span className="text-red-400 font-mono">{result.spend.totalWasteEstimate}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Savings potential: </span>
                    <span className="text-green-400 font-mono">{result.spend.annualizedSavingsPotential}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {result.spend.categories.map((c, i) => (
                    <div key={i} className="bg-gray-800 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-white text-sm font-medium">{c.category}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          c.priority === 'high' ? 'bg-red-900 text-red-300' :
                          c.priority === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                          'bg-gray-700 text-gray-400'
                        }`}>{c.priority}</span>
                      </div>
                      <div className="flex gap-4 text-xs mb-1">
                        <span className="text-gray-400">Spend: <span className="text-white">{c.currentMonthlySpend}</span></span>
                        <span className="text-red-400">Waste: {c.wasteEstimate}</span>
                      </div>
                      <p className="text-xs text-blue-300">→ {c.optimizationOpportunity}</p>
                    </div>
                  ))}
                </div>
                {result.spend.priorityActions.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-700">
                    <p className="text-xs font-semibold text-yellow-300 mb-2">Priority Actions:</p>
                    {result.spend.priorityActions.map((a, i) => (
                      <p key={i} className="text-xs text-gray-300">• {a}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
