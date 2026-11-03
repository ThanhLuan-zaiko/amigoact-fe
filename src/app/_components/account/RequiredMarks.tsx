import { mutedText } from "../ui";

// Shown after the label of a required field. The input's own "required" tells screen readers.
export function RequiredMark() {
  return (
    <span aria-hidden="true" className="ml-0.5 text-red-700 dark:text-red-400">
      *
    </span>
  );
}

// Explains the marker once, above a form that has required fields.
export function RequiredLegend() {
  return (
    <p className={mutedText}>
      <span aria-hidden="true" className="text-red-700 dark:text-red-400">
        *
      </span>{" "}
      Trường bắt buộc
    </p>
  );
}
