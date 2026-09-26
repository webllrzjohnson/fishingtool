import type { ReactNode } from "react";
import { Button } from "./button";
import { Callout } from "./card";

type AsyncStateProps = {
  loading?: boolean;
  error?: string;
  empty?: boolean;
  unavailable?: boolean;
  loadingMessage?: string;
  errorMessage?: string;
  emptyMessage?: string;
  unavailableMessage?: string;
  onRetry?: () => void;
  children?: ReactNode;
  className?: string;
};

export function AsyncState({
  loading,
  error,
  empty,
  unavailable,
  loadingMessage = "Loading…",
  errorMessage,
  emptyMessage,
  unavailableMessage = "Data is not available for this record.",
  onRetry,
  children,
  className = "",
}: AsyncStateProps) {
  if (unavailable) {
    return (
      <StatusWrap className={className}>
        <Callout tone="neutral">{unavailableMessage}</Callout>
      </StatusWrap>
    );
  }
  if (loading) {
    return (
      <StatusWrap className={className}>
        <p className="animate-pulse text-sm text-slate-500">{loadingMessage}</p>
      </StatusWrap>
    );
  }
  if (error) {
    return (
      <StatusWrap className={className}>
        <Callout tone="red">{errorMessage ?? error}</Callout>
        {onRetry ? (
          <Button variant="secondary" className="mt-3" onClick={onRetry}>
            Try again
          </Button>
        ) : null}
      </StatusWrap>
    );
  }
  if (empty) {
    return (
      <StatusWrap className={className}>
        <Callout tone="neutral">{emptyMessage}</Callout>
      </StatusWrap>
    );
  }
  return <>{children}</>;
}

function StatusWrap({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div role="status" aria-live="polite" className={className}>
      {children}
    </div>
  );
}
