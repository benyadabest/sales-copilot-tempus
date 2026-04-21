import Link from "next/link";
import { notFound } from "next/navigation";
import { getProviderById, getInteractionsFor, getProviders } from "@/lib/data";
import { maxVolume, scoreProvider } from "@/lib/scoring";
import { deriveStatus } from "@/lib/status";
import { detectObjection } from "@/lib/objections";
import { Badge } from "@/components/ui/Badge";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { PhysicianSelect } from "@/components/provider/PhysicianSelect";
import { PhysicianNotes } from "@/components/provider/PhysicianNotes";
import { MeetingScript } from "@/components/provider/MeetingScript";
import { ObjectionHandler } from "@/components/provider/ObjectionHandler";
import { ProviderStats } from "@/components/provider/ProviderStats";
import { CoachingEntry } from "@/components/coaching/CoachingEntry";

export default async function ProviderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ physician?: string }>;
}) {
  const { id } = await params;
  const { physician: physicianParam } = await searchParams;

  const provider = await getProviderById(id);
  if (!provider) notFound();

  const allProviders = await getProviders();
  const score = scoreProvider(provider, maxVolume(allProviders));
  const status = deriveStatus(provider);

  const selectedPhysicianId =
    physicianParam && provider.physicians.some((p) => p.id === physicianParam)
      ? physicianParam
      : provider.physicians[0].id;

  const selectedPhysician = provider.physicians.find(
    (p) => p.id === selectedPhysicianId,
  )!;
  const interactions = await getInteractionsFor(selectedPhysicianId);
  const objection = detectObjection(interactions);

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "32px 32px 80px",
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <Link
          href="/"
          className="tag-label nav-link"
          style={{
            color: "var(--text-muted)",
            textDecoration: "none",
          }}
        >
          ← Territory
        </Link>
      </div>

      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 32,
          alignItems: "flex-start",
          marginBottom: 40,
          paddingBottom: 32,
          borderBottom: "1px solid var(--border-default)",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <h1
              style={{
                color: "var(--text-primary)",
                fontWeight: 300,
                letterSpacing: "-1px",
              }}
            >
              {provider.name}
            </h1>
            <StatusBadge status={status} />
          </div>
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
              fontSize: 13,
              color: "var(--text-secondary)",
            }}
          >
            <span>{provider.city}</span>
            <span style={{ color: "var(--text-muted)" }}>·</span>
            <span>{capitalize(provider.system_size)} system</span>
            <span style={{ color: "var(--text-muted)" }}>·</span>
            <span className="font-mono">
              {provider.annual_oncology_volume.toLocaleString()} oncology
              patients/yr
            </span>
            {provider.current_tests?.length ? (
              <>
                <span style={{ color: "var(--text-muted)" }}>·</span>
                <span style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  {provider.current_tests.map((t) => (
                    <Badge key={t} tone="accent">
                      {t}
                    </Badge>
                  ))}
                </span>
              </>
            ) : null}
          </div>
        </div>

        <ScoreBadge score={score.total} size={64} />
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 3fr) minmax(0, 2fr)",
          gap: 32,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <PhysicianSelect
            physicians={provider.physicians}
            selectedId={selectedPhysicianId}
          />

          <section>
            <div
              className="caption uppercase tracking-wider"
              style={{ color: "var(--text-muted)", marginBottom: 10 }}
            >
              CRM history · {selectedPhysician.name}
            </div>
            <PhysicianNotes entries={interactions} />
          </section>

          <MeetingScript physicianId={selectedPhysicianId} />
          <ObjectionHandler
            physicianId={selectedPhysicianId}
            objection={objection}
          />

          <CoachingEntry
            physicianId={selectedPhysicianId}
            physicianName={selectedPhysician.name}
            physicianSpecialty={selectedPhysician.specialty}
            providerName={provider.name}
          />
        </div>

        <aside>
          <ProviderStats provider={provider} score={score} />
        </aside>
      </div>
    </div>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
