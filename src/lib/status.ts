import type { Provider, ProviderStatus } from "./types";

/**
 * Derive a provider's pipeline status from CRM recency + Tempus testing state.
 * - New: not currently a customer
 * - At Risk: is a customer but no contact in > 60 days
 * - Active: everything else
 */
export function deriveStatus(provider: Provider): ProviderStatus {
  if (!provider.current_tempus_testing) return "New";
  if (provider.last_contact_days_ago > 60) return "At Risk";
  return "Active";
}

export function statusTone(status: ProviderStatus): "success" | "warning" | "danger" | "info" {
  switch (status) {
    case "Active":
      return "success";
    case "At Risk":
      return "danger";
    case "New":
      return "info";
  }
}
