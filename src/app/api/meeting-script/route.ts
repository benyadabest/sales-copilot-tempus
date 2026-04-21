import { NextResponse } from "next/server";
import {
  getProviders,
  getInteractionsFor,
  loadProductKnowledge,
} from "@/lib/data";
import { detectObjection } from "@/lib/objections";
import { complete } from "@/lib/cerebras";
import {
  meetingScriptSystem,
  objectionHandlerSystem,
} from "@/lib/prompts";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { physicianId } = (await req.json()) as { physicianId?: string };
    if (!physicianId) {
      return NextResponse.json({ error: "physicianId required" }, { status: 400 });
    }

    const providers = await getProviders();
    let provider = providers.find((p) =>
      p.physicians.some((d) => d.id === physicianId),
    );
    const physician = provider?.physicians.find((d) => d.id === physicianId);

    if (!provider || !physician) {
      return NextResponse.json({ error: "physician not found" }, { status: 404 });
    }

    const [interactions, kb] = await Promise.all([
      getInteractionsFor(physicianId),
      loadProductKnowledge(),
    ]);

    const objection = detectObjection(interactions);
    let objectionResponseText = "";
    if (objection) {
      // Two-step chain: get a grounded objection response first and feed it
      // into the meeting-script user message so the pitch can weave it in.
      try {
        objectionResponseText = await complete(
          objectionHandlerSystem(kb, "prep"),
          `Physician: ${physician.name}, ${physician.specialty}.\nObjection: ${objection}`,
          { temperature: 0.4, maxTokens: 220 },
        );
      } catch {
        // fall through — still generate a script without the chain
      }
    }

    const history = interactions
      .slice(0, 3)
      .map((e) => `[${e.date} · ${e.type} · ${e.rep}] ${e.notes}`)
      .join("\n\n");

    const userMessage = [
      `Physician: ${physician.name} — ${physician.title}`,
      `Specialty: ${physician.specialty}`,
      `Account: ${provider.name} (${provider.city}, ${provider.system_size})`,
      `Currently a Tempus customer: ${provider.current_tempus_testing ? "Yes" : "No"}`,
      provider.current_tests?.length
        ? `Currently using: ${provider.current_tests.join(", ")}`
        : null,
      provider.competitor_lab
        ? `Using competitor: ${provider.competitor_lab}`
        : null,
      `Estimated eligible patients/mo: ${physician.estimated_eligible_patients_per_month}`,
      `NGS ordering rate: ${Math.round(physician.ngs_ordering_rate * 100)}%`,
      "",
      "Recent CRM notes:",
      history || "(none)",
      objectionResponseText
        ? `\nIf a known objection comes up, the grounded response is: ${objectionResponseText}\nWeave the key data point into the pitch naturally.`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    const script = await complete(meetingScriptSystem(kb), userMessage, {
      temperature: 0.6,
      maxTokens: 260,
    });

    return NextResponse.json({ script, objection });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
