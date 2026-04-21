"use client";

import { useEffect, useRef, useState } from "react";

// Minimal subset of the Web Speech API we rely on.
interface SpeechRecognitionResult {
  readonly 0: { transcript: string };
  readonly isFinal: boolean;
}
interface SpeechRecognitionResultList {
  readonly length: number;
  item(i: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function TranscriptCapture({
  onFinal,
  disabled,
}: {
  onFinal: (text: string) => void;
  disabled?: boolean;
}) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const onFinalRef = useRef(onFinal);

  // Keep callback ref fresh without tearing down the recognition object.
  useEffect(() => {
    onFinalRef.current = onFinal;
  }, [onFinal]);

  useEffect(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setSupported(false);
      return;
    }
    setSupported(true);
    const r = new Ctor();
    r.continuous = false;
    r.interimResults = true;
    r.lang = "en-US";

    r.onresult = (e: SpeechRecognitionEvent) => {
      let interimText = "";
      let finalText = "";
      for (let i = 0; i < e.results.length; i++) {
        const res = e.results[i];
        const txt = res[0].transcript;
        if (res.isFinal) finalText += txt;
        else interimText += txt;
      }
      setInterim(interimText);
      if (finalText.trim()) {
        setInterim("");
        onFinalRef.current(finalText.trim());
      }
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);

    recognitionRef.current = r;
    return () => {
      try {
        r.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    };
  }, []);

  function toggle() {
    const r = recognitionRef.current;
    if (!r) return;
    if (listening) {
      r.stop();
      setListening(false);
    } else {
      setInterim("");
      try {
        r.start();
        setListening(true);
      } catch {
        // Calling start() while already running throws — safe to ignore.
      }
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        alignItems: "center",
        width: "100%",
      }}
    >
      {supported ? (
        <>
          <button
            type="button"
            onClick={toggle}
            disabled={disabled}
            aria-pressed={listening}
            aria-label={listening ? "Stop listening" : "Start listening"}
            className={listening ? "listen-pulse" : ""}
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              border: "none",
              cursor: disabled ? "not-allowed" : "pointer",
              background: listening
                ? "var(--accent-primary)"
                : "var(--bg-surface-light)",
              color: listening ? "#fff" : "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 200ms ease, color 200ms ease",
            }}
          >
            <MicIcon />
          </button>
          <div
            className="caption"
            style={{
              color: listening
                ? "var(--accent-primary)"
                : "var(--text-muted-dark)",
              textAlign: "center",
              letterSpacing: "0.3px",
            }}
          >
            {listening
              ? "Listening — tap to stop"
              : "Tap to capture the objection"}
          </div>
          {interim && (
            <div
              style={{
                padding: "10px 14px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--border-dark)",
                borderRadius: 8,
                color: "var(--text-muted-dark)",
                fontSize: 13,
                fontStyle: "italic",
                width: "100%",
                textAlign: "center",
              }}
            >
              {interim}
            </div>
          )}
        </>
      ) : supported === false ? (
        <div
          style={{
            color: "var(--text-muted-dark)",
            fontSize: 12,
            textAlign: "center",
            maxWidth: 260,
          }}
        >
          Web Speech API unavailable. Type the objection below.
        </div>
      ) : null}

      <ManualInput onSubmit={onFinal} disabled={disabled} />
    </div>
  );
}

function ManualInput({
  onSubmit,
  disabled,
}: {
  onSubmit: (s: string) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  function submit() {
    const v = value.trim();
    if (!v) return;
    onSubmit(v);
    setValue("");
    inputRef.current?.focus();
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      style={{ display: "flex", gap: 8, width: "100%" }}
    >
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="…or type the objection"
        disabled={disabled}
        aria-label="Objection text"
        data-testid="objection-input"
        style={{
          flex: 1,
          padding: "10px 14px",
          borderRadius: 8,
          border: "1px solid var(--border-dark)",
          background: "var(--bg-surface-dark)",
          color: "var(--text-on-dark)",
          fontSize: 14,
          fontFamily: "inherit",
        }}
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        data-testid="objection-submit"
        style={{
          padding: "10px 16px",
          borderRadius: 4,
          border: "none",
          background: "var(--accent-primary)",
          color: "#fff",
          fontSize: 12,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          cursor: disabled || !value.trim() ? "not-allowed" : "pointer",
          opacity: disabled || !value.trim() ? 0.5 : 1,
        }}
      >
        Send
      </button>
    </form>
  );
}

function MicIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="8" y1="22" x2="16" y2="22" />
    </svg>
  );
}
