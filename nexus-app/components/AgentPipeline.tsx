"use client";

import { useEffect, useRef, useState } from "react";
import type { AgentEvent, AgentName, ProspectInput } from "@/lib/types";
import clsx from "clsx";

const AGENT_META: Record<AgentName, { label: string; icon: string; color: string }> = {
  "why-now": { label: "Why Now Engine", icon: "⚡", color: "text-amber-400" },
  "contact-research": { label: "Contact Research", icon: "🔍", color: "text-indigo-400" },
  "icp-scorer": { label: "ICP Scorer", icon: "🎯", color: "text-cyan-400" },
  "outreach-writer": { label: "Outreach Writer", icon: "✍️", color: "text-purple-400" },
  memory: { label: "Memory Engine", icon: "🧠", color: "text-green-400" },
};

interface Props {
  input: ProspectInput;
  onComplete: (record: import("@/lib/types").AccountRecord) => void;
  onError: (msg: string) => void;
}

interface AgentStatus {
  name: AgentName;
  state: "waiting" | "running" | "done" | "error";
  messages: string[];
}

export function AgentPipeline({ input, onComplete, onError }: Props) {
  const [agents, setAgents] = useState<AgentStatus[]>(
    (Object.keys(AGENT_META) as AgentName[]).map((name) => ({ name, state: "waiting", messages: [] }))
  );
  const [logs, setLogs] = useState<AgentEvent[]>([]);
  const [running, setRunning] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const finalRecordRef = useRef<import("@/lib/types").AccountRecord | null>(null);

  useEffect(() => { logsEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const res = await fetch("/api/research", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
        if (!res.ok || !res.body) { onError("Failed to connect to research pipeline"); return; }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (!cancelled) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (!raw) continue;
            let event: AgentEvent;
            try { event = JSON.parse(raw) as AgentEvent; } catch { continue; }

            setLogs((prev) => [...prev, event]);
            setAgents((prev) => prev.map((a) => {
              if (a.name !== event.agent) return a;
              return {
                ...a,
                state: event.type === "agent_start" ? "running" : event.type === "agent_complete" ? "done" : event.type === "agent_error" ? "error" : a.state,
                messages: [...a.messages, event.message],
              };
            }));

            if (event.type === "pipeline_complete" && event.data) {
              finalRecordRef.current = { id: "streamed", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), input, intelligence: event.data as never, outreach: (event.data as { outreach: import("@/lib/types").OutreachVariants }).outreach, status: "researched", notes: "" };
            }
            if (event.type === "pipeline_complete" || event.type === "pipeline_error") {
              setRunning(false);
              if (event.type === "pipeline_complete" && finalRecordRef.current) onComplete(finalRecordRef.current);
              if (event.type === "pipeline_error") onError(event.message);
            }
          }
        }
      } catch (err) {
        if (!cancelled) onError((err as Error).message);
        setRunning(false);
      }
    }
    run();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-5 gap-2">
        {agents.map((agent) => {
          const meta = AGENT_META[agent.name];
          return (
            <div key={agent.name} className={clsx("rounded-lg border p-3 text-center transition-all duration-300",
              agent.state === "waiting" && "border-nx-border bg-nx-surface opacity-50",
              agent.state === "running" && "border-indigo-500/50 bg-indigo-500/10 shadow-lg",
              agent.state === "done" && "border-green-500/40 bg-green-500/10",
              agent.state === "error" && "border-red-500/40 bg-red-500/10")}>
              <div className="text-xl mb-1">{meta.icon}</div>
              <div className={clsx("text-xs font-semibold", meta.color)}>{meta.label}</div>
              <div className="mt-1 flex justify-center">
                {agent.state === "waiting" && <span className="w-2 h-2 rounded-full bg-nx-border" />}
                {agent.state === "running" && <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse-slow" />}
                {agent.state === "done" && <span className="text-green-400 text-xs">✓</span>}
                {agent.state === "error" && <span className="text-red-400 text-xs">✗</span>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="rounded-lg border border-nx-border bg-nx-surface overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-nx-border">
          <span className="text-xs font-semibold text-nx-muted uppercase tracking-widest">Live Agent Feed</span>
          {running ? (
            <span className="flex items-center gap-2 text-xs text-indigo-400"><span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />Running</span>
          ) : (
            <span className="flex items-center gap-2 text-xs text-green-400"><span className="w-2 h-2 rounded-full bg-green-400" />Complete</span>
          )}
        </div>
        <div className="p-3 space-y-1.5 max-h-56 overflow-y-auto">
          {logs.length === 0 && <p className="text-xs text-nx-muted text-center py-4">Initialising agents...</p>}
          {logs.map((event, i) => {
            const meta = AGENT_META[event.agent];
            return (
              <div key={i} className="flex items-start gap-2 text-xs">
                <span className={clsx("flex-shrink-0 font-semibold w-28 truncate", meta.color)}>{meta.icon} {meta.label}</span>
                <span className={clsx("flex-1", event.type === "agent_complete" && "text-green-300", event.type === "agent_error" && "text-red-300", event.type === "agent_start" && "text-white", event.type === "agent_progress" && "text-nx-muted", event.type === "pipeline_complete" && "text-green-400 font-semibold")}>{event.message}</span>
              </div>
            );
          })}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
}