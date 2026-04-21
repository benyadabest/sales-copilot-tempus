import type { InteractionEntry } from "./types";

/**
 * Simple keyword-based heuristic to pull an objection/concern sentence out of
 * CRM notes. Placeholder for a future classifier. Returns the most recent
 * matching sentence (trimmed) or null.
 */
const OBJECTION_KEYWORDS = [
  "concern",
  "concerned",
  "objection",
  "skeptical",
  "worried",
  "worries",
  "blocker",
  "can't risk",
  "doesn't see",
  "doesn't want",
  "hesitant",
  "reluctant",
  "needs to see",
  "main concern",
  "cost justification",
  "sample volume",
];

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function detectObjection(entries: InteractionEntry[]): string | null {
  for (const e of entries) {
    const sentences = splitSentences(e.notes);
    for (const s of sentences) {
      const lower = s.toLowerCase();
      if (OBJECTION_KEYWORDS.some((k) => lower.includes(k))) {
        return s;
      }
    }
  }
  return null;
}

/**
 * Return up to N distinct objection-like sentences for a physician — used in
 * coaching context panels.
 */
export function topObjections(
  entries: InteractionEntry[],
  limit = 3,
): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const e of entries) {
    const sentences = splitSentences(e.notes);
    for (const s of sentences) {
      const lower = s.toLowerCase();
      if (
        OBJECTION_KEYWORDS.some((k) => lower.includes(k)) &&
        !seen.has(lower)
      ) {
        seen.add(lower);
        out.push(s);
        if (out.length >= limit) return out;
      }
    }
  }
  return out;
}
