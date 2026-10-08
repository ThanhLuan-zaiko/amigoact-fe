# AGENTS.md — amigoact-fe

This file is the source of truth for AI agents and human contributors working in `amigoact-fe`.
Follow it strictly. Do not introduce patterns outside this document without updating it first.

## 1. Stack (Locked)

- Build: Vite `^8`, React `^19`, TypeScript `~7`, Tailwind CSS `^4` (`@tailwindcss/vite`).
- Package manager: `bun`.
- Router: `react-router-dom` only (`BrowserRouter` + `NavLink` for Navbar active state). No TanStack Router, no other routing libs.
- Data fetching: TanStack Query (`@tanstack/react-query`) only. No SWR, no Apollo, no `fetch` in components.
- Animation: `animejs` only. No `framer-motion`, no `gsap`, no CSS `@keyframes` sprawl outside `core/motion.ts` presets. All motion goes through `core/motion.ts` and respects `prefers-reduced-motion`.
- Icons: `react-icons` only. Every icon affordance (buttons, links, nav items, toggles, empty states) uses `react-icons`. No emoji-as-icon, no hand-copied inline SVG, no second icon package.
- Styling: Tailwind utility classes only. No new CSS files, no CSS modules, no `styled-components`, no Emotion, no inline `<style>` tags, no `style={}` objects for visual design (only for dynamic measured values with justification).
- Responsive strategy: mobile-first only (see §5.6 and §7.5). Base styles target `360px` mobile; enhance with `sm:` / `md:` / `lg:` / `xl:` min-width breakpoints. Desktop-first `max-*` breakpoints are forbidden except documented fixes.
- Lint: `oxlint`. Types: `tsc -b`. Build: `vite build`.

Required dependencies (add if missing):

```bash
bun add @tanstack/react-query react-router-dom animejs react-icons
bun add -d @tanstack/eslint-plugin-query  # optional but recommended
```

Backend contract: API base URL defaults to `http://localhost:8100` (FastAPI on port `8100`). Configure via `VITE_API_URL`. Always send cookies (`credentials: "include"`) because refresh uses an `HttpOnly` cookie. Contract parity, both directions: every frontend feature MUST have backend support, and every backend capability the product relies on MUST be surfaced in the frontend. Shipping one side without the other fails the quality gates in §9. New or changed backend error `code` values MUST be handled in the UI copy table in the same change.

## 2. File Size Rules (Hard Limits)

1. Every `*.tsx` file MUST be `<= 250` lines (including blanks, comments, JSX).
2. Every `*.ts` file MUST be `<= 350` lines.
3. Check before commit:
   ```bash
   bun -e "import {Glob} from 'bun'; let bad=[]; for await (const p of new Glob('**/*.{ts,tsx}').scan({cwd:'.', onlyFiles:true})) { if (p.startsWith('node_modules/') || p.startsWith('dist/')) continue; const n=(await Bun.file(p).text()).split('\n').length; const lim=p.endsWith('.tsx')?250:350; if(n>lim) bad.push(p+': '+n); } console.log(bad.length?bad.join('\n'):'OK')"
   ```
4. If a `.tsx` file exceeds 250 lines, split in this order:
   - Extract sub-sections into components in `<feature>/components/*.tsx`.
   - Extract data logic into `<feature>/hooks.ts` or `<feature>/api.ts` (TanStack Query).
   - Extract mappers/formatters/validators into `<feature>/utils.ts`.
   - Split pages by bento tile, never by arbitrary line ranges.
5. If a `.ts` file exceeds 350 lines, split by responsibility (`api.ts` / `hooks.ts` / `keys.ts` / `utils.ts` / `schemas.ts`).
6. Each new file must have one clear responsibility. Refactors that only move code must preserve behavior.

## 3. Project Structure: No `src/`, One Folder per Feature at Root

Do not create `src/`. Feature code lives in top-level folders directly under `amigoact-fe/`, mirroring the backend convention.

