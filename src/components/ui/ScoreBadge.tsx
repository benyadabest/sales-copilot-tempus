import * as React from "react";

export interface ScoreBadgeProps {
  score: number;
  size?: number;
  priority?: "high" | "medium" | "low";
}

export function ScoreBadge({ score, size = 48, priority }: ScoreBadgeProps) {
  const tone =
    priority ?? (score >= 70 ? "high" : score >= 55 ? "medium" : "low");

  // Single-color solid blue for high/medium, subtle gray for low — no gradients,
  // no warm colors. Brand is restrained.
  const background: Record<string, string> = {
    high: "var(--accent-primary)",
    medium: "var(--accent-primary)",
    low: "var(--bg-surface-light)",
  };
  const textColor = tone === "low" ? "var(--text-primary)" : "#fff";
  const border =
    tone === "low" ? "1px solid var(--border-default)" : "none";

  return (
    <div
      aria-label={`Opportunity score ${score}`}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: background[tone],
        color: textColor,
        border,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-mono-stack)",
        fontWeight: 600,
        fontSize: Math.round(size * 0.38),
        letterSpacing: "-0.5px",
        boxShadow:
          tone === "high" ? "var(--shadow-glow)" : "var(--shadow-level-1)",
        transition: "box-shadow 200ms ease",
      }}
    >
      {score}
    </div>
  );
}
