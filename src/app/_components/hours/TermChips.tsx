import { hoursText } from "@/lib/attendance";
import { type MyHourStats, roundHours } from "@/lib/hoursStats";
import { sectionTitle, tagChip } from "../ui";

type TermChipsProps = { terms: MyHourStats["by_term"] };

// Hours per half-year term, as chips. Nothing shows without hours.
export default function TermChips({ terms }: TermChipsProps) {
  if (terms.length === 0) return null;
  return (
    <section className="flex flex-col gap-2 p-4 sm:p-6">
      <h2 className={sectionTitle}>Theo kỳ</h2>
      <div className="flex flex-wrap gap-2">
        {terms.map(({ term, hours }) => (
          <span key={term} className={tagChip}>
            {term}: {hoursText(roundHours(hours))}
          </span>
        ))}
      </div>
    </section>
  );
}
