'use client';

import type { AgentEvent } from '@/lib/types';

interface Props {
  events: AgentEvent[];
  running: boolean;
}

export default function MarketingPipeline({ events, running }: Props) {
  const started = events.find(e => e.type === 'agent_start');
  const completed = events.find(e => e.type === 'agent_complete');
  const progresses = events.filter(e => e.type === 'agent_progress').slice(-5);

  if (!started && !running) return null;

  return (
    <div className="rounded-2xl border border-pink-500/30 bg-pink-950/20 overflow-hidden">
      <div className="px-5 py-4 border-b border-pink-500/20 flex items-center gap-3">
        <span className="text-xl">{started && started.type === 'agent_start' ? started.emoji : '🤖'}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white text-sm">{started && started.type === 'agent_start' ? started.agent : 'Agent'}</span>
            {!completed && running && (
              <span className="inline-flex items-center gap-1 text-xs text-pink-400">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />Running
              </span>
            )}
            {completed && <span className="text-xs text-emerald-400">✓ Done</span>}
          </div>
          {started && started.type === 'agent_start' && <p className="text-xs text-[#94a3b8]">{started.description}</p>}
        </div>
        {completed && completed.type === 'agent_complete' && (
          <span className="text-xs text-emerald-400 font-medium">{completed.summary}</span>
        )}
      </div>
      {progresses.length > 0 && !completed && (
        <div className="px-5 py-3 space-y-1">
          {progresses.map((e, i) => e.type === 'agent_progress' ? <p key={i} className="text-xs text-[#94a3b8]">{e.text}</p> : null)}
        </div>
      )}
    </div>
  );
}
