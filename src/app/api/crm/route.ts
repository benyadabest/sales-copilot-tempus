import { NextResponse } from "next/server";
import { appendCrmEntry } from "@/lib/data";
import type { InteractionType } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      physicianId?: string;
      date?: string;
      rep?: string;
      type?: InteractionType;
      notes?: string;
    };

    if (!body.physicianId || !body.notes) {
      return NextResponse.json(
        { error: "physicianId and notes required" },
        { status: 400 },
      );
    }

    const entry = {
      date: body.date ?? new Date().toISOString().slice(0, 10),
      rep: body.rep ?? "Jake Mitchell",
      type: body.type ?? ("in-person" as InteractionType),
      notes: body.notes,
    };

    await appendCrmEntry(body.physicianId, entry);
    return NextResponse.json({ ok: true, entry });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
