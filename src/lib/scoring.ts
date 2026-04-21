import type {
  OpportunityScore,
  Provider,
  ScoreComponents,
} from "./types";

/**
 * Total Tempus tests available for the expansion-potential calculation.
 * Matches the count of distinct offerings in src/data/product-knowledge.md
 * top-level list (xT CDx, xR, xF, xF+, CancerNext, CancerNext-Expanded,
 * BRCAplus, +RNAinsight, xM, xM NeXT Personal Dx, HRD, PurIST, TO, p-MSI = 14).
 * Hardcoded for simplicity; would be derived from KB in production.
 */
export const TOTAL_TEMPUS_TESTS = 14;

export const DEFAULT_WEIGHTS: ScoreComponents = {
  volume: 0.35,
  testingGap: 0.25,
  recency: 0.15,
  expansion: 0.15,
  access: 0.1,
};

/** Back-compat alias. Prefer `DEFAULT_WEIGHTS`. */
export const WEIGHTS = DEFAULT_WEIGHTS;

export const COMPONENT_LABELS: Record<keyof ScoreComponents, string> = {
  volume: "Volume Signal",
  testingGap: "Testing Gap",
  recency: "Engagement Recency",
  expansion: "Expansion Potential",
  access: "Decision-Maker Access",
};

export const COMPONENT_DESCRIPTIONS: Record<keyof ScoreComponents, string> = {
  volume: "Raw patient population size vs the largest account in territory.",
  testingGap: "Untapped potential — low NGS adoption means more room to grow.",
  recency: "Warm vs cold — how recently this account has been engaged.",
  expansion: "Upsell opportunity — tests available but not yet adopted.",
  access: "Whether any physician in the account can move the deal forward.",
};

function recencyDecay(daysAgo: number): number {
  if (daysAgo < 14) return 100;
  if (daysAgo < 30) return 75;
  if (daysAgo < 60) return 50;
  if (daysAgo < 90) return 25;
  return 0;
}

export function maxVolume(providers: Provider[]): number {
  return providers.reduce(
    (max, p) => (p.annual_oncology_volume > max ? p.annual_oncology_volume : max),
    1,
  );
}

/**
 * Compute raw 0–100 component scores for a provider, independent of weighting.
 * Extracted so the UI can re-apply weights live without recomputing inputs.
 */
export function computeComponents(
  provider: Provider,
  maxVol: number,
): ScoreComponents {
  // Volume
  const volume = Math.min(100, (provider.annual_oncology_volume / maxVol) * 100);

  // Testing Gap — average (1 - ngs_ordering_rate) across physicians, ignoring
  // non-prescribing roles (e.g., pathology). If no prescribing docs, fall back to 0.
  const prescribing = provider.physicians.filter(
    (d) => d.estimated_eligible_patients_per_month > 0,
  );
  const avgOrderingRate =
    prescribing.length === 0
      ? 0
      : prescribing.reduce((s, d) => s + d.ngs_ordering_rate, 0) /
        prescribing.length;
  const testingGap = (1 - avgOrderingRate) * 100;

  // Engagement Recency
  const recency = recencyDecay(provider.last_contact_days_ago);

  // Expansion Potential
  const currentCount = provider.current_tempus_testing
    ? provider.current_tests?.length ?? 0
    : 0;
  const expansion = provider.current_tempus_testing
    ? Math.max(
        0,
        ((TOTAL_TEMPUS_TESTS - currentCount) / TOTAL_TEMPUS_TESTS) * 100,
      )
    : 100;

  // Decision Maker Access
  const access = provider.physicians.some((d) => d.decision_maker) ? 100 : 50;

  return { volume, testingGap, recency, expansion, access };
}

/**
 * Apply a weight vector to raw components. Weights are auto-normalized by
 * their sum so totals stay on a 0–100 scale regardless of what the user picks.
 * If all weights are 0, falls back to equal weighting.
 */
export function applyWeights(
  components: ScoreComponents,
  weights: ScoreComponents,
): { total: number; weighted: ScoreComponents } {
  const keys: Array<keyof ScoreComponents> = [
    "volume",
    "testingGap",
    "recency",
    "expansion",
    "access",
  ];
  const sum = keys.reduce((s, k) => s + weights[k], 0);
  const norm = sum > 0 ? sum : keys.length;
  const effective = sum > 0 ? weights : { volume: 1, testingGap: 1, recency: 1, expansion: 1, access: 1 };
  const weighted = {
    volume: (components.volume * effective.volume) / norm,
    testingGap: (components.testingGap * effective.testingGap) / norm,
    recency: (components.recency * effective.recency) / norm,
    expansion: (components.expansion * effective.expansion) / norm,
    access: (components.access * effective.access) / norm,
  };
  const total = keys.reduce((s, k) => s + weighted[k], 0);
  return { total, weighted };
}

export function scoreProvider(
  provider: Provider,
  maxVol: number,
  weights: ScoreComponents = DEFAULT_WEIGHTS,
): OpportunityScore {
  const components = computeComponents(provider, maxVol);
  const { total, weighted } = applyWeights(components, weights);
  return { total: Math.round(total), components, weighted };
}

export function rankProviders(
  providers: Provider[],
  weights: ScoreComponents = DEFAULT_WEIGHTS,
): Array<{ provider: Provider; score: OpportunityScore }> {
  const maxVol = maxVolume(providers);
  const scored = providers.map((p) => ({
    provider: p,
    score: scoreProvider(p, maxVol, weights),
  }));
  scored.sort((a, b) => b.score.total - a.score.total);
  return scored;
}
