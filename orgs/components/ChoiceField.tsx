import { useId, useState } from "react";
import type { ReactElement } from "react";
import type { MembershipQuestion } from "../api.ts";

// Sentinel for the "Khác" radio; it only lives in this component, never in the answer.
const OTHER = "__other__";

interface ChoiceFieldProps {
  question: MembershipQuestion;
  // The answer: one of the options, or the applicant's own text under "Khác".
  value: string;
  onChange: (value: string) => void;
}

// Single-choice question: radio options, plus a free-text "Khác" when the org allows it.
export function ChoiceField({ question, value, onChange }: ChoiceFieldProps): ReactElement {
  const groupId = useId();
  const isOption = question.options.includes(value);
  const [picked, setPicked] = useState<string | null>(() => {
    if (value === "") return null;
    return isOption ? value : OTHER;
  });
  const [otherText, setOtherText] = useState(!isOption ? value : "");

  function choose(next: string): void {
    setPicked(next);
    onChange(next === OTHER ? otherText.trim() : next);
  }

  function typeOther(text: string): void {
    setOtherText(text);
    if (picked === OTHER) onChange(text.trim());
  }

  const suffix = question.required ? " *" : "";
  const choices = question.allow_other ? [...question.options, OTHER] : question.options;

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
        {`${question.label}${suffix}`}
      </legend>
      {choices.map((choice) => {
        const id = `${groupId}-${choices.indexOf(choice)}`;
        const label = choice === OTHER ? "Khác" : choice;
        return (
          <div key={choice} className="flex flex-col gap-2">
            <label htmlFor={id} className="flex cursor-pointer items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200">
              <input
                id={id}
                type="radio"
                name={groupId}
                checked={picked === choice}
                onChange={() => choose(choice)}
                className="h-4 w-4 accent-zinc-900 dark:accent-zinc-100"
              />
              {label}
            </label>
            {choice === OTHER && picked === OTHER && (
              <input
                type="text"
                aria-label="Nội dung lựa chọn Khác"
                value={otherText}
                maxLength={200}
                placeholder="Nhập lý do của bạn"
                onChange={(event) => typeOther(event.target.value)}
                className="ml-6 w-[calc(100%-1.5rem)] border-b border-zinc-300 bg-transparent pb-1 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:text-zinc-100 dark:focus:border-zinc-100"
              />
            )}
          </div>
        );
      })}
    </fieldset>
  );
}
