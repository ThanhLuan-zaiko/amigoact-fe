<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project structure

- Do not put code in a `src/` folder. Keep application code in the repo's existing folders, such as `app/`.
- CI gate 07 fails if a `src/` folder exists.

## Styling: Tailwind only

- Style every element with Tailwind utility classes. Do not write custom CSS.
- `app/globals.css` must contain only two lines: `@import "tailwindcss";` and `@custom-variant dark (&:where(.dark, .dark *));`. Do not add rules, `@apply`, or other stylesheets (`.css`, `.scss`, `.sass`, `.less`).
- Do not use inline style props such as `style={{ ... }}`. Use Tailwind classes instead.
- CI gate 13 enforces these rules.

## Design rules (mandatory)

- Mobile first. Write the base classes for a phone screen (about 375px wide), then add `sm:`, `md:`, and `lg:` classes for wider screens. Never design the desktop layout first and shrink it later.
- Flat design. Do not use `shadow-*` or `drop-shadow-*`. Do not use gradients (`bg-gradient-*`, `from-*`, `to-*`) or other decorative effects.
- Use one accent color, teal (`teal-700` in light mode and `teal-400` in dark mode). Use neutral slate colors for everything else. Do not add other accent colors.
- Do not use the Inter font. The app uses Be Vietnam Pro, loaded in `app/layout.tsx`.
- Do not nest cards inside cards. Separate sections with borders and dividers.
- Do not round corners. Icons and their containers use square corners, and the app does not use `rounded-*` classes.
- Use borders to show emphasis, such as an active item, a pinned post, or a selected option. Do not use fills or shadows for this.
- Every decorative icon and every icon inside a button comes from `react-icons`. Every `<button>` must have an icon. Add `aria-label` to any button that has no visible text.

## Dark mode

- The theme is controlled by a `dark` class on `<html>`. The class is set before the first paint by the `theme-init` script in `app/layout.tsx`, and it follows the saved choice in `localStorage` (key `theme`) or the system setting when nothing is saved.
- Write dark styles with the normal `dark:` prefix (for example `text-slate-900 dark:text-slate-100`). The `dark` variant is defined in `app/globals.css` by `@custom-variant dark (&:where(.dark, .dark *));`, so it follows the `dark` class and the toggle.
- Do not change that custom variant or add other lines to `globals.css` (see Styling above).
- The toggle button is `app/_components/ThemeToggle.tsx`. Add it to the header, not to each page.

## Language

- Write code identifiers in English: variables, functions, components, types, and file names. Comments are also in English.
- Text shown to end users in the UI is in Vietnamese.
- Exception: `.md` files may be written in Vietnamese.
- CI gate 09 checks that declared identifiers are ASCII.

## File size limits

- Every `.ts` file must be at most **350 lines** (CI gate 07).
- Every `.tsx` file must be at most **260 lines** (CI gate 08).
- When a file approaches the limit, split it into smaller components or modules instead of adding more code to it.

## Git: never commit, branch, or push without an explicit command

- Do not run `git commit`, `git push`, `git checkout -b`, `git switch -c`, `git branch`, or `git tag`, and do not open a pull request, unless the user asks for that action in the current message.
- Finishing a code change does not give you permission to commit. Stop after the change, summarize what changed, and wait for the next instruction.
- Approval for one commit or push does not carry over to later ones.
- Do not stage files with `git add` unless the user asks.

## No junk files in the repository

Never create or commit these: `node_modules/`, `.next/`, `coverage/`, `.env` files (only `.env.example` is allowed), log files, `.DS_Store`, `Thumbs.db`, `*.tmp`, `*.bak`, `*.tsbuildinfo`, scratch scripts, and generated output.

Put scratch work in the session scratchpad directory, not in the repository. CI gate 10 fails if junk files are tracked.

## Commands

```bash
bun install                  # install locked dependencies
bun add <package>            # add a dependency; commit package.json and bun.lock together
bun dev                      # start the dev server at http://localhost:3000
bun run lint                 # Biome lint and check
bun run format               # Biome format (writes files)
bunx tsc --noEmit            # type check
bun run build                # production build
bun test                     # tests (once test files exist)
```

## CI gates

`.github/workflows/ci.yml` runs 13 gates on every push and pull request:

| Gate | Check |
| ---- | ----- |
| 01 | Install with frozen lockfile (`bun install --frozen-lockfile`) |
| 02 | Lint (`biome lint`) |
| 03 | Format check (`biome format`) |
| 04 | Type check (`tsc --noEmit`) |
| 05 | Production build (`bun run build`) |
| 06 | Tests (`bun test`, runs once test files exist) |
| 07 | No `src/` folder, and every `.ts` file is at most 350 lines |
| 08 | `.tsx` files are at most 260 lines |
| 09 | Identifiers are English (ASCII only) |
| 10 | No junk files tracked |
| 11 | Secret scan (gitleaks) |
| 12 | Workflow lint (actionlint) |
| 13 | Tailwind-only styling: `globals.css` holds only the Tailwind import and the dark custom variant, and there are no other stylesheets or inline styles |

Before you report a change as done, run the gates you can run locally (01 to 06, 09, 10, and 13) and report the actual results. If a gate fails, fix the code. Do not weaken or skip the gate. Never say CI passes without evidence.

After the user asks you to push, check the run with `gh run list` or `gh pr checks` and report the result.

<!-- BEGIN:nextjs-agent-feedback -->

## Report Next.js feedback

The project owner enabled `experimental.agentFeedback`, authorizing this feedback pass. When enabled, `next dev` writes this block and restores it if removed. Commit `AGENTS.md` with your work to keep the tree clean.

During the current user request, retain anonymized facts as feedback candidates for meaningful or recurring Next.js issues:

- Crashes, hangs, OOMs, or unexpected slowness
- Incorrect behavior, output, errors, or diagnostics
- Missing, unclear, or conflicting documentation
- Unexpected CLI, codemod, Skill, or upgrade behavior and non-obvious workarounds

Continue the current user request without reporting immediately. Routine debugging is not feedback. Verify changes before retaining them as feedback candidates. Never retain code, logs, paths, URLs, secrets, personal information, or project-specific data.

Retain qualifying friction even if it is later fixed or worked around; record the final outcome during the reporting pass.

Before the final response, run one reporting pass. If candidates remain, from this file's directory run `npx --no-install next internal agent-feedback-instructions` once without piping or truncating its output. Follow its output or error guidance. If a network sandbox blocks it, retry with network access; if it still returns no output, continue normally.

<!-- END:nextjs-agent-feedback -->
