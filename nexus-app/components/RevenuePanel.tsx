'use client';

import { useState, useRef } from 'react';
import type { RevenueResult, RevenueMode, AgentEvent } from '@/lib/types';

const MODES: { value: RevenueMode; label: string; emoji: string }[] = [
  { value: 'all', label: 'Full Analysis', emoji: '🔬' },
  { value: 'churn', label: 'Churn Risk', emoji: '🚨' },
  { value: 'expansion', label: 'Expansion', emoji: '📈' },
  { value: 'health', label: 'Revenue Health', emoji: '💰' },
];

export default function RevenuePanel() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<RevenueMode>('all');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string[]>([]);
  const [result, setResult] = useState<RevenueResult | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const run = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    setProgress([]);
    setResult(null);
    abortRef.current = new AbortController();

    try {
      const res = await fetch('/api/revenue', {
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
            } else if (event.type === 'revenue_complete') {
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">💰 Revenue Operations</h1>
          <p className="text-gray-400 mt-1">Churn prediction · Expansion intelligence · Revenue health monitoring</p>
        </div>

        {/* Mode selector */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {MODES.map(m => (
            <button
              key={m.value}
              onClick={() => setMode(m.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === m.value
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {m.emoji} {m.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="mb-4">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Paste customer data, ARR metrics, account names, or describe your revenue situation…"
            className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-gray-100 placeholder-gray-500 resize-none focus:outline-none focus:border-green-500 min-h-[120px]"
            onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) run(); }}
          />
        </div>

        <button
          onClick={run}
          disabled={loading || !input.trim()}
          className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-xl transition-colors"
        >
          {loading ? 'Analyzing…' : '⚡ Run Revenue Analysis'}
        </button>

        {/* Progress log */}
        {progress.length > 0 && (
          <div className="mt-6 bg-gray-900 rounded-xl p-4 font-mono text-xs text-gray-300 max-h-48 overflow-y-auto">
            {progress.map((line, i) => (
              <div key={i} className="py-0.5">{line}</div>
            ))}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-8 space-y-6">
            {/* Churn */}
            {result.churn && (
              <div className="bg-gray-900 rounded-xl p-5 border border-red-900/40">
                <h2 className="text-lg font-bold text-red-400 mb-3">🚨 Churn Risk Analysis</h2>
                <p className="text-gray-300 text-sm mb-4">{result.churn.summary}</p>
                <div className="space-y-3">
                  {result.churn.atRiskAccounts.map((a, i) => (
                    <div key={i} className="bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-white">{a.accountName}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          a.riskLevel === 'critical' ? 'bg-red-900 text-red-300' :
                          a.riskLevel === 'high' ? 'bg-orange-900 text-orange-300' :
                          'bg-yellow-900 text-yellow-300'
                        }`}>{a.riskLevel} risk</span>
                      </div>
                      <p className="text-gray-400 text-xs">{a.signals.slice(0, 2).join(' · ')}</p>
                      <p className="text-blue-300 text-xs mt-1">→ {a.interventionRecommendation}</p>
                    </div>
                  ))}
                </div>
                {result.churn.immediateActions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-xs text-gray-400 font-semibold mb-1">Immediate Actions:</p>
                    {result.churn.immediateActions.map((a, i) => <p key={i} className="text-xs text-green-300">• {a}</p>)}
                  </div>
                )}
              </div>
            )}

            {/* Expansion */}
            {result.expansion && (
              <div className="bg-gray-900 rounded-xl p-5 border border-green-900/40">
                <h2 className="text-lg font-bold text-green-400 mb-3">📈 Expansion Opportunities</h2>
                <p className="text-gray-300 text-sm mb-1">{result.expansion.summary}</p>
                <p className="text-green-400 text-sm font-semibold mb-4">Total pipeline: {result.expansion.totalPipelineEstimate}</p>
                <div className="space-y-3">
                  {result.expansion.opportunities.map((o, i) => (
                    <div key={i} className="bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-white">{o.accountName}</span>
                        <span className="text-green-400 font-mono text-sm">{o.estimatedARR}</span>
                      </div>
                      <p className="text-gray-400 text-xs">{o.rationale}</p>
                      <p className="text-blue-300 text-xs mt-1">→ {o.recommendedApproach}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Revenue Health */}
            {result.revenueHealth && (
              <div className="bg-gray-900 rounded-xl p-5 border border-blue-900/40">
                <h2 className="text-lg font-bold text-blue-400 mb-3">💰 Revenue Health</h2>
                <p className="text-gray-300 text-sm mb-4">{result.revenueHealth.summary}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.revenueHealth.metrics.map((m, i) => (
                    <div key={i} className="bg-gray-800 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-gray-300 text-sm font-medium">{m.name}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          m.status === 'healthy' ? 'bg-green-900 text-green-300' :
                          m.status === 'warning' ? 'bg-yellow-900 text-yellow-300' :
                          'bg-red-900 text-red-300'
                        }`}>{m.status}</span>
                      </div>
                      <div className="flex gap-2 text-xs text-gray-400">
                        <span className="text-white font-mono">{m.value}</span>
                        <span>vs {m.benchmark}</span>
                        <span className={m.trend === 'up' ? 'text-green-400' : m.trend === 'down' ? 'text-red-400' : 'text-gray-400'}>
                          {m.trend === 'up' ? '↑' : m.trend === 'down' ? '↓' : '→'}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs mt-1">{m.note}</p>
                    </div>
                  ))}
                </div>
                {result.revenueHealth.alerts.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-700">
                    <p className="text-xs font-semibold text-red-400 mb-1">⚠️ Alerts:</p>
                    {result.revenueHealth.alerts.map((a, i) => <p key={i} className="text-xs text-red-300">• {a}</p>)}
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
