import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  illustration?: ReactNode;
  action?: ReactNode;
};

export function EmptyState({
  title,
  description,
  illustration,
  action,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      {illustration ? (
        <div className="empty-state__illustration">{illustration}</div>
      ) : null}
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
      {action ? <div className="empty-state__action">{action}</div> : null}
    </div>
  );
}
