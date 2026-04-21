import Link from "next/link";
import type { OpportunityScore, Provider } from "@/lib/types";
import { deriveStatus } from "@/lib/status";
import { ScoreBreakdown } from "./ScoreBreakdown";
import { StatusBadge } from "./StatusBadge";

function formatLastContact(days: number): string {
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  if (days < 60) return `${Math.round(days / 7)} weeks ago`;
  const months = Math.round(days / 30);
  return `${months} mo ago`;
}

export function ProviderTable({
  ranked,
}: {
  ranked: Array<{ provider: Provider; score: OpportunityScore }>;
}) {

  return (
    <div
      style={{
        background: "var(--bg-primary)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-card)",
        overflow: "hidden",
        boxShadow: "var(--shadow-level-1)",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr
            style={{
              background: "var(--bg-surface-light)",
              borderBottom: "1px solid var(--border-default)",
            }}
          >
            <Th style={{ width: 48 }}>#</Th>
            <Th>Provider</Th>
            <Th>City</Th>
            <Th style={{ width: 96 }}>Score</Th>
            <Th style={{ width: 96 }}>Status</Th>
            <Th style={{ width: 96, textAlign: "right" }}>Physicians</Th>
            <Th style={{ width: 140 }}>Last contact</Th>
            <Th style={{ width: 96, textAlign: "right" }}></Th>
          </tr>
        </thead>
        <tbody>
          {ranked.map(({ provider, score }, idx) => {
            const status = deriveStatus(provider);
            return (
              <tr
                key={provider.id}
                className="table-row"
                style={{
                  borderBottom: "1px solid var(--border-default)",
                  height: 64,
                }}
              >
                <Td>
                  <span
                    className="font-mono"
                    style={{ color: "var(--text-muted)", fontWeight: 500 }}
                  >
                    {idx + 1}
                  </span>
                </Td>
                <Td>
                  <Link
                    href={`/provider/${provider.id}`}
                    style={{
                      color: "var(--text-primary)",
                      fontWeight: 500,
                      textDecoration: "none",
                    }}
                  >
                    {provider.name}
                  </Link>
                  {provider.competitor_lab ? (
                    <div
                      className="caption"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Uses {provider.competitor_lab}
                    </div>
                  ) : provider.current_tests?.length ? (
                    <div
                      className="caption"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Tempus: {provider.current_tests.join(", ")}
                    </div>
                  ) : null}
                </Td>
                <Td>
                  <span style={{ color: "var(--text-secondary)" }}>
                    {provider.city}
                  </span>
                </Td>
                <Td>
                  <ScoreBreakdown score={score} providerName={provider.name} />
                </Td>
                <Td>
                  <StatusBadge status={status} />
                </Td>
                <Td style={{ textAlign: "right" }}>
                  <span className="font-mono" style={{ color: "var(--text-primary)" }}>
                    {provider.physicians.length}
                  </span>
                </Td>
                <Td>
                  <span
                    className="font-mono"
                    style={{ color: "var(--text-secondary)", fontSize: 13 }}
                  >
                    {formatLastContact(provider.last_contact_days_ago)}
                  </span>
                </Td>
                <Td style={{ textAlign: "right" }}>
                  <Link
                    href={`/provider/${provider.id}`}
                    style={{
                      color: "var(--accent-primary)",
                      fontWeight: 500,
                      textDecoration: "none",
                    }}
                  >
                    View →
                  </Link>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Th({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <th
      style={{
        padding: "10px 16px",
        fontSize: 11,
        fontWeight: 500,
        color: "var(--text-muted)",
        textTransform: "uppercase",
        letterSpacing: 0.6,
        textAlign: "left",
        ...style,
      }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <td
      style={{
        padding: "12px 16px",
        fontSize: 14,
        color: "var(--text-primary)",
        verticalAlign: "middle",
        ...style,
      }}
    >
      {children}
    </td>
  );
}
