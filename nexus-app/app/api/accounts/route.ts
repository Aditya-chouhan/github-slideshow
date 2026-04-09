import { NextRequest, NextResponse } from "next/server";
import { getAllAccounts, updateAccountStatus } from "@/lib/memory";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json({ accounts: getAllAccounts() });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, status, notes } = (await req.json()) as { id: string; status: string; notes?: string };
    updateAccountStatus(id, status as never, notes);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}