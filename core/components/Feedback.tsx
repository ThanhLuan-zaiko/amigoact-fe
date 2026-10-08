import type { ReactElement, ReactNode } from "react";
import { FiAlertCircle, FiInbox, FiLoader } from "react-icons/fi";
import { Button } from "./Button.tsx";

interface FeedbackProps {
  title: string;
  message: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

function Shell({
  title,
  message,
  icon,
  actionLabel,
  onAction,
}: FeedbackProps): ReactElement {
  return (
    <div
      role={onAction ? "alert" : "status"}
      className="flex flex-col items-start gap-2 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
    >
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </p>
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{message}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function ErrorState(props: FeedbackProps): ReactElement {
  return (
    <Shell
      {...props}
      icon={
        props.icon ?? (
          <FiAlertCircle
            className="h-5 w-5 text-red-600 dark:text-red-400"
            aria-hidden="true"
          />
        )
      }
    />
  );
}

export function EmptyState(props: FeedbackProps): ReactElement {
  return (
    <Shell
      {...props}
      icon={
        props.icon ?? (
          <FiInbox
            className="h-5 w-5 text-blue-600 dark:text-blue-400"
            aria-hidden="true"
          />
        )
      }
    />
  );
}

export function LoadingState({ label }: { label: string }): ReactElement {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      className="flex items-center gap-2 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
    >
      <FiLoader
        className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400"
        aria-hidden="true"
      />
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{label}</p>
    </div>
  );
}
