import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const GOTCHAS_PATH = resolve(
  __dirname,
  "../../../sample-data/tarsius-gotchas.json"
);

// ---------------------------------------------------------------------------
// Shape types
// ---------------------------------------------------------------------------

interface AutoLearning {
  discoveredFrom: {
    type: string;
    description: string;
  };
  appliesTo: {
    categories: string[];
  };
}

export interface Gotcha {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  triggerCount: number;
  active: boolean;
  addedAt: string;
  addedBy: string;
  relatedRules: string[];
  autoLearning: AutoLearning;
}

interface GotchasDocument {
  version: string;
  gotchas: Gotcha[];
  summary: {
    totalGotchas: number;
    active: number;
    byCategory: Record<string, number>;
    bySeverity: Record<string, number>;
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function readGotchas(): Promise<GotchasDocument> {
  const raw = await readFile(GOTCHAS_PATH, "utf-8");
  return JSON.parse(raw) as GotchasDocument;
}

async function writeGotchas(doc: GotchasDocument): Promise<void> {
  await writeFile(GOTCHAS_PATH, JSON.stringify(doc, null, 2) + "\n", "utf-8");
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Return all active gotchas that match either:
 *   - `relatedRules` contains `ruleId`, or
 *   - `autoLearning.appliesTo.categories` contains `category`
 *
 * Each matched gotcha has its `triggerCount` incremented and is persisted.
 */
export async function checkGotchas(
  ruleId?: string,
  category?: string
): Promise<Gotcha[]> {
  const doc = await readGotchas();

  const matches = doc.gotchas.filter((g) => {
    if (!g.active) return false;
    if (ruleId && g.relatedRules.includes(ruleId)) return true;
    if (category && g.autoLearning.appliesTo.categories.includes(category))
      return true;
    return false;
  });

  if (matches.length > 0) {
    for (const match of matches) {
      match.triggerCount += 1;
    }
    await writeGotchas(doc);
  }

  return matches;
}
