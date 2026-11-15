import type { IconType } from "react-icons";
import { type BreakdownRow, roundHours } from "@/lib/hoursStats";
import BarListChart from "../charts/BarListChart";
import { mutedText, panel, sectionTitle } from "../ui";

type BreakdownSectionProps = {
  title: string;
  icon: IconType;
  rows: BreakdownRow[];
  // Names the chart for screen readers.
  description: string;
};

// Hours split by organization or by activity, as horizontal bars.
export default function BreakdownSection({
  title,
  icon: Icon,
  rows,
  description,
}: BreakdownSectionProps) {
  const rounded = rows.map((row) => ({ ...row, hours: roundHours(row.hours) }));
  return (
    <section className={`${panel} flex flex-col gap-4 p-4 sm:p-6`}>
      <h2 className={`${sectionTitle} flex items-center gap-2`}>
        <Icon aria-hidden="true" />
        {title}
      </h2>
      {rounded.length === 0 ? (
        <p className={mutedText}>Chưa có giờ trong khoảng này.</p>
      ) : (
        <BarListChart rows={rounded} description={description} />
      )}
    </section>
  );
}
