import type { Metadata } from "next";
import { JetBrains_Mono, Instrument_Sans } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono-stack",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  variable: "--font-display-stack",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Tempus Sales Copilot",
  description:
    "Rank, prep, and coach — AI-powered sales support for Tempus oncology reps.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jetbrainsMono.variable} ${instrumentSans.variable} antialiased`}
    >
      <body>
        <TopNav />
        <main>{children}</main>
      </body>
    </html>
  );
}

function TopNav() {
  return (
    <header
      style={{
        borderBottom: "1px solid var(--border-default)",
        background: "var(--bg-primary)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "20px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        <a
          href="/"
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 10,
            textDecoration: "none",
            color: "var(--text-primary)",
          }}
        >
          <span
            style={{
              fontSize: 22,
              fontWeight: 400,
              letterSpacing: "-0.6px",
            }}
          >
            Tempus
          </span>
          <span
            className="tag-label"
            style={{ color: "var(--text-muted)" }}
          >
            Sales Copilot
          </span>
        </a>
        <div
          style={{ display: "flex", alignItems: "center", gap: 24 }}
        >
          <a
            href="/objections"
            className="nav-label"
            style={{
              color: "var(--text-secondary)",
              textDecoration: "none",
            }}
          >
            Objections
          </a>
          <span
            className="caption"
            style={{ color: "var(--text-secondary)" }}
          >
            Jake Mitchell · Midwest
          </span>
        </div>
      </div>
    </header>
  );
}
