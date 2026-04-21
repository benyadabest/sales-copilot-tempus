"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { CoachingExchange } from "@/lib/types";
import { TranscriptCapture } from "./TranscriptCapture";
import { ResponseCard } from "./ResponseCard";

type SummaryState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; summary: string; date: string }
  | { status: "saving"; summary: string; date: string }
  | { status: "saved"; summary: string; date: string }
  | { status: "error"; message: string };

export function CoachingPanel({
  physicianId,
  physicianName,
  physicianSpecialty,
  providerName,
  onClose,
}: {
  physicianId: string;
  physicianName: string;
  physicianSpecialty: string;
  providerName: string;
  onClose: () => void;
}) {
  const [exchanges, setExchanges] = useState<CoachingExchange[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [summary, setSummary] = useState<SummaryState>({ status: "idle" });

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  const handleObjection = useCallback(
    async (text: string) => {
      const objection = text.trim();
      if (!objection) return;

      const timestamp = new Date().toISOString();
      setExchanges((prev) => [
        { objection, response: "", timestamp },
        ...prev,
      ]);
      setStreaming(true);

      try {
        const res = await fetch("/api/objection-stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ physicianId, objection }),
        });

        if (!res.ok || !res.body) {
          throw new Error(`HTTP ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let full = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          full += chunk;
          setExchanges((prev) => {
            const next = [...prev];
            if (next[0] && next[0].timestamp === timestamp) {
              next[0] = { ...next[0], response: full };
            }
            return next;
          });
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Stream error";
        setExchanges((prev) => {
          const next = [...prev];
          if (next[0] && next[0].timestamp === timestamp) {
            next[0] = {
              ...next[0],
              response: `Couldn't generate a grounded response (${msg}). Consider escalating to Tempus medical affairs.`,
            };
          }
          return next;
        });
      } finally {
        setStreaming(false);
      }
    },
    [physicianId],
  );

  async function endSession() {
    setSummary({ status: "loading" });
    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ physicianId, exchanges }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { summary: string; date: string };
      setSummary({ status: "ready", summary: data.summary, date: data.date });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error";
      setSummary({ status: "error", message: msg });
    }
  }

  async function saveToCrm() {
    if (summary.status !== "ready") return;
    const { summary: summaryText, date } = summary;
    setSummary({ status: "saving", summary: summaryText, date });
    try {
      const res = await fetch("/api/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          physicianId,
          date,
          type: "in-person",
          rep: "Jake Mitchell",
          notes: summaryText,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSummary({ status: "saved", summary: summaryText, date });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error";
      setSummary({ status: "error", message: msg });
    }
  }

  const captureDisabled =
    summary.status === "ready" ||
    summary.status === "saving" ||
    summary.status === "saved";

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="coaching-panel"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        className="overlay-scrim"
        onClick={onClose}
        style={{ position: "absolute", inset: 0 }}
      />
      <div
        className="slide-up"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 1200,
          height: "88vh",
          background: "var(--bg-dark)",
          color: "var(--text-on-dark)",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          boxShadow: "var(--shadow-level-3)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: "1px solid var(--border-dark)",
          borderBottom: "none",
        }}
      >
        <header
          style={{
            padding: "20px 28px",
            borderBottom: "1px solid var(--border-dark)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div>
            <div
              className="tag-label"
              style={{ color: "var(--accent-primary)", marginBottom: 6 }}
            >
              Live coaching
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 400,
                color: "var(--text-on-dark)",
                letterSpacing: "-0.3px",
              }}
            >
              {physicianName}
              <span
                style={{
                  color: "var(--text-muted-dark)",
                  marginLeft: 8,
                }}
              >
                · {providerName}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {exchanges.length > 0 && summary.status === "idle" && (
              <Button
                variant="outline"
                onDark
                onClick={endSession}
                data-testid="end-session"
              >
                End session
              </Button>
            )}
            <Button
              variant="ghost"
              onDark
              onClick={onClose}
              data-testid="close-coaching"
            >
              Close
            </Button>
          </div>
        </header>

        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "minmax(0, 3fr) minmax(0, 2fr)",
            minHeight: 0,
          }}
        >
          {/* Left: context + exchanges */}
          <div
            style={{
              padding: "24px 28px",
              overflowY: "auto",
              borderRight: "1px solid var(--border-dark)",
            }}
          >
            <div
              className="tag-label"
              style={{ color: "var(--text-muted-dark)", marginBottom: 8 }}
            >
              Physician context
            </div>
            <div
              style={{
                fontSize: 14,
                color: "var(--text-muted-dark)",
                marginBottom: 28,
                lineHeight: 1.6,
              }}
            >
              {physicianSpecialty}
            </div>

            {summary.status === "idle" && exchanges.length === 0 && (
              <div
                style={{
                  padding: "28px 20px",
                  border: "1px dashed var(--border-dark)",
                  borderRadius: 12,
                  color: "var(--text-muted-dark)",
                  fontSize: 13,
                  textAlign: "center",
                }}
              >
                When the physician raises a concern, tap the mic or type it on
                the right. Responses appear here as they stream in.
              </div>
            )}

            {summary.status !== "idle" && (
              <SummaryView
                state={summary}
                onSave={saveToCrm}
                onClose={onClose}
              />
            )}

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                marginTop: summary.status === "idle" ? 0 : 24,
              }}
            >
              {exchanges.map((x, i) => (
                <ResponseCard
                  key={x.timestamp}
                  exchange={x}
                  streaming={i === 0 && streaming}
                  onDark
                />
              ))}
            </div>
          </div>

          {/* Right: capture */}
          <div
            style={{
              padding: "48px 32px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
              background: "var(--bg-surface-dark)",
            }}
          >
            <div
              className="tag-label"
              style={{ color: "var(--text-muted-dark)" }}
            >
              Capture
            </div>
            <TranscriptCapture
              onFinal={handleObjection}
              disabled={captureDisabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryView({
  state,
  onSave,
  onClose,
}: {
  state: SummaryState;
  onSave: () => void;
  onClose: () => void;
}) {
  if (state.status === "idle") return null;

  return (
    <div
      data-testid="session-summary"
      style={{
        border: "1px solid var(--border-dark)",
        borderLeft: "3px solid var(--accent-primary)",
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        background: "var(--bg-surface-dark)",
      }}
    >
      <div
        className="tag-label"
        style={{ color: "var(--accent-primary)", marginBottom: 10 }}
      >
        Session summary
      </div>
      {state.status === "loading" && (
        <div style={{ color: "var(--text-muted-dark)", fontSize: 13 }}>
          Generating CRM-ready summary…
        </div>
      )}
      {state.status === "error" && (
        <div style={{ color: "var(--color-danger)", fontSize: 13 }}>
          Couldn&apos;t generate summary: {state.message}
        </div>
      )}
      {(state.status === "ready" ||
        state.status === "saving" ||
        state.status === "saved") && (
        <>
          <p
            style={{
              whiteSpace: "pre-wrap",
              color: "var(--text-on-dark)",
              fontSize: 13,
              lineHeight: 1.7,
            }}
          >
            {state.summary}
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            {state.status === "ready" && (
              <Button size="sm" onClick={onSave} data-testid="save-to-crm">
                Save to CRM
              </Button>
            )}
            {state.status === "saving" && (
              <Button size="sm" disabled>
                Saving…
              </Button>
            )}
            {state.status === "saved" && (
              <>
                <Button size="sm" variant="outline" onDark disabled>
                  Saved to CRM
                </Button>
                <Button size="sm" variant="ghost" onDark onClick={onClose}>
                  Close
                </Button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
