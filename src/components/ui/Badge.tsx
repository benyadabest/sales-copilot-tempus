import * as React from "react";

export type BadgeTone = "default" | "success" | "warning" | "danger" | "info" | "accent";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  mono?: boolean;
}

const toneStyles: Record<BadgeTone, React.CSSProperties> = {
  default: {
    background: "var(--bg-surface-light)",
    color: "var(--text-secondary)",
    border: "1px solid var(--border-default)",
  },
  success: {
    background: "rgba(46, 139, 87, 0.08)",
    color: "var(--color-success)",
    border: "1px solid rgba(46, 139, 87, 0.2)",
  },
  warning: {
    background: "rgba(212, 135, 14, 0.08)",
    color: "var(--color-warning)",
    border: "1px solid rgba(212, 135, 14, 0.2)",
  },
  danger: {
    background: "rgba(211, 47, 47, 0.08)",
    color: "var(--color-danger)",
    border: "1px solid rgba(211, 47, 47, 0.2)",
  },
  info: {
    background: "var(--accent-glow)",
    color: "var(--accent-primary)",
    border: "1px solid var(--border-glow)",
  },
  accent: {
    background: "var(--accent-glow)",
    color: "var(--accent-primary)",
    border: "1px solid var(--border-glow)",
  },
};

export function Badge({
  tone = "default",
  mono = false,
  className = "",
  style,
  ...rest
}: BadgeProps) {
  return (
    <span
      {...rest}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 8px",
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 600,
        lineHeight: 1,
        letterSpacing: mono ? 0 : 0.3,
        fontFamily: mono
          ? "var(--font-mono-stack, 'JetBrains Mono', ui-monospace, monospace)"
          : "inherit",
        ...toneStyles[tone],
        ...style,
      }}
    />
  );
}
