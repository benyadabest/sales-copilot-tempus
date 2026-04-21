"use client";

import * as React from "react";

export interface PopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right" | "center";
  width?: number;
}

export function Popover({
  trigger,
  children,
  align = "center",
  width = 320,
}: PopoverProps) {
  const [open, setOpen] = React.useState(false);
  const [coords, setCoords] = React.useState<{ top: number; left: number } | null>(
    null,
  );
  const containerRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);

  const updatePosition = React.useCallback(() => {
    const btn = triggerRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const gap = 8;
    const margin = 12;
    let left: number;
    if (align === "left") left = rect.left;
    else if (align === "right") left = rect.right - width;
    else left = rect.left + rect.width / 2 - width / 2;
    // Clamp within viewport
    const maxLeft = window.innerWidth - width - margin;
    if (left > maxLeft) left = maxLeft;
    if (left < margin) left = margin;
    const top = rect.bottom + gap;
    setCoords({ top, left });
  }, [align, width]);

  React.useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, updatePosition]);

  React.useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !containerRef.current?.contains(target) &&
        !panelRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onReflow = () => updatePosition();
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    window.addEventListener("scroll", onReflow, true);
    window.addEventListener("resize", onReflow);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
      window.removeEventListener("scroll", onReflow, true);
      window.removeEventListener("resize", onReflow);
    };
  }, [open, updatePosition]);

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", display: "inline-block" }}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        style={{
          background: "transparent",
          border: "none",
          padding: 0,
          cursor: "pointer",
        }}
      >
        {trigger}
      </button>
      {open && coords && (
        <div
          ref={panelRef}
          role="dialog"
          style={{
            position: "fixed",
            top: coords.top,
            left: coords.left,
            width,
            background: "var(--bg-primary)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-card)",
            boxShadow: "var(--shadow-level-2)",
            padding: 16,
            zIndex: 50,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
