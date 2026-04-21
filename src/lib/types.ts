export type SystemSize = "small" | "medium" | "large";

export type InteractionType = "in-person" | "phone" | "email" | "virtual";

export interface Physician {
  id: string;
  name: string;
  title: string;
  specialty: string;
  estimated_eligible_patients_per_month: number;
  ngs_ordering_rate: number;
  decision_maker: boolean;
  notes?: string;
}

export interface Provider {
  id: string;
  name: string;
  city: string;
  system_size: SystemSize;
  annual_oncology_volume: number;
  current_tempus_testing: boolean;
  current_tests?: string[];
  competitor_lab?: string;
  last_contact_days_ago: number;
  physicians: Physician[];
}

export interface MarketIntelligence {
  providers: Provider[];
}

export interface InteractionEntry {
  date: string;
  rep: string;
  type: InteractionType;
  notes: string;
}

export interface PhysicianInteractions {
  physician_id: string;
  entries: InteractionEntry[];
}

export interface CrmNotes {
  interactions: PhysicianInteractions[];
}

export interface ScoreComponents {
  volume: number;
  testingGap: number;
  recency: number;
  expansion: number;
  access: number;
}

export interface OpportunityScore {
  total: number;
  components: ScoreComponents;
  /** Weighted contribution of each component (sums to ~total). Useful for the breakdown chart. */
  weighted: ScoreComponents;
}

export type ProviderStatus = "New" | "Active" | "At Risk";

export interface RankedProvider {
  provider: Provider;
  score: OpportunityScore;
  status: ProviderStatus;
}

export interface AgentResult {
  text: string;
  /** Which source paragraph(s) or stats grounded the response. Optional, best-effort. */
  sources?: string[];
}

export interface CoachingExchange {
  objection: string;
  response: string;
  timestamp: string;
}
