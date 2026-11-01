import type { IconType } from "react-icons";

export type TabItem = {
  label: string;
  icon: IconType;
  active?: boolean;
};

type TabBarProps = {
  tabs: TabItem[];
};

export default function TabBar({ tabs }: TabBarProps) {
  return (
    <div
      role="tablist"
      className="flex gap-6 overflow-x-auto border-b border-slate-200 text-[15px] font-semibold dark:border-slate-800"
    >
      {tabs.map(({ label, icon: Icon, active }) => (
        <button
          key={label}
          type="button"
          role="tab"
          aria-selected={active ?? false}
          className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 py-3 focus-visible:outline-2 focus-visible:outline-teal-700 dark:focus-visible:outline-teal-400 ${
            active
              ? "border-teal-700 text-teal-700 dark:border-teal-400 dark:text-teal-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          }`}
        >
          <Icon aria-hidden="true" />
          {label}
        </button>
      ))}
    </div>
  );
}