```text
amigoact-fe/
  main.tsx             # QueryClientProvider + router + theme init only
  App.tsx              # route shell only, no data fetching
  index.css            # ONLY tailwind import + @theme + dark variant (see §5)
  index.html
  core/
    api.ts             # fetch wrapper: baseURL, credentials:include, error envelope
    queryClient.ts     # QueryClient singleton + defaults
    theme.ts           # theme mode helpers (light/dark toggle, storage key)
    motion.ts          # animejs presets only (fade/slide/stagger, reduced-motion guard)
    components/
      PageShell.tsx    # single page shell: header + bento grid + footer slot
      Navbar.tsx       # global navbar: logo + 5 links + ThemeToggle + account cluster (§7.5)
      AccountMenu.tsx  # signed-in avatar dropdown: profile, change-password, logout
      ThemeToggle.tsx  # theme toggle button (react-icons + OS default per §6)
      BentoCard.tsx    # single card primitive (border only, no shadow)
      Button.tsx       # all buttons go through here
      TextField.tsx    # all inputs go through here
      Feedback.tsx     # ErrorState / EmptyState / LoadingState primitives
  auth/
    api.ts             # login/refresh/logout calls (no hooks here)
    keys.ts            # query-key factory, e.g. authKeys.session
    hooks.ts           # useSession(), useLogin(), useLogout() (TanStack Query)
    schemas.ts         # zod/valibot or plain TS types + validators
    messages.tsx       # Vietnamese UI copy table (ASCII gate forces .tsx, see §10)
    components/
      LoginCard.tsx
      RegisterCard.tsx
      AccountMenu.tsx  # avatar dropdown lives here when Navbar is unavailable
    page.tsx           # login screen (route /login), <= 250 lines
    register-page.tsx  # registration screen (route /register)
    # Multi-screen features may ship extra <screen>-page.tsx beside page.tsx
    # instead of nested folders. Every screen keeps Vietnamese UI copy.
  users/
    api.ts
    keys.ts
    hooks.ts
    components/
    page.tsx
  <feature>/
    api.ts
    keys.ts
    hooks.ts
    schemas.ts
    utils.ts
    components/
    page.tsx
```

Rules:

- `main.tsx` and `App.tsx` stay thin. No `fetch`, no business logic, no styling experiments.
- One root folder = one bounded context. No generic `components/` dumping ground at root; shared UI lives in `core/components/`.
- Cross-feature imports are allowed only from `core/` or through explicit `api.ts`/`hooks.ts` contracts, never deep component internals.
- Keep `tsconfig.app.json` `include` in sync with this layout (root files, not only `src/`), and keep `index.html` script path pointing at the real `main.tsx` location.

## 4. Data Fetching: TanStack Query Only

1. All server state goes through TanStack Query. Forbidden in components:
   - direct `fetch()` / `axios` calls,
   - `useEffect` fetch loops,
   - duplicated request logic across components.
2. Shape per feature:
   - `<feature>/api.ts`: pure async functions using `core/api.ts` (typed input/output, throws typed `ApiError`).
   - `<feature>/keys.ts`: key factory, e.g. `export const userKeys = { all: ['users'] as const, byId: (id: string) => [...userKeys.all, id] as const }`.
   - `<feature>/hooks.ts`: `useQuery` / `useMutation` wrappers only. No JSX here.
   - `<feature>/page.tsx` and `components/*.tsx`: call hooks, render `data/isPending/isError`, never call `api.ts` directly.
3. `QueryClient` defaults (`core/queryClient.ts`): `staleTime: 30_000`, `gcTime: 5 * 60_000`, `retry: 1` for queries, `refetchOnWindowFocus: false` unless a feature justifies otherwise.
4. Mutations must invalidate exact keys (`queryClient.invalidateQueries({ queryKey })`) and surface the backend error envelope `{ code, message }` through `Feedback.tsx`.
5. Auth session is server state: `useSession()` with `queryKey: authKeys.session`, `retry: false`, `staleTime: 60_000`. Login/refresh/logout are mutations that invalidate `authKeys.session`.

## 5. Styling: Tailwind Only, Border Only, No Shadows

1. Tailwind utilities only. `index.css` MUST stay minimal:
   ```css
   @import "tailwindcss";
   @custom-variant dark (&:where(.dark, .dark *));
   /* @theme tokens for brand #aff092 + semantic colors only. No component CSS. */
   ```
   No additional `.css` files. No `@apply` component classes except documented tokens.
