// ─────────────────────────────────────────────────────────────────────────────
// NEXUS AI — Master Brain Orchestrator
//
// 3-pass pattern:
//   1. [ROUTE] message → Brain agent returns JSON routing plan
//   2. Execute routed agents in parallel (or series)
//   3. [SYNTHESIZE] all results → Brain agent returns executive brief
// ─────────────────────────────────────────────────────────────────────────────

import { runManagedAgent } from '../managedAgents';
import { AGENT_IDS } from '../agentIds';
import { AGENT_REGISTRY } from './agents';
import { MODELS } from '../anthropic';
import type {
  BrainResult,
  BrainRoutingPlan,
  BrainAgentResult,
  AgentEvent,
} from '../types';
import type { AgentKey } from '../agentIds';

// ── System prompt for the Brain (used in fallback mode) ───────────────────────

const BRAIN_SYSTEM = AGENT_REGISTRY.MASTER_BRAIN?.system ?? '';

// ── Helpers ───────────────────────────────────────────────────────────────────

function emit(encoder: TextEncoder, controller: ReadableStreamDefaultController, event: AgentEvent) {
  controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
}

function parseRoutingPlan(raw: string): BrainRoutingPlan | null {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]) as BrainRoutingPlan;
  } catch {}
  return null;
}

// ── Main export ───────────────────────────────────────────────────────────────

export function runBrainOrchestrator(userMessage: string): ReadableStream {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      const brainResult: BrainResult = {
        userMessage,
        plan: { agents: [], rationale: '', parallel: true },
        agentResults: [],
        synthesis: '',
        completedAt: '',
      };

      try {
        // ── Pass 1: Route ────────────────────────────────────────────────────
        emit(encoder, controller, {
          type: 'agent_start',
          agent: 'Master Brain',
          description: 'Analyzing your question and routing to the right agents…',
          emoji: '🧠',
        });

        const routeRaw = await runManagedAgent(
          AGENT_IDS.MASTER_BRAIN,
          `[ROUTE] ${userMessage}`,
          { model: MODELS.OPUS, system: BRAIN_SYSTEM, tools: [] },
          text => emit(encoder, controller, { type: 'agent_progress', agent: 'Master Brain', text })
        );

        const plan = parseRoutingPlan(routeRaw);
        if (!plan || plan.agents.length === 0) {
          // Brain couldn't route — give a direct answer
          emit(encoder, controller, {
            type: 'brain_synthesis',
            text: routeRaw,
          });
          brainResult.synthesis = routeRaw;
          brainResult.plan = { agents: [], rationale: 'Direct answer', parallel: false };
          brainResult.completedAt = new Date().toISOString();
          emit(encoder, controller, { type: 'brain_complete', result: brainResult });
          return;
        }

        brainResult.plan = plan;
        emit(encoder, controller, { type: 'brain_routing', plan });

        // ── Pass 2: Execute routed agents ────────────────────────────────────
        const executeAgent = async (call: { agentKey: string; agentName: string; input: string }): Promise<BrainAgentResult> => {
          const key = call.agentKey as AgentKey;
          const agentDef = AGENT_REGISTRY[key];

          emit(encoder, controller, { type: 'brain_agent_start', agentKey: key, agentName: call.agentName });

          if (!agentDef) {
            return { agentKey: key, agentName: call.agentName, output: '', success: false, error: 'Agent not found' };
          }

          try {
            const output = await runManagedAgent(
              AGENT_IDS[key] ?? '',
              call.input,
              { model: agentDef.model, system: agentDef.system, tools: agentDef.tools },
              text => emit(encoder, controller, { type: 'agent_progress', agent: call.agentName, text }),
              (tool, query) => emit(encoder, controller, { type: 'agent_tool_call', agent: call.agentName, tool, query })
            );

            emit(encoder, controller, { type: 'brain_agent_done', agentKey: key, agentName: call.agentName, success: true });
            return { agentKey: key, agentName: call.agentName, output, success: true };
          } catch (err) {
            const error = err instanceof Error ? err.message : String(err);
            emit(encoder, controller, { type: 'brain_agent_done', agentKey: key, agentName: call.agentName, success: false });
            return { agentKey: key, agentName: call.agentName, output: '', success: false, error };
          }
        };

        let agentResults: BrainAgentResult[];
        if (plan.parallel) {
          agentResults = await Promise.all(plan.agents.map(executeAgent));
        } else {
          agentResults = [];
          for (const call of plan.agents) {
            agentResults.push(await executeAgent(call));
          }
        }

        brainResult.agentResults = agentResults;

        // ── Pass 3: Synthesize ───────────────────────────────────────────────
        emit(encoder, controller, {
          type: 'agent_start',
          agent: 'Master Brain',
          description: 'Synthesizing all intelligence into an executive brief…',
          emoji: '🧠',
        });

        const synthesisInput = [
          `[SYNTHESIZE]`,
          `Original question: ${userMessage}`,
          ``,
          ...agentResults.map(r =>
            `## ${r.agentName}\n${r.success ? r.output : `ERROR: ${r.error}`}`
          ),
        ].join('\n');

        const synthesis = await runManagedAgent(
          AGENT_IDS.MASTER_BRAIN,
          synthesisInput,
          { model: MODELS.OPUS, system: BRAIN_SYSTEM, tools: [] },
          text => emit(encoder, controller, { type: 'brain_synthesis', text })
        );

        brainResult.synthesis = synthesis;
        brainResult.completedAt = new Date().toISOString();
        emit(encoder, controller, { type: 'brain_complete', result: brainResult });

      } catch (err) {
        emit(encoder, controller, { type: 'error', message: err instanceof Error ? err.message : String(err) });
      } finally {
        controller.close();
      }
    },
  });
}
