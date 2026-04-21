import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import type {
  CrmNotes,
  InteractionEntry,
  MarketIntelligence,
  PhysicianInteractions,
  Provider,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "src", "data");

const MARKET_PATH = path.join(DATA_DIR, "market-intelligence.json");
const CRM_PATH = path.join(DATA_DIR, "crm-notes.json");
const PRODUCT_KB_PATH = path.join(DATA_DIR, "product-knowledge.md");

async function readJson<T>(file: string): Promise<T> {
  const raw = await fs.readFile(file, "utf8");
  return JSON.parse(raw) as T;
}

export async function getMarketIntelligence(): Promise<MarketIntelligence> {
  return readJson<MarketIntelligence>(MARKET_PATH);
}

export async function getProviders(): Promise<Provider[]> {
  const data = await getMarketIntelligence();
  return data.providers;
}

export async function getProviderById(id: string): Promise<Provider | null> {
  const providers = await getProviders();
  return providers.find((p) => p.id === id) ?? null;
}

export async function getCrmNotes(): Promise<CrmNotes> {
  return readJson<CrmNotes>(CRM_PATH);
}

export async function getInteractionsFor(
  physicianId: string,
): Promise<InteractionEntry[]> {
  const crm = await getCrmNotes();
  const rec = crm.interactions.find((i) => i.physician_id === physicianId);
  if (!rec) return [];
  // Chronological, newest first
  return [...rec.entries].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getAllInteractions(): Promise<PhysicianInteractions[]> {
  const crm = await getCrmNotes();
  return crm.interactions;
}

export async function loadProductKnowledge(): Promise<string> {
  return fs.readFile(PRODUCT_KB_PATH, "utf8");
}

/**
 * Atomic append: read full crm-notes.json, add or merge a new entry,
 * write to a temp file, then rename. Prevents partial writes on crashes.
 */
export async function appendCrmEntry(
  physicianId: string,
  entry: InteractionEntry,
): Promise<void> {
  const crm = await getCrmNotes();
  const existing = crm.interactions.find((i) => i.physician_id === physicianId);
  if (existing) {
    existing.entries.unshift(entry);
  } else {
    crm.interactions.push({
      physician_id: physicianId,
      entries: [entry],
    });
  }
  const tmp = `${CRM_PATH}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(crm, null, 2) + "\n", "utf8");
  await fs.rename(tmp, CRM_PATH);
}
