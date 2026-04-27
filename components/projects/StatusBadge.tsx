import { Badge } from "@/components/primitives/Badge";
import type { ProjectStatus } from "@/lib/content";

export function StatusBadge({ status }: { status: ProjectStatus }) {
  if (status === "live") {
    return <Badge tone="sage">Live</Badge>;
  }
  if (status === "research") {
    return <Badge tone="amber">In research</Badge>;
  }
  return <Badge tone="rose">Archived</Badge>;
}