2. Borders, never shadows. Forbidden everywhere (including arbitrary values and inline styles):
   - `shadow-*`, `drop-shadow-*`, `box-shadow`, `ring-*` (ring renders as shadow), `text-shadow`.
   - Use instead: `border`, `border-{color}`, `divide-*`, `outline-*` for focus only.
   - Standard card border: `border border-zinc-200 dark:border-zinc-800`. Subtle separation: `divide-zinc-200 dark:divide-zinc-800`.
3. Radius/spacing scale (do not invent new ones per page):
   - Cards: `rounded-2xl`, padding `p-4 sm:p-6`.
   - Inner elements: `rounded-xl`; pills/inputs: `rounded-lg` (inputs) / `rounded-full` (badges, toggles).
   - Gaps: bento grid `gap-4 sm:gap-6`; stack `space-y-4`; inline `gap-2 sm:gap-3`.
4. Focus must be visible and custom (never rely on browser default glow):
   - Interactive primitives use e.g. `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand dark:focus-visible:outline-brand`.
   - Never remove focus indication (`outline-none` without a `focus-visible:` replacement is forbidden).
5. Before commit, search for violations:
   ```bash
   bun -e "import {Glob} from 'bun'; const re=/shadow|drop-shadow|box-shadow|\bring-/; for await (const p of new Glob('**/*.{tsx,ts,css}').scan({cwd:'.',onlyFiles:true})) { if(p.startsWith('node_modules/')||p.startsWith('dist/')) continue; const t=await Bun.file(p).text(); t.split('\n').forEach((l,i)=>{ if(re.test(l)) console.log(p+':'+(i+1)+': '+l.trim()) }) }"
   ```
6. Mobile-first responsive (locked):
   - Write base utilities for mobile (`360px`, single column, `min-h`, `p-4`, `text-*` base). Add complexity only via `sm:` (`640px`), `md:` (`768px`), `lg:` (`1024px`), `xl:` (`1280px`) min-width prefixes.
   - Forbidden: desktop-first `max-sm:` / `max-md:` / `max-lg:` chains as the primary layout strategy, fixed pixel widths that overflow `360px`, horizontal scroll, and per-page breakpoint inventions.
   - Every page and `Navbar` MUST be verified at `360px` (no overflow), `768px`, `1024px`, `1440px` in both themes before merge (screenshots for new shells).

## 6. Theme: Light/Dark + Brand Accent (#AFF092) + Semantic Colors Only

1. Modes: `light` and `dark` are the primary themes. Toggle via `.dark` class on `<html>` (see `@custom-variant` above), persisted in `localStorage` under key `amigoact-theme` (`"light" | "dark"`), defaulting to OS preference on first visit. No additional themes, no `system` mode after the first resolution (explicit user choice always wins).
   - First-visit resolution order: (a) stored `amigoact-theme` if present; else (b) `window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'`.
   - `main.tsx` MUST run theme init before first paint, and `index.html` MUST contain a blocking inline `<script>` in `<head>` that reads `amigoact-theme` (or OS preference when absent) and sets/removes `.dark` to avoid FOUC. No `style={}` theming, no theme logic in `App.tsx`.
   - `core/theme.ts` owns: storage key constant, `getStoredTheme()`, `resolveInitialTheme()`, `applyTheme(mode)`, `toggleTheme()`. Components never touch `localStorage` or `document.documentElement.classList` directly.
   - `ThemeToggle` (in `core/components/ThemeToggle.tsx`) is the only toggle: `react-icons` sun/moon pair (`h-5 w-5`), `aria-label` in Vietnamese, `aria-pressed`, `>= 44px` target, subtle `animejs` icon cross-fade via `core/motion.ts`, disabled motion when `prefers-reduced-motion` is set.
