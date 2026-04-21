import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  accent?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingMap = {
  none: 0,
  sm: 16,
  md: 20,
  lg: 24,
};

export function Card({
  accent,
  padding = "md",
  style,
  className = "",
  ...rest
}: CardProps) {
  return (
    <div
      {...rest}
      className={className}
      style={{
        background: "var(--bg-primary)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-level-1)",
        padding: paddingMap[padding],
        borderLeft: accent ? "3px solid var(--accent-primary)" : undefined,
        ...style,
      }}
    />
  );
}
