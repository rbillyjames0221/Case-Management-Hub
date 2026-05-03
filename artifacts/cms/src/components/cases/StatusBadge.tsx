import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  FILED: {
    label: "Filed",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  INVESTIGATION: {
    label: "Investigation",
    className: "bg-purple-100 text-purple-800 border-purple-200",
  },
  HEARING_SCHEDULED: {
    label: "Hearing Scheduled",
    className: "bg-cyan-100 text-cyan-800 border-cyan-200",
  },
  RESOLVED: {
    label: "Resolved",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  ARCHIVED: {
    label: "Archived",
    className: "bg-gray-100 text-gray-600 border-gray-200",
  },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-700",
  };
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
