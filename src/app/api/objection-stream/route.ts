import { getProviders, loadProductKnowledge } from "@/lib/data";
import { completeStream } from "@/lib/cerebras";
import { objectionHandlerSystem } from "@/lib/prompts";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { physicianId, objection } = (await req.json()) as {
      physicianId?: string;
      objection?: string;
    };
    if (!objection) {
      return new Response("objection required", { status: 400 });
    }

    const providers = await getProviders();
    const provider = providers.find((p) =>
      p.physicians.some((d) => d.id === physicianId),
    );
    const physician = provider?.physicians.find((d) => d.id === physicianId);

    const kb = await loadProductKnowledge();
    const context = physician
      ? `Physician: ${physician.name} (${physician.specialty}). Account: ${provider?.name}.`
      : "";

    const stream = await completeStream(
      objectionHandlerSystem(kb, "coaching"),
      `${context}\nObjection (live): ${objection}`.trim(),
      { temperature: 0.4, maxTokens: 220 },
    );

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(msg, { status: 500 });
  }
}
