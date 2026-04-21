"use client";

import { useMemo, useState } from "react";
import type {
  OpportunityScore,
  Provider,
  ScoreComponents,
} from "@/lib/types";
import { DEFAULT_WEIGHTS, applyWeights } from "@/lib/scoring";
import { FormulaBar } from "./FormulaBar";
import { ProviderTable } from "./ProviderTable";

export interface DashboardRow {
  provider: Provider;
  components: ScoreComponents;
}

export function RankedDashboard({ rows }: { rows: DashboardRow[] }) {
  const [weights, setWeights] = useState<ScoreComponents>({
    ...DEFAULT_WEIGHTS,
  });

  const ranked = useMemo(() => {
    const scored = rows.map(({ provider, components }) => {
      const { total, weighted } = applyWeights(components, weights);
      const score: OpportunityScore = {
        total: Math.round(total),
        components,
        weighted,
      };
      return { provider, score };
    });
    scored.sort((a, b) => b.score.total - a.score.total);
    return scored;
  }, [rows, weights]);

  return (
    <>
      <FormulaBar
        weights={weights}
        onChange={(k, v) => setWeights((w) => ({ ...w, [k]: v }))}
        onReset={() => setWeights({ ...DEFAULT_WEIGHTS })}
      />
      <ProviderTable ranked={ranked} />
    </>
  );
}
