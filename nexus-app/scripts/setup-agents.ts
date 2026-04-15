#!/usr/bin/env tsx
// ─────────────────────────────────────────────────────────────────────────────
// NEXUS AI — Managed Agent Bootstrap Script
//
// Run once to create all 19 agents in Claude Console.
// Idempotent: checks existing agents before creating.
//
// Usage:
//   ANTHROPIC_API_KEY=sk-ant-... npx tsx scripts/setup-agents.ts
//
// After running, copy the printed env vars into your .env.local
// ─────────────────────────────────────────────────────────────────────────────

import Anthropic from '@anthropic-ai/sdk';
import { ALL_AGENTS } from '../lib/brain/agents';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// The SDK may not have typed Managed Agents yet — use raw HTTP
const BASE = 'https://api.anthropic.com/v1';
const HEADERS = {
  'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
  'anthropic-version': '2023-06-01',
  'anthropic-beta': 'managed-agents-2026-04-01',
  'Content-Type': 'application/json',
};

interface ManagedAgent {
  id: string;
  name: string;
  display_name?: string;
}

async function listAgents(): Promise<ManagedAgent[]> {
  const res = await fetch(`${BASE}/agents`, { headers: HEADERS });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`List agents failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  return data.data ?? [];
}

async function createAgent(params: {
  name: string;
  description: string;
  system: string;
  model: string;
}): Promise<ManagedAgent> {
  const body = {
    name: params.name,
    description: params.description,
    system: params.system,
    model: params.model,
  };

  const res = await fetch(`${BASE}/agents`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Create agent failed: ${res.status} ${text}`);
  }
  return res.json();
}

async function main() {
  console.log('🧠 NEXUS AI — Agent Bootstrap\n');

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY is not set');
    process.exit(1);
  }

  // Load existing agents to avoid duplicates
  let existing: ManagedAgent[] = [];
  try {
    existing = await listAgents();
    console.log(`Found ${existing.length} existing agents in Console\n`);
  } catch (err) {
    console.warn('⚠️  Could not list existing agents (API may not support this yet):', err);
    console.warn('   Proceeding to create all agents anyway...\n');
  }

  const existingNames = new Set(existing.map(a => a.name));
  const envLines: string[] = [];

  for (const agentDef of ALL_AGENTS) {
    const agentName = `nexus-${agentDef.key.toLowerCase().replace(/_/g, '-')}`;

    if (existingNames.has(agentName)) {
      const found = existing.find(a => a.name === agentName)!;
      console.log(`  ⏭️  ${agentDef.emoji} ${agentDef.name} — already exists (${found.id})`);
      envLines.push(`NEXUS_AGENT_${agentDef.key}=${found.id}`);
      continue;
    }

    try {
      const agent = await createAgent({
        name: agentName,
        description: agentDef.description,
        system: agentDef.system,
        model: agentDef.model,
      });

      console.log(`  ✅ ${agentDef.emoji} ${agentDef.name} — created (${agent.id})`);
      envLines.push(`NEXUS_AGENT_${agentDef.key}=${agent.id}`);

      // Rate limit: 2 agents per second
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.error(`  ❌ ${agentDef.name} — FAILED:`, err);
      envLines.push(`NEXUS_AGENT_${agentDef.key}=  # FAILED — create manually`);
    }
  }

  console.log('\n─────────────────────────────────────────────────────────────');
  console.log('Add these to your .env.local:\n');
  console.log('MANAGED_AGENTS_ENABLED=true');
  for (const line of envLines) {
    console.log(line);
  }
  console.log('\n✅ Setup complete!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
