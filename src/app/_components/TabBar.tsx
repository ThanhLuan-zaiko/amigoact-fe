import type { IconType } from "react-icons";
import { segmentActive, segmentIdle, segmentItem, segmentList } from "./ui";

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
    <div role="tablist" className={segmentList}>
      {tabs.map(({ label, icon: Icon, active }) => (
        <button
          key={label}
          type="button"
          role="tab"
          aria-selected={active ?? false}
          aria-label={label}
          title={label}
          className={`${segmentItem} ${active ? "flex-1" : "sm:flex-1"} justify-center whitespace-nowrap ${
            active ? segmentActive : segmentIdle
          }`}
        >
          <Icon aria-hidden="true" />
          {/* On a phone only the current tab keeps its word. */}
          <span className={active ? "" : "hidden sm:inline"}>{label}</span>
        </button>
      ))}
    </div>
  );
}
