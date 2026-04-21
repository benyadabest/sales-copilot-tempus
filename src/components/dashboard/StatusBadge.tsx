import { Badge } from "@/components/ui/Badge";
import { statusTone } from "@/lib/status";
import type { ProviderStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: ProviderStatus }) {
  return <Badge tone={statusTone(status)}>{status}</Badge>;
}
