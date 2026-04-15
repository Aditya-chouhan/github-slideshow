'use client';

import { useState, useRef } from 'react';
import type { CompetitiveResult, CompetitiveMode, AgentEvent } from '@/lib/types';

const MODES: { value: CompetitiveMode; label: string; emoji: string }[] = [
  { value: 'all', label: 'Full Intel', emoji: '🔬' },
  { value: 'pricing', label: 'Pricing', emoji: '💲' },
  { value: 'product', label: 'Product', emoji: '🏆' },
  { value: 'market', label: 'Market', emoji: '🌍' },
];

export default function CompetitivePanel() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<CompetitiveMode>('all');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string[]>([]);
  const [result, setResult] = useState<CompetitiveResult | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const run = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    setProgress([]);
    setResult(null);
    abortRef.current = new AbortController();

    try {
      const res = await fetch('/api/competitive', {
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
            } else if (event.type === 'competitive_complete') {
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
          <h1 className="text-3xl font-bold text-white">🏆 Competitive Intelligence</h1>
          <p className="text-gray-400 mt-1">Pricing intel · Product tracking · Market analysis</p>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          {MODES.map(m => (
            <button
              key={m.value}
              onClick={() => setMode(m.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === m.value ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
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
            placeholder="Enter your company name, product category, or competitor names to analyze…"
            className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-gray-100 placeholder-gray-500 resize-none focus:outline-none focus:border-purple-500 min-h-[120px]"
            onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) run(); }}
          />
        </div>

        <button
          onClick={run}
          disabled={loading || !input.trim()}
          className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-xl transition-colors"
        >
          {loading ? 'Researching…' : '⚡ Run Competitive Intelligence'}
        </button>

        {progress.length > 0 && (
          <div className="mt-6 bg-gray-900 rounded-xl p-4 font-mono text-xs text-gray-300 max-h-48 overflow-y-auto">
            {progress.map((line, i) => <div key={i} className="py-0.5">{line}</div>)}
          </div>
        )}

        {result && (
          <div className="mt-8 space-y-6">
            {/* Pricing */}
            {result.pricing && (
              <div className="bg-gray-900 rounded-xl p-5 border border-purple-900/40">
                <h2 className="text-lg font-bold text-purple-400 mb-3">💲 Pricing Intelligence</h2>
                <p className="text-gray-300 text-sm mb-2">{result.pricing.summary}</p>
                <div className="space-y-3 mb-4">
                  {result.pricing.signals.map((s, i) => (
                    <div key={i} className="bg-gray-800 rounded-lg p-3">
                      <div className="font-semibold text-white mb-1">{s.competitor}</div>
                      <p className="text-xs text-gray-400 mb-1">{s.pricingModel} · {s.recentChanges}</p>
                      <div className="flex gap-4 text-xs">
                        <div>
                          <span className="text-red-400">Their strengths: </span>
                          <span className="text-gray-300">{s.strengthsVsYou.join(', ')}</span>
                        </div>
                        <div>
                          <span className="text-green-400">Their weaknesses: </span>
                          <span className="text-gray-300">{s.weaknessesVsYou.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-purple-900/20 rounded-lg p-3 border border-purple-800/30">
                  <p className="text-xs text-purple-300 font-semibold mb-1">💡 Recommendation</p>
                  <p className="text-sm text-gray-200">{result.pricing.pricingRecommendation}</p>
                </div>
              </div>
            )}

            {/* Product Competitive */}
            {result.productCompetitive && (
              <div className="bg-gray-900 rounded-xl p-5 border border-orange-900/40">
                <h2 className="text-lg font-bold text-orange-400 mb-3">🏆 Product Intelligence</h2>
                <p className="text-gray-300 text-sm mb-4">{result.productCompetitive.summary}</p>
                {result.productCompetitive.recentSignals.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {result.productCompetitive.recentSignals.map((s, i) => (
                      <div key={i} className="bg-gray-800 rounded-lg p-3">
                        <div className="flex justify-between mb-1">
                          <span className="font-semibold text-white">{s.competitor}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            s.threatLevel === 'high' ? 'bg-red-900 text-red-300' :
                            s.threatLevel === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                            'bg-gray-700 text-gray-400'
                          }`}>{s.threatLevel} threat</span>
                        </div>
                        <p className="text-xs text-gray-300">{s.announcement}</p>
                        <p className="text-xs text-blue-300 mt-1">→ {s.responseRecommendation}</p>
                      </div>
                    ))}
                  </div>
                )}
                {result.productCompetitive.featureGaps.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-orange-300 mb-2">Feature Gaps:</p>
                    {result.productCompetitive.featureGaps.map((g, i) => (
                      <div key={i} className="flex justify-between text-xs py-1 border-b border-gray-800">
                        <span className="text-gray-300">{g.feature}</span>
                        <span className={`${g.urgency === 'high' ? 'text-red-400' : g.urgency === 'medium' ? 'text-yellow-400' : 'text-gray-400'}`}>{g.urgency}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Market Intel */}
            {result.marketIntel && (
              <div className="bg-gray-900 rounded-xl p-5 border border-blue-900/40">
                <h2 className="text-lg font-bold text-blue-400 mb-3">🌍 Market Intelligence</h2>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-gray-400 text-sm">Market Sentiment:</span>
                  <span className={`text-sm font-semibold px-2 py-0.5 rounded ${
                    result.marketIntel.marketSentiment === 'bullish' ? 'bg-green-900 text-green-300' :
                    result.marketIntel.marketSentiment === 'bearish' ? 'bg-red-900 text-red-300' :
                    'bg-gray-700 text-gray-300'
                  }`}>{result.marketIntel.marketSentiment}</span>
                </div>
                <p className="text-gray-300 text-sm mb-4">{result.marketIntel.summary}</p>
                <div className="space-y-2">
                  {result.marketIntel.trends.slice(0, 4).map((t, i) => (
                    <div key={i} className="bg-gray-800 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <span className="text-white text-sm font-medium">{t.trend}</span>
                        <span className={`text-xs ml-2 ${t.opportunity ? 'text-green-400' : 'text-red-400'}`}>
                          {t.opportunity ? '↑ Opportunity' : '↓ Threat'}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs mt-1">{t.implication}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
