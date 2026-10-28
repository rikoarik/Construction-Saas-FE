import type { ReactNode } from "react";

type Illustration =
  | "projects"
  | "budget"
  | "schedule"
  | "reports"
  | "documents"
  | "no-access"
  | "offline";

const illustrationPaths: Record<Illustration, string> = {
  projects: "/illustrations/empty-projects.svg",
  budget: "/illustrations/empty-budget.svg",
  schedule: "/illustrations/empty-schedule.svg",
  reports: "/illustrations/empty-reports.svg",
  documents: "/illustrations/empty-documents.svg",
  "no-access": "/illustrations/state-no-access.svg",
  offline: "/illustrations/state-offline.svg",
};

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  illustration?: Illustration;
  /** Filtered results and empty queues never use first-use artwork. */
  kind?: "first-use" | "filtered" | "quiet";
};

export function EmptyState({
  title,
  description,
  action,
  illustration,
  kind = "quiet",
}: EmptyStateProps) {
  return (
    <div className={`empty-state empty-state--${kind}`}>
      {kind === "first-use" && illustration && (
        <span
          aria-hidden="true"
          className="empty-state__illustration"
          style={{ maskImage: `url(${illustrationPaths[illustration]})` }}
        />
      )}
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}
