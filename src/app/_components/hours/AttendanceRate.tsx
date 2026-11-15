import { FiCheckCircle } from "react-icons/fi";
import { type MyHourStats, percentText } from "@/lib/hoursStats";
import MeterBar from "../charts/MeterBar";
import { mutedText, sectionTitle } from "../ui";

type AttendanceRateProps = { attendance: MyHourStats["attendance"] };

// Share of registrations of finished activities that came, with the counts beside it.
export default function AttendanceRate({ attendance }: AttendanceRateProps) {
  const finished = attendance.attended + attendance.absent;
  return (
    <section className="flex flex-col gap-2 p-4 sm:p-6">
      <h2 className={`${sectionTitle} flex items-center gap-2`}>
        <FiCheckCircle aria-hidden="true" />
        Tỉ lệ có mặt
      </h2>
      <p className="flex items-baseline justify-between gap-2">
        <span className="text-2xl font-bold">
          {percentText(attendance.rate)}
        </span>
        <span className={mutedText}>
          {attendance.attended}/{finished} lượt
        </span>
      </p>
      {attendance.rate === null ? (
        <p className={mutedText}>Chưa có hoạt động nào kết thúc.</p>
      ) : (
        <MeterBar value={attendance.rate} />
      )}
    </section>
  );
}
