# AGENTS.md — amigoact-fe

Source of truth for AI agents and contributors. Follow it strictly; add a rule here before using a new pattern.

## Stack and structure
- Vite, React 19, TypeScript, Tailwind CSS 4 (utilities only, no new CSS files), `bun`. Routing: `react-router-dom`. Server state: TanStack Query only.
- Icons: `react-icons` only, one family. No animation libraries, no CSS-in-JS.
- No `src/`. Each feature is a root folder: `api.ts`, `keys.ts`, `hooks.ts`, `schemas.ts`, `utils.ts`, `components/`, `page.tsx`. Shared UI lives in `core/`.
- Components call hooks only, never `api.ts` or `fetch`. `.tsx` <= 250 lines, `.ts` <= 350 lines.

## Data
- Mutations invalidate exact query keys and show backend `{ code, message }` errors via `Feedback.tsx`. Each new error code gets a Vietnamese copy entry in the same change.
- Every data section has loading, empty and error states. No `alert()`, no console-only errors.
- Realtime goes through `core/realtime.ts` only. WebSocket messages invalidate query keys; they never replace caches.

## Design
- Borders, never shadows: no `shadow-*`, `ring-*`, `drop-shadow-*`. Focus uses visible `focus-visible:` outlines.
- Neutral zinc chrome. Red = error, amber = warning, emerald = success. No purple, blue, indigo, teal, orange or pink. Every color needs a `dark:` pair.
- Theme: `.dark` on `<html>`, saved under `amigoact-theme`, OS preference on first visit. Only `core/theme.ts` touches storage.
- Mobile-first at 360px. Shell uses `sm:`/`lg:`/`xl:`; page content uses container queries. The `PageShell` centre column is `max-w-[600px]`, so inside it only `@md:` (448px), `@lg:` (512px) and `@xl:` (576px) can match; `@2xl:` (672px) and `@4xl:` (896px) never do.
- No entrance animations. Only loaders (`animate-spin`/`animate-pulse`) and the chat jump pulse may animate.
- Buttons are content-sized via `core/components/Button.tsx`, never `w-full` on desktop. Icon-only buttons need a Vietnamese `aria-label`.

## Language
- Code, comments, identifiers and query keys in English; end-user UI text in Vietnamese. `AGENTS.md` is the only English Markdown file; other `.md` files are Vietnamese.

## Quality and git
- Before finishing: `bun run build` and `bun run lint` pass; file-size and shadow checks pass; changed pages are checked at 360, 768, 1024 and 1440 px in both themes.
- Never commit or push unless the user explicitly asks. Never commit junk (`node_modules/`, `dist/`, `.env*`, logs); never `git add -A`.
- After each task, run `git status --short` and report it.
