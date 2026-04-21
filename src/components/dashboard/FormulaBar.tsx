"use client";

import type { ScoreComponents } from "@/lib/types";
import { COMPONENT_LABELS, DEFAULT_WEIGHTS } from "@/lib/scoring";

const ORDER: Array<keyof ScoreComponents> = [
  "volume",
  "testingGap",
  "recency",
  "expansion",
  "access",
];

export function FormulaBar({
  weights,
  onChange,
  onReset,
}: {
  weights: ScoreComponents;
  onChange: (key: keyof ScoreComponents, value: number) => void;
  onReset: () => void;
}) {
  const sum = ORDER.reduce((s, k) => s + weights[k], 0);
  const pct = (k: keyof ScoreComponents) =>
    sum > 0 ? Math.round((weights[k] / sum) * 100) : 20;
  const isDefault = ORDER.every(
    (k) => Math.abs(weights[k] - DEFAULT_WEIGHTS[k]) < 1e-6,
  );

  return (
    <div
      data-testid="formula-bar"
      style={{
        background: "var(--bg-primary)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-card)",
        padding: "16px 20px",
        marginBottom: 16,
        boxShadow: "var(--shadow-level-1)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div
          className="tag-label"
          style={{ color: "var(--text-muted)" }}
        >
          Scoring formula · drag to re-rank
        </div>
        <button
          type="button"
          data-testid="formula-reset"
          onClick={onReset}
          disabled={isDefault}
          style={{
            background: "transparent",
            border: "none",
            padding: 0,
            color: isDefault
              ? "var(--text-muted)"
              : "var(--accent-primary)",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            cursor: isDefault ? "default" : "pointer",
            fontFamily: "inherit",
          }}
        >
          Reset
        </button>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 20,
        }}
      >
        {ORDER.map((k) => (
          <div key={k}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: "var(--text-primary)",
                  fontWeight: 500,
                }}
              >
                {COMPONENT_LABELS[k]}
              </span>
              <span
                className="font-mono"
                style={{
                  fontSize: 12,
                  color: "var(--accent-primary)",
                  fontWeight: 600,
                }}
                data-testid={`formula-pct-${k}`}
              >
                {pct(k)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={Math.round(weights[k] * 100)}
              data-testid={`formula-slider-${k}`}
              onChange={(e) => onChange(k, Number(e.target.value) / 100)}
              style={{
                width: "100%",
                accentColor: "var(--accent-primary)",
                cursor: "pointer",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
