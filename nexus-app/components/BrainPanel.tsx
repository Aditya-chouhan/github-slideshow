'use client';

import { useState, useRef } from 'react';
import type { BrainResult, BrainRoutingPlan, AgentEvent } from '@/lib/types';

const EXAMPLE_QUESTIONS = [
  'Why are we losing deals to Competitor X and what should we do?',
  'Which customers are most at risk of churning this quarter?',
  'Should we raise prices? What\'s the competitive context?',
  'What\'s our biggest revenue growth opportunity right now?',
  'How healthy is our ARR and what are the top 3 risks?',
];

export default function BrainPanel() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string[]>([]);
  const [plan, setPlan] = useState<BrainRoutingPlan | null>(null);
  const [synthesis, setSynthesis] = useState('');
  const [result, setResult] = useState<BrainResult | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const run = async (msg?: string) => {
    const question = msg ?? message;
    if (!question.trim() || loading) return;
    if (msg) setMessage(msg);
    setLoading(true);
    setProgress([]);
    setPlan(null);
    setSynthesis('');
    setResult(null);
    abortRef.current = new AbortController();

    try {
      const res = await fetch('/api/brain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question }),
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

            if (event.type === 'agent_start') {
              setProgress(p => [...p, `${event.emoji} ${event.agent}: ${event.description}`]);
            } else if (event.type === 'agent_progress') {
              setProgress(p => [...p.slice(-50), `  ${event.text}`]);
            } else if (event.type === 'agent_complete') {
              setProgress(p => [...p, `✅ ${event.agent}: ${event.summary}`]);
            } else if (event.type === 'brain_routing') {
              setPlan(event.plan);
              setProgress(p => [...p, `🗺️ Routing to: ${event.plan.agents.map(a => a.agentName).join(', ')}`]);
            } else if (event.type === 'brain_agent_start') {
              setProgress(p => [...p, `▶️ Running: ${event.agentName}`]);
            } else if (event.type === 'brain_agent_done') {
              setProgress(p => [...p, `${event.success ? '✅' : '❌'} ${event.agentName} done`]);
            } else if (event.type === 'brain_synthesis') {
              setSynthesis(prev => prev + event.text);
            } else if (event.type === 'brain_complete') {
              setResult(event.result);
            } else if (event.type === 'agent_tool_call') {
              setProgress(p => [...p.slice(-50), `  🔍 ${event.query}`]);
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-3">🧠</div>
          <h1 className="text-4xl font-bold text-white">NEXUS Brain</h1>
          <p className="text-gray-400 mt-2 text-lg">Ask any business question. The Brain routes it to the right agents and synthesizes the answer.</p>
        </div>

        {/* Example questions */}
        {!result && !loading && (
          <div className="mb-6">
            <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider">Example questions</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => run(q)}
                  className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-lg transition-colors text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="mb-4">
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Ask any business question — sales, marketing, revenue, competitive, or financial…"
            className="w-full bg-gray-900 border border-gray-700 rounded-2xl p-5 text-gray-100 placeholder-gray-500 resize-none focus:outline-none focus:border-indigo-500 text-base min-h-[100px]"
            onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) run(); }}
          />
        </div>

        <button
          onClick={() => run()}
          disabled={loading || !message.trim()}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold rounded-2xl transition-colors text-lg"
        >
          {loading ? '🧠 Thinking…' : '⚡ Ask the Brain'}
        </button>

        {/* Routing plan */}
        {plan && plan.agents.length > 0 && (
          <div className="mt-6 bg-gray-900 rounded-xl p-4 border border-indigo-900/40">
            <p className="text-xs text-indigo-400 font-semibold mb-2">🗺️ Routing Plan ({plan.parallel ? 'parallel' : 'sequential'})</p>
            <div className="flex flex-wrap gap-2">
              {plan.agents.map((a, i) => (
                <span key={i} className="bg-indigo-900/40 text-indigo-200 text-xs px-3 py-1 rounded-full border border-indigo-700/40">
                  {a.agentName}
                </span>
              ))}
            </div>
            {plan.rationale && <p className="text-xs text-gray-400 mt-2">{plan.rationale}</p>}
          </div>
        )}

        {/* Progress */}
        {progress.length > 0 && !result && (
          <div className="mt-4 bg-gray-900 rounded-xl p-4 font-mono text-xs text-gray-300 max-h-64 overflow-y-auto border border-gray-800">
            {progress.map((line, i) => <div key={i} className="py-0.5 leading-relaxed">{line}</div>)}
          </div>
        )}

        {/* Synthesis */}
        {(synthesis || result?.synthesis) && (
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🧠</span>
              <h2 className="text-xl font-bold text-white">Executive Brief</h2>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-indigo-950/30 rounded-2xl p-6 border border-indigo-800/30">
              <div className="prose prose-invert max-w-none text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                {result?.synthesis ?? synthesis}
              </div>
            </div>

            {result && (
              <div className="mt-4 flex gap-4 text-xs text-gray-500">
                <span>Agents used: {result.agentResults.length}</span>
                <span>•</span>
                <span>Completed: {new Date(result.completedAt).toLocaleTimeString()}</span>
                <span>•</span>
                <span>{result.agentResults.filter(r => r.success).length}/{result.agentResults.length} successful</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
