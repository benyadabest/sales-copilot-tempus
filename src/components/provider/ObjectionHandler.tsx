"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { SkeletonLines } from "@/components/ui/Skeleton";

export function ObjectionHandler({
  physicianId,
  objection,
}: {
  physicianId: string;
  objection: string | null;
}) {
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!objection);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!objection) {
      setResponse(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setResponse(null);
    setError(null);

    fetch("/api/objection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ physicianId, objection }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = (await r.json()) as { response: string };
        if (!cancelled) setResponse(data.response);
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
  }, [physicianId, objection]);

  if (!objection) {
    return (
      <Card padding="lg">
        <h2 style={{ color: "var(--text-primary)" }}>Known objections</h2>
        <div
          className="caption"
          style={{ color: "var(--text-muted)", marginTop: 6 }}
        >
          No outstanding objections detected in CRM notes for this physician.
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <h2 style={{ color: "var(--text-primary)", marginBottom: 10 }}>
        Objection handler
      </h2>

      <div
        style={{
          background: "var(--bg-surface-light)",
          borderRadius: 8,
          padding: "12px 16px",
          marginBottom: 14,
          fontSize: 13,
          color: "var(--text-secondary)",
          fontStyle: "italic",
        }}
      >
        &ldquo;{objection}&rdquo;
      </div>

      <div
        style={{
          background: "var(--bg-surface-light)",
          borderLeft: "3px solid var(--accent-primary)",
          borderRadius: 8,
          padding: "16px 20px",
        }}
      >
        <div
          className="tag-label"
          style={{ color: "var(--accent-primary)", marginBottom: 8 }}
        >
          Grounded response
        </div>
        {loading ? (
          <SkeletonLines lines={3} />
        ) : error ? (
          <div style={{ color: "var(--color-danger)", fontSize: 13 }}>
            Couldn&apos;t generate response: {error}.
          </div>
        ) : (
          <p
            style={{
              color: "var(--text-primary)",
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            {response}
          </p>
        )}
      </div>
    </Card>
  );
}
