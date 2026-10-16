import type { FormQuestion } from "../activities/api.ts";

// The registration_forms table has no options column; 'choice' options
// ride in the label after a '|' separator.
export function parseQuestion(q: FormQuestion): {
  label: string;
  options: string[];
} {
  const [label, ...options] = q.label.split("|").map((s) => s.trim());
  return {
    label: label ?? q.label,
    options: q.field_type === "choice" ? options.filter(Boolean) : [],
  };
}
