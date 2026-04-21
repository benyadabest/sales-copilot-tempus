import Link from "next/link";
import { getProviders } from "@/lib/data";
import {
  ObjectionWorkbench,
  type PhysicianOption,
} from "@/components/objections/ObjectionWorkbench";

export default async function ObjectionsPage() {
  const providers = await getProviders();
  const physicians: PhysicianOption[] = providers.flatMap((p) =>
    p.physicians.map((ph) => ({
      id: ph.id,
      name: ph.name,
      title: ph.title,
      specialty: ph.specialty,
      providerName: p.name,
      providerCity: p.city,
    })),
  );

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 32px" }}>
      <Link
        href="/"
        className="tag-label"
        style={{
          color: "var(--text-muted)",
          textDecoration: "none",
          display: "inline-block",
          marginBottom: 16,
        }}
      >
        ← Territory
      </Link>
      <div
        className="tag-label"
        style={{ color: "var(--accent-primary)", marginBottom: 12 }}
      >
        Objection handler
      </div>
      <h1
        className="display"
        style={{ color: "var(--text-primary)", marginBottom: 8 }}
      >
        Test objections, any physician.
      </h1>
      <p
        style={{
          color: "var(--text-secondary)",
          fontSize: 15,
          maxWidth: 640,
          marginBottom: 40,
        }}
      >
        Standalone workbench — pick any physician across your territory and
        rehearse responses grounded in the Tempus product knowledge base.
      </p>

      <ObjectionWorkbench physicians={physicians} />
    </div>
  );
}
