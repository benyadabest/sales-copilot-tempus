import { getProviders } from "@/lib/data";
import { RankedDashboard } from "@/components/dashboard/RankedDashboard";
import {
  computeComponents,
  maxVolume,
  rankProviders,
} from "@/lib/scoring";
import { deriveStatus } from "@/lib/status";

export default async function DashboardPage() {
  const providers = await getProviders();
  const maxVol = maxVolume(providers);
  const rows = providers.map((p) => ({
    provider: p,
    components: computeComponents(p, maxVol),
  }));
  const ranked = rankProviders(providers);
  const active = providers.filter((p) => deriveStatus(p) === "Active").length;
  const atRisk = providers.filter((p) => deriveStatus(p) === "At Risk").length;
  const newAccts = providers.filter((p) => deriveStatus(p) === "New").length;
  const avgScore = Math.round(
    ranked.reduce((s, r) => s + r.score.total, 0) / ranked.length,
  );

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "64px 32px 96px",
      }}
    >
      <header style={{ marginBottom: 48 }}>
        <div
          className="tag-label"
          style={{ color: "var(--accent-primary)", marginBottom: 16 }}
        >
          Your Territory
        </div>
        <h1
          className="display"
          style={{ color: "var(--text-primary)", maxWidth: 820 }}
        >
          {providers.length} providers, ranked by opportunity.
        </h1>
        <p
          style={{
            color: "var(--text-secondary)",
            marginTop: 20,
            fontSize: 15,
            maxWidth: 620,
            lineHeight: 1.6,
          }}
        >
          Scored on volume, testing gap, engagement recency, expansion
          potential, and decision-maker access. Drag the formula weights
          below to re-rank live, or click any score for the breakdown.
        </p>

        <div
          style={{
            display: "flex",
            gap: 48,
            marginTop: 40,
            borderTop: "1px solid var(--border-default)",
            paddingTop: 24,
          }}
        >
          <Stat label="Active" value={active} />
          <Stat label="At risk" value={atRisk} tone="danger" />
          <Stat label="New" value={newAccts} />
          <Stat label="Avg score" value={avgScore} />
        </div>
      </header>

      <RankedDashboard rows={rows} />
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "danger";
}) {
  return (
    <div>
      <div
        className="tag-label"
        style={{ color: "var(--text-muted)", marginBottom: 8 }}
      >
        {label}
      </div>
      <div
        className="metric"
        style={{
          color:
            tone === "danger" ? "var(--color-danger)" : "var(--text-primary)",
        }}
      >
        {value}
      </div>
    </div>
  );
}
