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
- `app/globals.css` must contain only `@import "tailwindcss";`. Do not add rules, `@apply`, or other stylesheets (`.css`, `.scss`, `.sass`, `.less`).
- Do not use inline style props such as `style={{ ... }}`. Use Tailwind classes instead.
- CI gate 13 enforces these rules.

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
| 13 | Tailwind-only styling: `globals.css` holds only the Tailwind import, and there are no other stylesheets or inline styles |

Before you report a change as done, run the gates you can run locally (01 to 06, 09, 10, and 13) and report the actual results. If a gate fails, fix the code. Do not weaken or skip the gate. Never say CI passes without evidence.

After the user asks you to push, check the run with `gh run list` or `gh pr checks` and report the result.
