"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CoachingPanel } from "./CoachingPanel";

export function CoachingEntry({
  physicianId,
  physicianName,
  physicianSpecialty,
  providerName,
}: {
  physicianId: string;
  physicianName: string;
  physicianSpecialty: string;
  providerName: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          padding: "24px 28px",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-card)",
          background: "var(--bg-primary)",
          boxShadow: "var(--shadow-level-1)",
        }}
      >
        <div>
          <div
            className="tag-label"
            style={{ color: "var(--accent-primary)", marginBottom: 8 }}
          >
            Live coaching
          </div>
          <div
            style={{
              color: "var(--text-primary)",
              fontSize: 18,
              fontWeight: 400,
              marginBottom: 4,
            }}
          >
            Going into the meeting?
          </div>
          <div
            className="caption"
            style={{ color: "var(--text-secondary)", maxWidth: 480 }}
          >
            Live coaching listens for objections and generates grounded
            responses in real time. Chrome recommended.
          </div>
        </div>
        <Button onClick={() => setOpen(true)}>Start coaching session</Button>
      </div>

      {open && (
        <CoachingPanel
          physicianId={physicianId}
          physicianName={physicianName}
          physicianSpecialty={physicianSpecialty}
          providerName={providerName}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
