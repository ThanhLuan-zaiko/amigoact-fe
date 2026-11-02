import { FiInbox } from "react-icons/fi";

type EmptyStateProps = {
  title: string;
  description: string;
};

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-slate-300 px-6 py-10 text-center dark:border-slate-700">
      <div className="flex h-12 w-12 items-center justify-center rounded-md border border-slate-200 dark:border-slate-800">
        <FiInbox
          aria-hidden="true"
          className="text-xl text-slate-600 dark:text-slate-300"
        />
      </div>
      <p className="font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </p>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}
