import type { AccountRecord, SalesResult } from '../types';

// In-memory store — persists within server process
const store = new Map<string, AccountRecord>();

export function saveAccount(result: SalesResult): AccountRecord {
  const record: AccountRecord = {
    id: result.accountId,
    company: result.company,
    createdAt: result.completedAt,
    icpScore: result.icp.score,
    recommendation: result.icp.recommendation,
    signals: result.whyNow.signals,
    contacts: result.contacts.contacts,
    outreach: result.outreach,
  };
  store.set(record.id, record);
  return record;
}

export function getAccounts(): AccountRecord[] {
  return Array.from(store.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getAccount(id: string): AccountRecord | undefined {
  return store.get(id);
}

export function getAccountByCompany(company: string): AccountRecord | undefined {
  const lower = company.toLowerCase();
  for (const account of store.values()) {
    if (account.company.toLowerCase().includes(lower)) return account;
  }
  return undefined;
}
