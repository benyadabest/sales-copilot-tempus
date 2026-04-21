import "server-only";

const CEREBRAS_API_URL = "https://api.cerebras.ai/v1/chat/completions";

/**
 * Cerebras catalog as of 2026-04 (verified via GET /v1/models):
 * - qwen-3-235b-a22b-instruct-2507 — highest-quality, used for prep
 * - gpt-oss-120b — strong mid-tier alternative
 * - zai-glm-4.7 — general-purpose
 * - llama3.1-8b — smallest/fastest, used for live coaching streaming
 */
export type CerebrasModel =
  | "qwen-3-235b-a22b-instruct-2507"
  | "gpt-oss-120b"
  | "zai-glm-4.7"
  | "llama3.1-8b";

const PREP_MODEL: CerebrasModel = "qwen-3-235b-a22b-instruct-2507";
const COACHING_MODEL: CerebrasModel = "llama3.1-8b";

interface CompleteOptions {
  model?: CerebrasModel;
  temperature?: number;
  maxTokens?: number;
}

function isStubMode(): boolean {
  return process.env.CEREBRAS_STUB === "1" || !process.env.CEREBRAS_API_KEY;
}

/**
 * Qwen-3 instruct models emit `<think>…</think>` reasoning blocks before the
 * final answer. Strip them so the UI shows only the deliverable text.
 */
function stripThinkTags(s: string): string {
  return s.replace(/<think>[\s\S]*?<\/think>\s*/gi, "").trim();
}

/**
 * Deterministic offline response for development without a Cerebras API key.
 * Returns a plausible stub keyed by a light hash of the user message so the
 * UI renders consistent copy per physician/objection.
 */
function stubResponse(systemPrompt: string, userMessage: string): string {
  const lower = userMessage.toLowerCase();
  const isObjection = systemPrompt.includes("objection handler");
  const isSummary = systemPrompt.includes("sales call into a CRM note");

  if (isSummary) {
    return `Call summary (stub): Discussed Tempus genomic profiling. Physician expressed interest in clinical trial matching and turnaround time. Raised concerns about cost justification. Sentiment: warm. Next step: share TAT benchmarks and follow up within 10 business days.`;
  }

  if (isObjection) {
    if (lower.includes("turnaround") || lower.includes("tat") || lower.includes("10 days")) {
      return `That's a fair concern — turnaround is clinically non-negotiable for stage IV first-line decisions. Tempus xT CDx reports in 10–14 calendar days from specimen receipt, which puts us in line with FMI for most cases. And when tissue is borderline, pairing with xF liquid biopsy closes the TAT gap with a blood draw. Want me to send the per-indication TAT data and set up a pilot on 5 of your NSCLC cases?`;
    }
    if (lower.includes("cost") || lower.includes("roi") || lower.includes("cfo")) {
      return `Totally fair — CFOs want a quantifiable case. The stat we lead with is 96% of patients matched to a clinical trial when NGS is combined with clinical data, plus 9% of patients have unique actionable alterations in liquid biopsy not found in tissue. Trial enrollment revenue and reduced re-biopsy costs are typically how these ROI cases land. I can prep a custom business case with your patient volume — can I get numbers from your oncology operations lead?`;
    }
    if (lower.includes("heme") || lower.includes("flow cytometry") || lower.includes("fish")) {
      return `You're right that flow and FISH cover the basics — but xT Heme-specific panels catch structural variants and emerging resistance mutations that standard workflows miss, especially in MDS and AML minimal residual disease contexts. Worth 15 minutes on a couple of your recent cases? I can bring heme-specific case studies.`;
    }
    if (lower.includes("sample") || lower.includes("tissue sufficiency") || lower.includes("biopsy")) {
      return `Glioma sample volume is a known constraint. Our minimum input for xT CDx is 20% tumor content at typical FFPE volumes, and we have a re-extraction success rate strong enough that I'd rather you send borderline cases than pre-reject them. For tight specimens we also offer xF liquid biopsy as a complementary path. Want to review your last 10 biopsy volumes together?`;
    }
    if (lower.includes("vendor") || lower.includes("switch") || lower.includes("myriad") || lower.includes("billing")) {
      return `I hear you — vendor consolidation is real friction, not just convenience. The practical value is one requisition, one portal, one invoice across germline + somatic + liquid. On billing specifically: Tempus offers financial assistance for all US patients regardless of insurance status, which is typically the top concern for Medicaid-heavy panels. Want me to walk through the patient-side billing flow?`;
    }
    return `That's a valid concern. The most relevant data point from our side: 88.6% of patients tested on xT CDx had at least one biologically relevant alteration, and 96% were matched to a clinical trial when NGS was combined with clinical data. Happy to pull the specific subset that's closest to your practice mix. What would a next step look like — a pilot on 5 cases, or a sit-down with one of our medical affairs team?`;
  }

  // Meeting-script stub
  return `Hi Doctor — last time we talked, you flagged turnaround time and trial matching as priorities. Tempus xT CDx reports in 10–14 days with 648 genes including MSI, TMB, and CDx claims, and our data shows 96% of patients get matched to a clinical trial when NGS is combined with clinical context. Given your patient volume, I'd love to pilot it on 5 of your stage IV cases this quarter — can we put 15 minutes on the calendar next week to walk through a sample report?`;
}

