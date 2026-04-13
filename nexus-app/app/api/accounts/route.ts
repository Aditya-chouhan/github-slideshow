import { getAccounts } from '@/lib/agents/accountMemory';

export const runtime = 'nodejs';

export async function GET() {
  const accounts = getAccounts();
  return Response.json({ accounts });
}
