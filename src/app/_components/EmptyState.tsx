import { FiInbox } from "react-icons/fi";

type EmptyStateProps = {
  title: string;
  description: string;
};

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 border border-dashed border-slate-300 px-6 py-10 text-center dark:border-slate-700">
      <FiInbox
        aria-hidden="true"
        className="text-2xl text-teal-700 dark:text-teal-400"
      />
      <p className="font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </p>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}
