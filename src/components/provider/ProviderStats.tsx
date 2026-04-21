import { Card } from "@/components/ui/Card";
import type { OpportunityScore, Provider } from "@/lib/types";
import {
  COMPONENT_LABELS,
  WEIGHTS,
} from "@/lib/scoring";
import type { ScoreComponents } from "@/lib/types";

const ORDER: Array<keyof ScoreComponents> = [
  "volume",
  "testingGap",
  "recency",
  "expansion",
  "access",
];

export function ProviderStats({
  provider,
  score,
}: {
  provider: Provider;
  score: OpportunityScore;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card padding="md">
        <div
          className="caption uppercase tracking-wider"
          style={{ color: "var(--text-muted)", marginBottom: 12 }}
        >
          Account snapshot
        </div>
        <Row label="Annual oncology volume" value={provider.annual_oncology_volume.toLocaleString()} />
        <Row label="System size" value={capitalize(provider.system_size)} />
        <Row
          label="Tempus customer"
          value={provider.current_tempus_testing ? "Yes" : "No"}
        />
        {provider.current_tests?.length ? (
          <Row label="Active tests" value={provider.current_tests.join(", ")} />
        ) : null}
        {provider.competitor_lab ? (
          <Row label="Competitor" value={provider.competitor_lab} />
        ) : null}
        <Row
          label="Last contact"
          value={`${provider.last_contact_days_ago} days ago`}
        />
      </Card>

      <Card padding="md">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 14,
          }}
        >
          <div
            className="caption uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Score breakdown
          </div>
          <div className="metric" style={{ fontSize: 22 }}>
            {score.total}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ORDER.map((key) => {
            const raw = score.components[key];
            const barPct = Math.max(0, Math.min(100, raw));
            return (
              <div key={key}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12,
                    marginBottom: 4,
                  }}
                >
                  <span style={{ color: "var(--text-primary)" }}>
                    {COMPONENT_LABELS[key]}
                    <span
                      className="font-mono"
                      style={{ color: "var(--text-muted)", marginLeft: 6 }}
                    >
                      {Math.round(WEIGHTS[key] * 100)}%
                    </span>
                  </span>
                  <span
                    className="font-mono"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {Math.round(raw)}
                  </span>
                </div>
                <div
                  style={{
                    height: 4,
                    borderRadius: 2,
                    background: "var(--bg-surface-light)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${barPct}%`,
                      height: "100%",
                      background: "var(--accent-primary)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card padding="md">
        <div
          className="caption uppercase tracking-wider"
          style={{ color: "var(--text-muted)", marginBottom: 12 }}
        >
          Physicians
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {provider.physicians.map((d) => (
            <div
              key={d.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                fontSize: 13,
                borderBottom: "1px dashed var(--border-default)",
                paddingBottom: 8,
              }}
            >
              <div>
                <div style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                  {d.name}
                </div>
                <div className="caption" style={{ color: "var(--text-muted)" }}>
                  {d.specialty}
                  {d.decision_maker ? " · Decision maker" : ""}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  className="font-mono"
                  style={{ color: "var(--text-primary)" }}
                >
                  {d.estimated_eligible_patients_per_month}/mo
                </div>
                <div
                  className="caption font-mono"
                  style={{ color: "var(--text-muted)" }}
                >
                  NGS {Math.round(d.ngs_ordering_rate * 100)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        padding: "6px 0",
        fontSize: 13,
      }}
    >
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
      <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
        {value}
      </span>
    </div>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
