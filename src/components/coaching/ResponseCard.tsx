import type { CoachingExchange } from "@/lib/types";

export function ResponseCard({
  exchange,
  streaming,
  onDark = false,
}: {
  exchange: CoachingExchange;
  streaming?: boolean;
  onDark?: boolean;
}) {
  const background = onDark
    ? "var(--bg-surface-dark)"
    : "var(--bg-surface-light)";
  const border = onDark
    ? "1px solid var(--border-dark)"
    : "1px solid var(--border-default)";
  const textColor = onDark ? "var(--text-on-dark)" : "var(--text-primary)";
  const objectionColor = onDark
    ? "var(--text-muted-dark)"
    : "var(--text-secondary)";
  const labelColor = onDark ? "var(--text-muted-dark)" : "var(--text-muted)";
  const glow = onDark ? "box-shadow: 0 0 20px var(--accent-glow);" : "";

  return (
    <div
      data-testid="response-card"
      className="slide-in-right"
      style={{
        background,
        border,
        borderLeft: "3px solid var(--accent-primary)",
        borderRadius: 8,
        padding: "16px 20px",
        boxShadow: onDark ? "0 0 20px var(--accent-glow)" : "var(--shadow-level-1)",
        ...(glow ? {} : {}),
      }}
    >
      <div className="tag-label" style={{ color: labelColor, marginBottom: 8 }}>
        Objection
      </div>
      <div
        style={{
          fontSize: 13,
          color: objectionColor,
          fontStyle: "italic",
          marginBottom: 14,
          lineHeight: 1.5,
        }}
      >
        &ldquo;{exchange.objection}&rdquo;
      </div>
      <div
        className="tag-label"
        style={{ color: "var(--accent-primary)", marginBottom: 8 }}
      >
        Response
      </div>
      <div
        data-testid="response-body"
        style={{
          fontSize: 14,
          lineHeight: 1.65,
          color: textColor,
        }}
      >
        {exchange.response}
        {streaming && (
          <span
            aria-hidden
            className="cursor-blink"
            style={{
              display: "inline-block",
              width: 6,
              height: 14,
              marginLeft: 4,
              background: "var(--accent-primary)",
              verticalAlign: "middle",
            }}
          />
        )}
      </div>
    </div>
  );
}