2. Palette (do not add hues without updating this file):
   - Base: light `bg-white text-zinc-900`, dark `bg-zinc-950 text-zinc-100`. Muted text: `text-zinc-500 dark:text-zinc-400`.
   - Decoration/accent: brand only — single token `--color-brand: #AFF092` in `index.css`, no other custom hex. Solid fills use `bg-brand text-zinc-950` (both modes, hover `bg-brand/85`); subtle surfaces use `bg-brand/10` with `border-brand/40` (dark `border-brand/30`); text stays `zinc` for contrast except dark-mode accents (`dark:text-brand`). Brand is the ONLY decorative custom color.
   - Error: red — `red-600 dark:red-400`, subtle `red-50 dark:red-950`, border `red-200 dark:red-800`. Reserved for errors/destructive actions.
   - Warning: amber/yellow — `amber-600 dark:amber-400`, subtle `amber-50 dark:amber-950`. Reserved for warnings.
   - Success/info: emerald/green for success, brand for info (same brand scale as accent, distinguished by icon + label, never by a new hue). Reserved meanings must not be swapped (no green errors, no red info).
   - Forbidden as UI chrome: purple, pink, orange, teal, cyan, blue, indigo (except inside static illustrations/logos with justification).
3. Every color usage must carry both modes: each colored class needs its `dark:` counterpart (or an explicit comment why it is mode-invariant).
4. Contrast: body text and interactive elements must remain readable in both modes. Brand `#AFF092` is light, so solid fills always pair with `text-zinc-950`, never white text and never lime body text on white. Decorative brand is never used for body text on light backgrounds without a contrast check.

## 7. Design Language: Unified Bento Grid, Zero Drift

1. Bento grid is the only page language:
   - Page structure is always `PageShell > bento grid > BentoCard tiles`. No ad-hoc page layouts.
   - Exception: `/manage` renders one full-row tile (`lg:col-span-12`) that holds an internal `flex flex-col gap-4 lg:flex-row` layout with a left sidebar (`aside`) and a right viewport (`section`). Both regions still render `BentoCard` tiles inside; the exception covers only the two-column shell, never card styling.
   - Grid: `grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-6 lg:grid-cols-12`. Tiles span via `md:col-span-*` / `lg:col-span-*` (typical tiles: `lg:col-span-4`, heroes: `lg:col-span-8`, full rows: `lg:col-span-12`).
   - Tiles are `BentoCard` only: `rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-950`. No per-page card restyling (padding/border/radius changes require updating `BentoCard`, not overrides).
2. Consistency rule: the first shipped page sets the shell (header height, grid, gaps, card style, typography). Every later page MUST reuse `PageShell`, `BentoCard`, `Button`, `TextField`, `Feedback`. A page that looks or spaces differently is a defect.
   - Typography scale only: display `text-2xl sm:text-3xl font-semibold tracking-tight`, card title `text-base sm:text-lg font-semibold`, body `text-sm text-zinc-600 dark:text-zinc-400`, caption `text-xs text-zinc-500 dark:text-zinc-400`.
   - Icons: `react-icons` only, one family per release (e.g. Feather `Fi*` or Heroicons `Hi2*` — do not mix families on one screen), one stroke width, fixed sizes (`h-4 w-4` inline, `h-5 w-5` card headers and navbar). Every icon-only button has a Vietnamese `aria-label`. No emoji-as-icon.
