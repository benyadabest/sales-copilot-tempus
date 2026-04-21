"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { SkeletonLines } from "@/components/ui/Skeleton";

export function MeetingScript({ physicianId }: { physicianId: string }) {
  const [script, setScript] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setScript(null);
    setError(null);

    fetch("/api/meeting-script", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ physicianId }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = (await r.json()) as { script: string };
        if (!cancelled) setScript(data.script);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [physicianId]);

  return (
    <Card padding="lg">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 10,
        }}
      >
        <div>
          <h2 style={{ color: "var(--text-primary)" }}>Meeting script</h2>
          <div className="caption" style={{ color: "var(--text-muted)" }}>
            30-second elevator pitch, grounded in CRM + product knowledge.
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ marginTop: 8 }}>
          <SkeletonLines lines={4} />
        </div>
      ) : error ? (
        <div
          style={{
            color: "var(--color-danger)",
            fontSize: 13,
            padding: "12px 14px",
            background: "rgba(211, 47, 47, 0.06)",
            border: "1px solid rgba(211, 47, 47, 0.2)",
            borderRadius: 6,
          }}
        >
          Couldn&apos;t generate script: {error}. Try again or escalate to
          Tempus medical affairs.
        </div>
      ) : (
        <p
          style={{
            color: "var(--text-primary)",
            fontSize: 15,
            lineHeight: 1.6,
            marginTop: 4,
          }}
        >
          {script}
        </p>
      )}
    </Card>
  );
}