export async function complete(
  systemPrompt: string,
  userMessage: string,
  opts: CompleteOptions = {},
): Promise<string> {
  if (isStubMode()) {
    return stubResponse(systemPrompt, userMessage);
  }

  const res = await fetch(CEREBRAS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.CEREBRAS_API_KEY}`,
    },
    body: JSON.stringify({
      model: opts.model ?? PREP_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: opts.temperature ?? 0.5,
      max_tokens: opts.maxTokens ?? 400,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`Cerebras ${res.status}: ${errBody.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("Cerebras returned no content");
  return stripThinkTags(text);
}

/**
 * SSE stream of content deltas. In stub mode, chunks the stub response to
 * simulate streaming.
 */
export async function completeStream(
  systemPrompt: string,
  userMessage: string,
  opts: CompleteOptions = {},
): Promise<ReadableStream<Uint8Array>> {
  const encoder = new TextEncoder();

  if (isStubMode()) {
    const full = stubResponse(systemPrompt, userMessage);
    return new ReadableStream({
      async start(controller) {
        // Chunk by ~6 chars with short delays to simulate streaming
        for (let i = 0; i < full.length; i += 6) {
          const chunk = full.slice(i, i + 6);
          controller.enqueue(encoder.encode(chunk));
          await new Promise((r) => setTimeout(r, 18));
        }
        controller.close();
      },
    });
  }

  const res = await fetch(CEREBRAS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.CEREBRAS_API_KEY}`,
    },
    body: JSON.stringify({
      model: opts.model ?? COACHING_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: opts.temperature ?? 0.4,
      max_tokens: opts.maxTokens ?? 300,
      stream: true,
    }),
  });

  if (!res.ok || !res.body) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`Cerebras ${res.status}: ${errBody.slice(0, 200)}`);
  }

  // Transform the Cerebras SSE stream into raw text chunks.
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  return new ReadableStream({
    async start(controller) {
      let buffer = "";
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          // Process complete SSE lines; keep partial trailing line in buffer.
          let newlineIdx: number;
          while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
            const line = buffer.slice(0, newlineIdx);
            buffer = buffer.slice(newlineIdx + 1);
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const payload = trimmed.slice(5).trim();
            if (!payload || payload === "[DONE]") continue;
            try {
              const parsed = JSON.parse(payload) as {
                choices?: Array<{ delta?: { content?: string } }>;
              };
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) controller.enqueue(encoder.encode(delta));
            } catch {
              // ignore partial JSON
            }
          }
        }
        controller.close();
      } catch (e) {
        controller.error(e);
      }
    },
    cancel() {
      reader.cancel().catch(() => undefined);
    },
  });
}
