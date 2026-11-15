import { FiBarChart2 } from "react-icons/fi";
import {
  type Bucket,
  type PeriodHours,
  periodLabel,
  periodTitle,
  roundHours,
} from "@/lib/hoursStats";
import ColumnChart from "../charts/ColumnChart";
import { panel, sectionTitle } from "../ui";

type TrendSectionProps = { series: PeriodHours[]; bucket: Bucket };

// Hours by week or month, shared by the personal and the organization dashboard.
export default function TrendSection({ series, bucket }: TrendSectionProps) {
  const points = series.map((point) => ({
    key: point.period,
    label: periodLabel(point.period, bucket),
    title: periodTitle(point.period, bucket),
    awarded: roundHours(point.awarded),
    adjusted: roundHours(point.adjusted),
  }));
  const unit = bucket === "month" ? "tháng" : "tuần";
  return (
    <section className={`${panel} flex flex-col gap-4 p-4 sm:p-6`}>
      <h2 className={`${sectionTitle} flex items-center gap-2`}>
        <FiBarChart2 aria-hidden="true" />
        Giờ theo {unit}
      </h2>
      <ColumnChart
        points={points}
        names={{ awarded: "Được ghi", adjusted: "Điều chỉnh" }}
        description={`Giờ tình nguyện theo ${unit}`}
      />
    </section>
  );
}
