import { NextResponse } from "next/server";
import { complete } from "@/lib/cerebras";
import { callSummarySystem } from "@/lib/prompts";
import { getProviders } from "@/lib/data";
import type { CoachingExchange } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { physicianId, exchanges } = (await req.json()) as {
      physicianId?: string;
      exchanges?: CoachingExchange[];
    };

    if (!physicianId || !exchanges) {
      return NextResponse.json({ error: "physicianId and exchanges required" }, { status: 400 });
    }

    const providers = await getProviders();
    const provider = providers.find((p) =>
      p.physicians.some((d) => d.id === physicianId),
    );
    const physician = provider?.physicians.find((d) => d.id === physicianId);

    const today = new Date().toISOString().slice(0, 10);
    const userMessage = [
      `Date: ${today}`,
      `Physician: ${physician?.name ?? "(unknown)"} — ${physician?.specialty ?? ""}`,
      `Account: ${provider?.name ?? "(unknown)"}`,
      "",
      "Coaching session exchanges:",
      exchanges.length === 0
        ? "(no exchanges captured)"
        : exchanges
            .map(
              (e, i) =>
                `${i + 1}. Objection: ${e.objection}\n   Response given: ${e.response}`,
            )
            .join("\n\n"),
    ].join("\n");

    const summary = await complete(callSummarySystem, userMessage, {
      temperature: 0.3,
      maxTokens: 360,
    });

    return NextResponse.json({ summary, date: today });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
