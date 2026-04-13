'use client';

import type { AgentEvent } from '@/lib/types';

interface Props {
  events: AgentEvent[];
  running: boolean;
}

interface AgentState {
  name: string;
  emoji: string;
  description: string;
  status: 'waiting' | 'running' | 'done';
  progress: string[];
  summary?: string;
}

function buildAgentStates(events: AgentEvent[]): AgentState[] {
  const states: Record<string, AgentState> = {};
  for (const event of events) {
    if (event.type === 'agent_start') {
      states[event.agent] = { name: event.agent, emoji: event.emoji, description: event.description, status: 'running', progress: [] };
    } else if (event.type === 'agent_progress') {
      if (states[event.agent]) {
        states[event.agent].progress.push(event.text);
        if (states[event.agent].progress.length > 4) states[event.agent].progress = states[event.agent].progress.slice(-4);
      }
    } else if (event.type === 'agent_complete') {
      if (states[event.agent]) { states[event.agent].status = 'done'; states[event.agent].summary = event.summary; }
    }
  }
  return Object.values(states);
}

export default function AgentPipeline({ events, running }: Props) {
  const agents = buildAgentStates(events);
  if (agents.length === 0 && !running) return null;
  return (
    <div className="space-y-2">
      {agents.map(agent => (
        <div key={agent.name} className={`rounded-xl border transition-all duration-300 ${
          agent.status === 'running' ? 'border-indigo-500/50 bg-indigo-950/30'
          : agent.status === 'done' ? 'border-emerald-500/30 bg-emerald-950/20'
          : 'border-[#1e293b] bg-[#111827]'
        }`}>
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="text-xl">{agent.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-sm">{agent.name}</span>
                {agent.status === 'running' && (
                  <span className="inline-flex items-center gap-1 text-xs text-indigo-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />Running
                  </span>
                )}
                {agent.status === 'done' && <span className="text-xs text-emerald-400">✓ Done</span>}
              </div>
              <p className="text-xs text-[#94a3b8]">{agent.description}</p>
            </div>
            {agent.status === 'done' && agent.summary && (
              <span className="text-xs text-emerald-400 font-medium shrink-0">{agent.summary}</span>
            )}
          </div>
          {agent.status === 'running' && agent.progress.length > 0 && (
            <div className="px-4 pb-3">
              {agent.progress.slice(-2).map((text, i) => (
                <p key={i} className="text-xs text-[#94a3b8] truncate">{text}</p>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
