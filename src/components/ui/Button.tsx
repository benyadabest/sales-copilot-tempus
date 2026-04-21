import * as React from "react";

type Variant = "primary" | "outline" | "ghost";
type Size = "sm" | "md";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  onDark?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "primary", size = "md", onDark = false, className = "", style, ...rest },
    ref,
  ) {
    const base: React.CSSProperties = {
      borderRadius: "var(--radius-button)",
      fontWeight: 600,
      fontSize: size === "sm" ? 12 : 13,
      letterSpacing: "0.5px",
      textTransform: "uppercase",
      padding: size === "sm" ? "7px 14px" : "10px 20px",
      lineHeight: 1,
      transition: "background 160ms ease, border-color 160ms ease, color 160ms ease",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      border: "1px solid transparent",
      whiteSpace: "nowrap",
      fontFamily: "inherit",
    };

    const textColor = onDark ? "var(--text-on-dark)" : "var(--text-primary)";

    const byVariant: Record<Variant, React.CSSProperties> = {
      primary: {
        background: "var(--accent-primary)",
        color: "#fff",
      },
      outline: {
        background: "transparent",
        color: textColor,
        border: `1px solid ${textColor}`,
      },
      ghost: {
        background: "transparent",
        color: textColor,
      },
    };

    const disabledStyle: React.CSSProperties = rest.disabled
      ? { opacity: 0.5, cursor: "not-allowed" }
      : {};

    return (
      <button
        ref={ref}
        {...rest}
        className={className}
        style={{ ...base, ...byVariant[variant], ...disabledStyle, ...style }}
      />
    );
  },
);