3. Responsive behavior: mobile-first single-column stacking, `md:` 6-col, `lg:` 12-col. No horizontal scroll at `360px`. Touch targets `>= 44px` for primary actions. Base classes are mobile; `sm:/md:/lg:` only add columns, spacing, and type scale.
4. States are part of the design, not afterthoughts: every data tile specifies `loading` (skeleton), `empty`, and `error` via `Feedback.tsx` with the semantic colors from §6. No blank tiles, no `console.log` errors, no browser `alert()`.
5. Navbar (locked spec, `core/components/Navbar.tsx` through `PageShell`):
   - Order left to right: brand logo (links to `/`, Vietnamese label "Trang chủ" on logo `aria-label`) + primary links + trailing cluster `ThemeToggle` + login `Button`.
   - Primary links (Vietnamese labels, English routes, `react-router-dom` `NavLink` with active `aria-current="page"`): `Trang chủ -> /`, `Sự kiện -> /events`, `Tổ chức -> /orgs`, `Bảng xếp hạng -> /leaderboard`, `Bảng điều khiển -> /manage`. Auth screens live at `/login`, `/register`, `/verify` (kept functional while the verification gate is deferred), `/forgot-password`, `/reset-password` (guest-only via `RequireGuest`; signed-in users redirect to `/`), `/profile`, `/change-password` (auth-only via `RequireAuth`; guests redirect to `/login`). Registration signs the user in immediately and lands on `/` (falls back to `/login` with a notice only if the auto sign-in fails). Change-password requires the new password to differ from the current password (code `SAME_AS_CURRENT`, validated live on change). `/manage` is the self-serve workspace where individuals or businesses create and manage organizations, clubs, and groups via a left sidebar plus a right viewport (legacy `/my-dashboard/*` URLs redirect to `/manage/*`; the feature folder is `dashboard/`).
   - Trailing account cluster: guests see a login `Button` (variant `primary`, leading `react-icons` login icon, label `Đăng nhập -> /login`); signed-in users (via `useSession()`) see `AccountMenu`: avatar circle with the name initial + full name (`hidden sm:inline`), opening a small dropdown (`Hồ sơ -> /profile`, `Đổi mật khẩu -> /change-password`, `Đăng xuất` action) with `Esc`/outside-click close, `animejs` open animation, and focus return. The visibility eye on password fields is mouse-only (`tabIndex={-1}`) with a shared per-form state, and every field validates live on change.
   - Each nav link pairs a `react-icons` glyph + label (`h-4 w-4 sm:h-5 sm:w-5`, `gap-2`); icon is decorative (`aria-hidden="true"`) when the text label is visible, informative with `aria-label` when collapsed to icon-only.
   - Layout mobile-first: `360px` shows brand + hamburger (`FiMenu`/`FiX`) + `ThemeToggle` + compact login; menu panel expands below header with a short `animejs` slide/fade via `core/motion.ts` and traps no scroll. `md:` and up shows one horizontal row (`hidden md:flex` for links, `md:hidden` for hamburger). Sticky `top-0 z-40` header with `border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur`, never `shadow`/`ring`.
   - Active link: `bg-brand text-zinc-950 dark:bg-brand dark:text-zinc-950` pill (`rounded-full`) or underline bar; inactive: `text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100`. Focus uses §5.4 outline. Keyboard: hamburger is a real `Button`, `aria-expanded` + `aria-controls`, `Esc` closes, focus returns to the trigger.
6. Motion (`animejs` only, via `core/motion.ts`):
   - Allowed uses: navbar mobile-panel open/close, page/hero entrance (fade + `translateY 8-12px`), list stagger (`30-50ms`), `ThemeToggle` icon cross-fade, micro-feedback on primary buttons. Durations `150-300ms`, easing `ease-out`.
   - Forbidden: looping/ambient animation on chrome, scroll-jacking, parallax, layout-thrashing loops, per-page `anime()` one-offs bypassing `core/motion.ts`, any second animation library.
   - Accessibility: `core/motion.ts` MUST check `window.matchMedia('(prefers-reduced-motion: reduce)')` and skip/jump-to-end when set. No content may depend on animation to be visible (final state is always rendered even if `animejs` fails to load).
7. Icons (`react-icons` everywhere):
   - Every button (`Button`, nav link, icon-button, `ThemeToggle`, empty-state action) renders a `react-icons` glyph at a fixed size. Buttons without an icon are defects unless justified in the PR.
   - Allowed: one family per release, tree-shaken named imports (e.g. `import { FiHome } from 'react-icons/fi'`). Forbidden: `react-icons` wildcard star imports, emoji icons, pasted raw SVG paths, adding `lucide-react` / `@heroicons` alongside `react-icons`.
