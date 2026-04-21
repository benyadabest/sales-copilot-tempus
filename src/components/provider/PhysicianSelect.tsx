"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Physician } from "@/lib/types";

export function PhysicianSelect({
  physicians,
  selectedId,
}: {
  physicians: Physician[];
  selectedId: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function onChange(id: string) {
    const next = new URLSearchParams(params.toString());
    next.set("physician", id);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label
        className="tag-label"
        style={{ color: "var(--text-muted)" }}
      >
        Physician
      </label>
      <select
        value={selectedId}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "10px 14px",
          borderRadius: "var(--radius-input)",
          border: "1px solid var(--border-default)",
          background: "var(--bg-primary)",
          color: "var(--text-primary)",
          fontSize: 14,
          fontFamily: "inherit",
          cursor: "pointer",
          minWidth: 280,
        }}
      >
        {physicians.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} — {p.specialty}
          </option>
        ))}
      </select>
    </div>
  );
}
