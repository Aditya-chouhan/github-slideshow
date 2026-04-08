import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import type { AccountRecord } from "./types";

const DATA_DIR = join(process.cwd(), ".nexus-data");
const ACCOUNTS_FILE = join(DATA_DIR, "accounts.json");

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

function readAccounts(): AccountRecord[] {
  ensureDataDir();
  if (!existsSync(ACCOUNTS_FILE)) return [];
  try {
    return JSON.parse(readFileSync(ACCOUNTS_FILE, "utf-8")) as AccountRecord[];
  } catch {
    return [];
  }
}

function writeAccounts(accounts: AccountRecord[]): void {
  ensureDataDir();
  writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2), "utf-8");
}

export function saveAccount(record: AccountRecord): void {
  const accounts = readAccounts();
  const existing = accounts.findIndex((a) => a.id === record.id);
  if (existing >= 0) {
    accounts[existing] = record;
  } else {
    accounts.unshift(record);
  }
  writeAccounts(accounts);
}

export function getAllAccounts(): AccountRecord[] {
  return readAccounts();
}

export function getAccount(id: string): AccountRecord | undefined {
  return readAccounts().find((a) => a.id === id);
}

export function updateAccountStatus(
  id: string,
  status: AccountRecord["status"],
  notes?: string
): void {
  const accounts = readAccounts();
  const acc = accounts.find((a) => a.id === id);
  if (acc) {
    acc.status = status;
    acc.updatedAt = new Date().toISOString();
    if (notes) acc.notes = notes;
    writeAccounts(accounts);
  }
}

export function isDuplicate(company: string, contactName: string): AccountRecord | undefined {
  return readAccounts().find(
    (a) =>
      a.input.company.toLowerCase() === company.toLowerCase() &&
      a.input.contactName.toLowerCase() === contactName.toLowerCase()
  );
}