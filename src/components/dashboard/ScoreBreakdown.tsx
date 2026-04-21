"use client";

import { Popover } from "@/components/ui/Popover";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import {
  COMPONENT_DESCRIPTIONS,
  COMPONENT_LABELS,
  WEIGHTS,
} from "@/lib/scoring";
import type { OpportunityScore, ScoreComponents } from "@/lib/types";

const ORDER: Array<keyof ScoreComponents> = [
  "volume",
  "testingGap",
  "recency",
  "expansion",
  "access",
];

export function ScoreBreakdown({
  score,
  providerName,
}: {
  score: OpportunityScore;
  providerName: string;
}) {
  return (
    <Popover
      align="left"
      width={360}
      trigger={<ScoreBadge score={score.total} />}
    >
      <div>
        <div
          className="caption uppercase tracking-wider mb-1"
          style={{ color: "var(--text-muted)" }}
        >
          Opportunity score
        </div>
        <div
          style={{
            fontWeight: 600,
            fontSize: 15,
            color: "var(--text-primary)",
            marginBottom: 12,
          }}
        >
          {providerName}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {ORDER.map((key) => {
            const raw = score.components[key];
            const weighted = score.weighted[key];
            const weightPct = Math.round(WEIGHTS[key] * 100);
            const barPct = Math.max(0, Math.min(100, raw));
            return (
              <div key={key}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    fontSize: 12,
                    marginBottom: 4,
                  }}
                >
                  <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {COMPONENT_LABELS[key]}
                    <span
                      className="font-mono"
                      style={{ color: "var(--text-muted)", marginLeft: 6 }}
                    >
                      {weightPct}%
                    </span>
                  </span>
                  <span
                    className="font-mono"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {Math.round(raw)}
                    <span
                      style={{ color: "var(--text-muted)", margin: "0 4px" }}
                    >
                      ·
                    </span>
                    +{weighted.toFixed(1)}
                  </span>
                </div>
                <div
                  style={{
                    height: 6,
                    borderRadius: 3,
                    background: "var(--bg-surface-light)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${barPct}%`,
                      height: "100%",
                      background: "var(--accent-primary)",
                      transition: "width 240ms ease",
                    }}
                  />
                </div>
                <div
                  className="caption"
                  style={{ color: "var(--text-muted)", marginTop: 2 }}
                >
                  {COMPONENT_DESCRIPTIONS[key]}
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 14,
            paddingTop: 12,
            borderTop: "1px solid var(--border-default)",
            display: "flex",
            justifyContent: "space-between",
            fontSize: 13,
          }}
        >
          <span style={{ color: "var(--text-secondary)" }}>Total</span>
          <span
            className="font-mono"
            style={{ color: "var(--text-primary)", fontWeight: 700 }}
          >
            {score.total}
          </span>
        </div>
      </div>
    </Popover>
  );
}
