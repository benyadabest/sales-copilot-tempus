"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SkeletonLines } from "@/components/ui/Skeleton";

export interface PhysicianOption {
  id: string;
  name: string;
  title: string;
  specialty: string;
  providerName: string;
  providerCity: string;
}

const QUICK_OBJECTIONS = [
  "Foundation Medicine gets me reports in 10 days — what about Tempus?",
  "Cost is a concern for our CFO.",
  "We already use Guardant for liquid biopsy.",
  "My pathology team isn't sold on switching NGS vendors.",
  "Our EMR integration with Caris is already live.",
];

export function ObjectionWorkbench({
  physicians,
}: {
  physicians: PhysicianOption[];
}) {
  const [physicianId, setPhysicianId] = useState<string>(physicians[0]?.id ?? "");
  const [objection, setObjection] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pastedAt, setPastedAt] = useState<number>(0);

  const selected = useMemo(
    () => physicians.find((p) => p.id === physicianId) ?? null,
    [physicians, physicianId],
  );

  async function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || !physicianId) return;
    setLoading(true);
    setResponse(null);
    setError(null);
    try {
      const res = await fetch("/api/objection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ physicianId, objection: trimmed }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { response: string };
      setResponse(data.response);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      <Card padding="lg">
        <div
          className="tag-label"
          style={{ color: "var(--accent-primary)", marginBottom: 10 }}
        >
          Objection workbench
        </div>
        <h2 style={{ color: "var(--text-primary)", marginBottom: 20 }}>
          Draft a grounded response
        </h2>

        <label
          className="tag-label"
          htmlFor="physician"
          style={{ color: "var(--text-muted)", display: "block", marginBottom: 8 }}
        >
          Physician
        </label>
        <select
          id="physician"
          data-testid="workbench-physician"
          value={physicianId}
          onChange={(e) => setPhysicianId(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid var(--border-default)",
            background: "var(--bg-primary)",
            color: "var(--text-primary)",
            fontSize: 14,
            marginBottom: 20,
          }}
        >
          {physicians.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — {p.providerName} ({p.providerCity})
            </option>
          ))}
        </select>

        <label
          className="tag-label"
          htmlFor="objection-text"
          style={{ color: "var(--text-muted)", display: "block", marginBottom: 8 }}
        >
          Objection
        </label>
        <textarea
          id="objection-text"
          data-testid="workbench-objection"
          value={objection}
          onChange={(e) => setObjection(e.target.value)}
          rows={4}
          placeholder="Paste or type the physician's concern…"
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 8,
            border: "1px solid var(--border-default)",
            background: "var(--bg-primary)",
            color: "var(--text-primary)",
            fontSize: 14,
            lineHeight: 1.5,
            fontFamily: "inherit",
            resize: "vertical",
            marginBottom: 12,
          }}
        />

        <div style={{ marginBottom: 16 }}>
          <div
            className="tag-label"
            style={{ color: "var(--text-muted)", marginBottom: 8 }}
          >
            Quick pick
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {QUICK_OBJECTIONS.map((q, i) => (
              <button
                key={i}
                type="button"
                data-testid={`workbench-quick-${i}`}
                onClick={() => {
                  setObjection(q);
                  setPastedAt(Date.now());
                }}
                style={{
                  background: "var(--bg-surface-light)",
                  border: "1px solid var(--border-default)",
                  borderRadius: 999,
                  padding: "6px 12px",
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  maxWidth: "100%",
                  textAlign: "left",
                  lineHeight: 1.3,
                }}
                title={q}
              >
                {q.length > 44 ? q.slice(0, 42) + "…" : q}
              </button>
            ))}
          </div>
          {pastedAt > 0 && (
            <div
              className="caption"
              style={{ color: "var(--text-muted)", marginTop: 6 }}
            >
              Inserted — edit above or submit as-is.
            </div>
          )}
        </div>

        <Button
          data-testid="workbench-submit"
          onClick={() => submit(objection)}
          disabled={loading || !objection.trim() || !physicianId}
        >
          {loading ? "Generating…" : "Generate response"}
        </Button>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card padding="lg">
          <div
            className="tag-label"
            style={{ color: "var(--text-muted)", marginBottom: 8 }}
          >
            Physician context
          </div>
          {selected ? (
            <>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 500,
                  color: "var(--text-primary)",
                  marginBottom: 4,
                }}
              >
                {selected.name}
              </div>
              <div
                className="caption"
                style={{ color: "var(--text-secondary)" }}
              >
                {selected.title} · {selected.specialty}
              </div>
              <div
                className="caption"
                style={{ color: "var(--text-muted)", marginTop: 4 }}
              >
                {selected.providerName} · {selected.providerCity}
              </div>
            </>
          ) : (
            <div className="caption" style={{ color: "var(--text-muted)" }}>
              No physician selected.
            </div>
          )}
        </Card>

        <Card padding="lg" accent>
          <div
            className="tag-label"
            style={{ color: "var(--accent-primary)", marginBottom: 10 }}
          >
            Grounded response
          </div>
          {loading ? (
            <SkeletonLines lines={4} />
          ) : error ? (
            <div
              data-testid="workbench-error"
              style={{ color: "var(--color-danger)", fontSize: 13 }}
            >
              Couldn&apos;t generate response: {error}.
            </div>
          ) : response ? (
            <p
              data-testid="workbench-response"
              style={{
                color: "var(--text-primary)",
                fontSize: 14,
                lineHeight: 1.65,
                whiteSpace: "pre-wrap",
              }}
            >
              {response}
            </p>
          ) : (
            <div
              className="caption"
              style={{ color: "var(--text-muted)" }}
            >
              Pick a physician and enter an objection to generate a
              product-knowledge-grounded response.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