8. Buttons: compact, content-sized, never stretched horizontally:
   - All buttons go through `core/components/Button.tsx` with locked size variants only (e.g. `sm: px-3 py-1.5 text-sm`, `md: px-4 py-2 text-sm`). No per-page padding inventions such as `px-8 / px-10 / px-12` or arbitrary `px-[...]` to make buttons look longer.
   - Buttons are `inline-flex items-center justify-center gap-2 whitespace-nowrap` and size to their content (icon + label). Forbidden: horizontally long buttons with excess horizontal padding and empty space on both sides.
   - Forbidden stretch patterns: `w-full` on desktop or inside toolbars/cards, `flex-1` / `grow` buttons in a row, `justify-between` stretching a single label across the full tile width. `w-full` is allowed only for a single-column form submit on mobile (`360px`) with justification, and must revert to content-sized (`sm:w-auto`) from `sm:` up.
   - Reach the `>= 44px` touch target with height (`py-2 / min-h-[44px]`), never by widening horizontal padding. Icon stays fixed (`h-4 w-4` inline, `h-5 w-5` headers/navbar) with `gap-2`; do not pad the icon away from the label.
   - A button that looks like a wide empty bar with small centered text is a defect. Review new buttons side-by-side with existing `Button` variants for drift.
9. Deep-linkable tabs (locked):
   - Every tab or sidebar view inside a single page MUST have its own URL.

## 8. No Browser-Default Chrome

Minimize anything that looks like an unstyled browser:

- Never render bare `<button>`, `<a>`, `<input>`, `<select>`, `<textarea>` — always use `core/components/` primitives.
- Links have deliberate styles (`text-zinc-900 underline decoration-brand decoration-2 underline-offset-2 hover:bg-brand/15 dark:text-brand` or button styles), never default blue-underline UA styling by accident.
- Form controls: custom borders (`border-zinc-300 dark:border-zinc-700`), `rounded-lg`, explicit `placeholder:text-zinc-400`, `appearance-none` for selects with a custom chevron icon. No default OS bevels.
- Scrollbars/number spinners: normalize where they break the grid aesthetic; do not ship pages with mixed native and custom control styles.
- Favicon/title/meta in `index.html` must be set per release; no `vite.svg` leftovers, no `lorem ipsum`.

## 9. TypeScript, Accessibility, and Quality Gates

- Strict TypeScript: no `any` (use `unknown` + narrowing), no unused locals/params, explicit return types on exported functions, typed API contracts per feature.
- React: functional components only, no class components; keys on lists; no nested component definitions inside render; effects only for non-server concerns (theme, focus, subscriptions).
- Accessibility: semantic landmarks (`header/main/nav/footer`), labels for every input, `aria-busy`/`aria-live` on async tiles, keyboard-reachable actions, visible focus per §5.4.
- DoD for every change:
  1. `bun run build` (tsc + vite) passes.
  2. `bun run lint` passes with no new warnings.
  3. `.tsx <= 250` / `.ts <= 350` lines; Tailwind-only; zero `shadow`/`ring` hits; every color has `dark:` coverage.
  4. Data flows through TanStack Query hooks with loading/empty/error states on the bento grid.
  5. New/changed tiles reviewed side-by-side with an existing page for drift (spacing, cards, type, colors).
  6. Mobile-first + motion + icons + theme verified: no overflow at `360px`; only `animejs` via `core/motion.ts` with `prefers-reduced-motion` guard (no second animation lib); every button/nav affordance renders a `react-icons` glyph with Vietnamese accessible label; first-visit theme follows OS (`prefers-color-scheme`) with no FOUC and persisted toggle; `Navbar` order/routes/labels match §7.5 (`/`, `/events`, `/orgs`, `/leaderboard`, `/manage`, `ThemeToggle`, `/login`).

## 10. Documentation, Code, and UI Language

