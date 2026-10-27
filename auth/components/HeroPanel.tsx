import type { ReactElement } from "react";
import type { IconType } from "react-icons";
import { FiActivity } from "react-icons/fi";
import { Section } from "../../core/components/Section.tsx";

export interface HeroItem {
  Icon: IconType;
  title: string;
  body: string;
}

interface HeroPanelProps {
  eyebrow: string;
  headline: string;
  lead: string;
  items: HeroItem[];
  numbered?: boolean;
}

// Inverted brand panel shared by the auth and account pages: a dotted
// grid backdrop, oversized headline and a hairline-divided item grid.
// Pure zinc, borders only, no motion (see AGENTS.md design rules).
export function HeroPanel({
  eyebrow,
  headline,
  lead,
  items,
  numbered = false,
}: HeroPanelProps): ReactElement {
  return (
    <Section>
      <div className="@container rounded-2xl border border-zinc-200 text-zinc-900 dark:border-zinc-800 dark:text-zinc-100">
        <div className="flex flex-col gap-6 p-5 @md:p-7">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FiActivity className="h-5 w-5" aria-hidden="true" />
              <span className="text-base font-semibold tracking-tight">
                AmigoACT
              </span>
            </div>
            <span className="text-[11px] font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
              {eyebrow}
            </span>
          </div>
          <div>
            <h2 className="text-3xl leading-tight font-semibold tracking-tight text-balance @md:text-4xl">
              {headline}
            </h2>
            <p className="mt-3 max-w-prose text-sm text-zinc-500 dark:text-zinc-400">
              {lead}
            </p>
          </div>
          <ul className="grid gap-5 @lg:grid-cols-3">
            {items.map(({ Icon, title, body }, index) => (
              <li
                key={title}
                className="flex flex-col gap-2"
              >
                <span className="flex items-center justify-between">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {numbered && (
                    <span className="font-mono text-xs text-zinc-500">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  )}
                </span>
                <span className="text-sm font-semibold">{title}</span>
                <span className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {body}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
