import type { InteractionEntry } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

export function PhysicianNotes({ entries }: { entries: InteractionEntry[] }) {
  if (entries.length === 0) {
    return (
      <div
        style={{
          color: "var(--text-muted)",
          fontSize: 13,
          padding: "12px 0",
        }}
      >
        No CRM entries for this physician yet.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {entries.map((e, i) => (
        <div
          key={`${e.date}-${i}`}
          style={{
            paddingLeft: 16,
            borderLeft: "2px solid var(--border-default)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <span
              className="font-mono caption"
              style={{ color: "var(--text-secondary)" }}
            >
              {e.date}
            </span>
            <Badge tone="default">{e.type}</Badge>
            <span className="caption" style={{ color: "var(--text-muted)" }}>
              {e.rep}
            </span>
          </div>
          <div
            style={{
              color: "var(--text-primary)",
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            {e.notes}
          </div>
        </div>
      ))}
    </div>
  );
}