1. `AGENTS.md` (this file) is the ONLY Markdown file written in English.
2. Every other `*.md` file in this repo (`README.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `docs/*.md`) MUST be written in Vietnamese.
3. Markdown rule: code, identifiers, commands, and error codes stay in English. Only prose/explanations are in Vietnamese.
4. Frontend code rule — English only: all `*.ts`/`*.tsx` code MUST be written entirely in English. This includes identifiers, types, comments, TSDoc, console/dev logs, query keys, and test names. Vietnamese is forbidden in code and comments. Exception: Vietnamese UI string literals and the dedicated UI copy tables (e.g. `messages.tsx`) — the `.ts` ASCII-only gate requires those tables to live in `.tsx` modules, never in `.ts`.
5. End-user UI rule — Vietnamese only: every string rendered to ordinary users MUST be in Vietnamese. This includes page titles, headings, buttons, labels, placeholders, empty states, and user-facing error/success messages mapped from the backend `{ code, message }` envelope. Do not ship English UI copy to end users. Developer-only surfaces (console logs, `data-testid`, error `code`) stay in English.
6. A change that violates the Markdown, code, or UI language rule fails the quality gates in §9.

## 11. Git, GitHub, and Docker Discipline

1. Never commit and never push to GitHub unless the user explicitly requests it (e.g. "commit", "push", "đẩy code", "tạo PR"). Finishing code is NOT permission to commit or push. No auto-commit, no auto-push, no background sync.
2. After every coding task, run `git status --short` (and `git diff --stat` when files were modified) and report the result to the user before stopping. The working tree must be left in a reviewed, intentional state.
3. Never commit junk. Junk includes: `node_modules/`, `dist/`, `dist-ssr/`, `coverage/`, `*.local`, logs (`*.log`, `logs/`), editor/OS files (`.DS_Store`, `Thumbs.db`), and local `.env` files. When `git status` reveals an untracked junk pattern, add the pattern to `.gitignore` instead of committing the file. Never use `git add -A` blindly; stage only intentional paths.
4. Docker packaging is forbidden unless the user explicitly requests it. Forbidden without request: writing new `Dockerfile`/`compose*.yml` packaging, running `docker build`, `docker push`, `docker run`/`compose up` for packaging, and publishing images. The `Dockerfile`, `.dockerignore`, and CI docker-build gate already in this repo are the one-time explicitly requested setup — they validate with `push: false` only. Rebuilding, publishing (`push: true`), or adding new images/registries still requires a fresh explicit user request.
5. CI is defined in `.github/workflows/` as 12 required gates (see `ci.yml`: git-hygiene, file-lines, no-shadow-css, query, english-comments, vietnamese-ui, docs-language, structure, types, lint, docker-build, ci-success). A PR is mergeable only when all 12 gates are green. Do not weaken gates to make a PR pass.

## 12. Realtime: WebSocket + Speculation Rules First

Realtime updates and instant navigation are designed in from day one: WebSocket for live data, Speculation Rules API for prerender/prefetch. No polling-first, no prefetch library, no third-party realtime SaaS.

1. WebSocket client lives in exactly one module: `core/realtime.ts`. It owns ticket fetch (`POST /ws/tickets`), `WebSocket` lifecycle, exponential-backoff reconnect, heartbeat watchdog, and resubscribe-on-reconnect. Components and features never call `new WebSocket` directly — they use typed hooks from `<feature>/hooks.ts` (e.g. `useLiveAttendance(activityId)`).
2. TanStack Query stays the source of truth (§4). WS messages only invalidate exact query keys or apply narrow deltas — never replace whole caches. Every live tile keeps the same loading/empty/error states via `Feedback.tsx`.
3. Channels mirror the backend (§16 of backend AGENTS.md): `notifications:{userId}`, `attendance:{activityId}`, `activities:{orgId}`. Subscribe only to channels the current user is authorized for; render `403`-style denial through `Feedback.tsx` in Vietnamese, never a blank tile.
4. Speculation Rules API from day one: `index.html` MUST contain a `<script type="speculationrules">` block with same-origin `prefetch` (moderate eagerness) and `prerender` for safe GET navigations. Exclude `/auth/*`, logout, export downloads, and any mutation URL. When routes are added, the rules JSON is updated in the same change. No `instant.page`-style library, no manual `<link rel="prefetch">` hacks.
5. Language: all user-visible realtime copy (toasts, connection banners, live badges) is Vietnamese (§10.5). Connection loss shows a `Feedback`-style banner with retry, never `alert()` or console-only errors.
6. DoD for realtime work: reconnect + resume verified, query invalidation asserted in tests, speculation-rules JSON validated (parses, excludes unsafe URLs), light/dark screenshots of live states attached to the PR.
