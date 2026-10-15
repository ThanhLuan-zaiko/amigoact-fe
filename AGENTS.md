# AGENTS.md — amigoact-fe

This file is the source of truth for AI agents and human contributors working in `amigoact-fe`.
Follow it strictly. Do not introduce patterns outside this document without updating it first.

## 1. Stack (Locked)

- Build: Vite `^8`, React `^19`, TypeScript `~7`, Tailwind CSS `^4` (`@tailwindcss/vite`).
- Package manager: `bun`.
- Router: `react-router-dom` only (`BrowserRouter` + `Link`; rail active state comes from `core/nav-meta.ts` longest-prefix matching). No TanStack Router, no other routing libs.
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
   - Split pages by feed section, never by arbitrary line ranges.
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
    scroll.ts          # initErrorScroll(): MutationObserver smooth-scrolls to new role="alert" nodes inside <form>
    nav.tsx            # nav config + route titles (Vietnamese labels, so .tsx per §10)
    nav-meta.ts        # activeEntry() longest-prefix match + pageMeta() header title/back target
    rail-styles.ts     # shared rail class recipes (kept out of component files for Fast Refresh)
    dismiss.ts         # useDismiss(): Esc + outside-press close for popovers
    components/
      PageShell.tsx    # X-style three-column shell (§7.5): LeftRail | @container column | RightRail
      LeftRail.tsx     # logo + primary nav (+ nested /manage sections) + MoreMenu + CTA + AccountSwitcher
      RailNavItem.tsx  # rail pill link (icon + label, bold when active, badge)
      MoreMenu.tsx     # X "More" popover: secondary links, admin, labeled ThemeToggle
      AccountSwitcher.tsx # bottom-of-rail avatar/name/email + popover (profile, password, logout)
      CenterHeader.tsx # sticky blurred column header: title, back arrow, phone drawer trigger
      RightRail.tsx    # search pill + personal/discovery RailCards + footer
      RailCards.tsx / RailCard.tsx # right-rail widgets (X widget box, edge-to-edge rows)
      MobileTabBar.tsx # phone bottom tab bar
      NavDrawer.tsx    # phone navigation drawer
      ThemeToggle.tsx  # theme toggle (icon button, or `labeled` menu row) (react-icons + OS default per §6)
      Section.tsx      # single page surface: full-bleed feed row separated by hairlines
      Button.tsx       # all buttons go through here
      TextField.tsx    # all inputs go through here
      SelectField.tsx  # all selects/dropdowns go through here; native <select> is forbidden
      Feedback.tsx     # ErrorState / EmptyState / LoadingState primitives
      ToastViewport.tsx # bottom-center toast region fed by pushToast() (core/toast.ts)
      Modal.tsx        # portaled dialog shell (Esc, outside-press, focus restore, scroll lock)
      ConfirmDialog.tsx # destructive/risky confirm built on Modal (`danger` renders the red confirm)
  auth/
    api.ts             # login/refresh/logout calls (no hooks here)
    keys.ts            # query-key factory, e.g. authKeys.session
    hooks.ts           # useSession(), useLogin(), useLogout() (TanStack Query)
    schemas.ts         # zod/valibot or plain TS types + validators
    messages.tsx       # Vietnamese UI copy table (ASCII gate forces .tsx, see §10)
    components/
      LoginCard.tsx
      RegisterCard.tsx
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
5. Mutation toasts are centralized: the `MutationCache` in `core/queryClient.ts` reads `mutation.options.meta` and pushes toasts globally. Declare `meta: { successToast: "feature.action" }` on the mutation to opt in — keys resolve through `core/mutation-copy.tsx` (Vietnamese titles live there because `.ts` files are ASCII-only). `.tsx` callers may pass a literal title through a hook's `successTitle` param (it resolves to itself). No `meta` = silent: use that for flows whose UI already confirms (auth redirects, chat send, per-block editor uploads, realtime-driven member events). Never call `pushToast` inside `onSuccess` for generic success feedback; keep `pushToast` only for event-driven/realtime toasts.
6. Auth session is server state: `useSession()` with `queryKey: authKeys.session`, `retry: false`, `staleTime: 60_000`. Login/refresh/logout are mutations that invalidate `authKeys.session`.

## 5. Styling: Tailwind Only, Border Only, No Shadows

1. Tailwind utilities only. `index.css` MUST stay minimal:
   ```css
   @import "tailwindcss";
   @custom-variant dark (&:where(.dark, .dark *));
   /* No custom theme tokens: zinc scale + semantic colors only. No component CSS. */
   ```
   No additional `.css` files. No `@apply` component classes except documented tokens.
   Single allowed exception: one global slim-scrollbar block in `index.css` (Firefox `scrollbar-width`/`scrollbar-color` plus WebKit pseudo-elements, zinc tokens only, both themes covered). Feature code never hand-writes scrollbar CSS; every scrollable pane inherits it. Second exception: the two desktop rails (`LeftRail` nav, right-rail `aside`) hide their scrollbars via the shared `RAIL_SCROLL` recipe in `core/rail-styles.ts` (`overflow-y-auto` plus Tailwind-only scrollbar hiding) so rail chrome stays clean; the panes remain scrollable by wheel, touch and keyboard.
2. Borders, never shadows. Forbidden everywhere (including arbitrary values and inline styles):
   - `shadow-*`, `drop-shadow-*`, `box-shadow`, `ring-*` (ring renders as shadow), `text-shadow`.
   - Use instead: `border`, `border-{color}`, `divide-*`, `outline-*` for focus only.
   - Standard card border: `border border-zinc-200 dark:border-zinc-800`. Subtle separation: `divide-zinc-200 dark:divide-zinc-800`.
3. Radius/spacing scale (do not invent new ones per page):
   - Page sections: no radius, `px-4 py-4`, separated by `border-b` hairlines (the column itself owns the side borders). Right-rail widgets (`RailCard`) and embedded surfaces inside a section (media cards, quote boxes, `Feedback` states): `rounded-2xl border`. Modals: `rounded-2xl`.
   - Inner elements: `rounded-xl`; buttons `rounded-full` pills (X style); inputs `rounded-lg`; badges/toggles `rounded-full`.
   - Gaps: the column is a `flex flex-col` stack with zero gap (hairlines do the separating); internal stacks `flex flex-col gap-4`; inline `gap-2 sm:gap-3`.
4. Focus must be visible and custom (never rely on browser default glow):
   - Interactive primitives use e.g. `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:focus-visible:outline-zinc-400`.
   - Never remove focus indication (`outline-none` without a `focus-visible:` replacement is forbidden).
5. Before commit, search for violations:
   ```bash
   bun -e "import {Glob} from 'bun'; const re=/shadow|drop-shadow|box-shadow|\bring-/; for await (const p of new Glob('**/*.{tsx,ts,css}').scan({cwd:'.',onlyFiles:true})) { if(p.startsWith('node_modules/')||p.startsWith('dist/')) continue; const t=await Bun.file(p).text(); t.split('\n').forEach((l,i)=>{ if(re.test(l)) console.log(p+':'+(i+1)+': '+l.trim()) }) }"
   ```
6. Mobile-first responsive (locked):
   - Write base utilities for mobile (`360px`, single column, `min-h`, `p-4`, `text-*` base). Add complexity only via `sm:` (`640px`), `md:` (`768px`), `lg:` (`1024px`), `xl:` (`1280px`) min-width prefixes.
   - Forbidden: desktop-first `max-sm:` / `max-md:` / `max-lg:` chains as the primary layout strategy, fixed pixel widths that overflow `360px`, horizontal scroll, and per-page breakpoint inventions.
   - Two responsive axes (locked): the shell (`core/components/PageShell.tsx` and its rails/header/tab bar/drawer) uses viewport prefixes `sm:`/`lg:`/`xl:`. Everything rendered inside the center column (pages, sections, nested grids) uses container-query prefixes against `main.@container`: `@2xl:` (>= 672px, replaces `md:`) and `@4xl:` (>= 896px, replaces `lg:`). Viewport `md:`/`lg:`/`xl:` inside page content is forbidden, because the column is narrower than the viewport. `@2xl:`/`@4xl:` stay inert on the uniform 600px column, which is intended. `sm:` stays allowed for padding/type tweaks.
   - Fixed overlays (`fixed inset-0` modals, viewers, drawers) rendered from page content MUST portal to `document.body` (`createPortal`): the column's `container-type` may otherwise become their containing block.
   - Every page and the shell MUST be verified at `360px` (no overflow), `768px`, `1024px`, `1440px` in both themes before merge (screenshots for new shells).

## 6. Theme: Light/Dark + Semantic Colors Only

1. Modes: `light` and `dark` are the primary themes. Toggle via `.dark` class on `<html>` (see `@custom-variant` above), persisted in `localStorage` under key `amigoact-theme` (`"light" | "dark"`), defaulting to OS preference on first visit. No additional themes, no `system` mode after the first resolution (explicit user choice always wins).
   - First-visit resolution order: (a) stored `amigoact-theme` if present; else (b) `window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'`.
   - `main.tsx` MUST run theme init before first paint, and `index.html` MUST contain a blocking inline `<script>` in `<head>` that reads `amigoact-theme` (or OS preference when absent) and sets/removes `.dark` to avoid FOUC. No `style={}` theming, no theme logic in `App.tsx`.
   - `core/theme.ts` owns: storage key constant, `getStoredTheme()`, `resolveInitialTheme()`, `applyTheme(mode)`, `toggleTheme()`. Components never touch `localStorage` or `document.documentElement.classList` directly.
   - `ThemeToggle` (in `core/components/ThemeToggle.tsx`) is the only toggle: `react-icons` sun/moon pair (`h-5 w-5`), `aria-label` in Vietnamese, `aria-pressed`, `>= 44px` target, subtle `animejs` icon cross-fade via `core/motion.ts`, disabled motion when `prefers-reduced-motion` is set. Its `labeled` variant renders the same switch as a `menuitemcheckbox` row ("Giao diện tối", Bật/Tắt) inside the rail's More popover; the phone drawer uses the icon variant.
2. Palette (do not add hues without updating this file):
   - Base: light `bg-white text-zinc-900`, dark `bg-zinc-950 text-zinc-100`. Muted text: `text-zinc-500 dark:text-zinc-400`.
   - Neutrals only for chrome: no decorative accent color and no custom hex. Primary fills use `bg-zinc-900 text-white` (dark `bg-zinc-100 text-zinc-950`, hover `bg-zinc-800` / dark `bg-zinc-200`); selected states use a strong zinc border (`border-zinc-900` / dark `border-zinc-100`) over a zinc tint (`bg-zinc-100` / dark `bg-zinc-900`); text stays `zinc` in both modes.
   - Error: red — `red-600 dark:red-400`, subtle `red-50 dark:red-950`, border `red-200 dark:red-800`. Reserved for errors/destructive actions.
   - Warning: amber/yellow — `amber-600 dark:amber-400`, subtle `amber-50 dark:amber-950`. Reserved for warnings.
   - Success/info: emerald/green for success, zinc for info (same neutral scale as the chrome, distinguished by icon + label, never by a new hue). Reserved meanings must not be swapped (no green errors, no red info).
   - Forbidden as UI chrome: purple, pink, orange, teal, cyan, blue, indigo (except inside static illustrations/logos with justification).
3. Every color usage must carry both modes: each colored class needs its `dark:` counterpart (or an explicit comment why it is mode-invariant).
4. Contrast: body text and interactive elements must remain readable in both modes. Primary fills pair light text with the dark fill and vice versa (`bg-zinc-900 text-white` in light mode, `bg-zinc-100 text-zinc-950` in dark mode) — never white text on a light fill. No decorative color is ever used for body text.

## 7. Design Language: X-Style Feed, Zero Drift

1. The column feed is the only page language:
   - Page structure is always `PageShell` > center column > flat `flex flex-col` stack > `Section`s. No ad-hoc page layouts, no grid placement on page-level surfaces (`col-span-*`, `order-*`, `row-span-*`, `grid-cols-*` on sections are forbidden — they are leftovers of the old bento grid). `/manage` no longer owns a sidebar: its links live in the shared left rail (§7.5) and its pages render the same feed.
   - Sections (`core/components/Section.tsx`) are the only page-level surface: `border-b border-zinc-200 dark:border-zinc-800` + `px-4 py-4`, stacked edge to edge so consecutive sections read as one timeline separated by hairlines. No radius, no own background, no floating cards. The column's `sm:border-x` provides the side frame.
   - Inside a section, either full-bleed divided rows (`-mx-4 px-4`, `border-t`/`divide-y`, edge-to-edge hover like an X timeline row — see `orgs/components/AnnouncementTimeline.tsx`) or embedded bordered surfaces (`rounded-2xl border`, e.g. `ActivityCard`, `Feedback` states) are allowed. Never stack a boxed surface inside another boxed surface.
   - Internal grids are fine for content inside a section (stat grids, card shelves: `sm:grid-cols-*` / `@2xl:` / `@4xl:`); they only arrange children, never the page.
2. Consistency rule: every page MUST reuse `PageShell`, `Section`, `Button`, `TextField`, `Feedback`. A page that looks or spaces differently is a defect.
   - Typography scale only: display `text-2xl sm:text-3xl font-semibold tracking-tight`, section title `text-base sm:text-lg font-semibold` (feed headers may use `text-[15px]`/`text-xl font-bold` like X), body `text-sm text-zinc-600 dark:text-zinc-400`, caption `text-xs text-zinc-500 dark:text-zinc-400`.
   - Icons: `react-icons` only, one family per release (e.g. Feather `Fi*` or Heroicons `Hi2*` — do not mix families on one screen), one stroke width, fixed sizes (`h-4 w-4` inline, `h-5 w-5` section headers, `h-[26px]` primary rail/tab-bar items per §7.5). Every icon-only button has a Vietnamese `aria-label`. No emoji-as-icon.
3. Responsive behavior: the column is a single feed everywhere — there is no multi-column page placement. `sm:`/`@2xl:`/`@4xl:` on page content only refine internal layouts (e.g. a stat grid gaining columns; `@2xl:`/`@4xl:` stay inert on the uniform 600px column). No horizontal scroll at `360px`. Touch targets `>= 44px` for primary actions.
4. States are part of the design, not afterthoughts: every data section specifies `loading` (skeleton), `empty`, and `error` via `Feedback.tsx` with the semantic colors from §6. No blank sections, no `console.log` errors, no browser `alert()`. Every form error message MUST render as `role="alert"` (TextField/SelectField/TextArea already do) — `core/scroll.ts` observes them inside `<form>` and smooth-scrolls to the first error, honoring `prefers-reduced-motion`.
5. App shell (locked spec, X/Twitter layout, `core/components/PageShell.tsx`; there is no top navbar):
   - Three columns centered as one group (`flex justify-center`): left rail `w-[88px]` icon-only from `sm:` and `xl:w-[275px]` with labels; center `main.@container` `max-w-[600px]` with `sm:border-x border-zinc-200 dark:border-zinc-800`; right rail `ml-6 w-[290px] xl:w-[350px]` from `lg:`. Both rails are `sticky top-0 h-dvh`. Phones (< `sm:`) drop the rails for the center header, a bottom tab bar (`MobileTabBar`, fixed, `sm:hidden`, main gets `pb-20`) and the `NavDrawer`.
   - Uniform frame: every route renders the same three-column shell — left rail, `max-w-[600px]` center column, right rail from `lg:` up. The column width never changes between routes, so the rails never shift while navigating. `/manage/*` and `/admin/*` render the same feed as everywhere else; `/manage` workspace links live in the `ManageTabs` strip (§7.5) and their pages use the same `Section` surfaces.
   - Left rail order: logo disc (links to `/`, `aria-label` "AmigoACT - Trang chủ") + primary links from `core/nav.tsx` (`Trang chủ -> /`, `Sự kiện -> /events`, `Thông báo -> /notifications` with unread badge, `Trò chuyện -> /manage/chat`, `Bảng xếp hạng -> /leaderboard`, `Bảng điều khiển -> /manage`, `Hồ sơ -> /profile`; guests only see the public three) + `Thêm` (More popover: `Xác thực chứng nhận`, `Cài đặt`, `Quản trị` for admins, labeled `ThemeToggle`) + primary CTA pill (`Tạo hoạt động -> /manage/events?create=1`, guests `Đăng nhập -> /login`) + `AccountSwitcher` pinned to the bottom (avatar, name, email, popover `Hồ sơ`, `Đổi mật khẩu`, `Đăng xuất`). The home column splits into two deep-linked tabs (`home/components/HomeTabs.tsx`, sticky under `CenterHeader`): `Bài đăng` at `/` renders the infinite announcements feed (`orgs/components/AnnouncementTimeline.tsx`), and `Tổ chức` at `/?tab=orgs` renders the org directory (`orgs/components/OrgDirectory.tsx`); legacy `/orgs` redirects to `/?tab=orgs` forwarding `?q&kind&sort&page`, and a bare `/?q&kind&sort&page` URL resolves to the orgs tab, so only `/orgs/:slug` detail pages remain separate.
   - The dashboard entry navigates to `/manage/overview`; it never expands in the rail or drawer. Its workspace sections (`MANAGE_LINKS`) render as a horizontally scrollable tab strip (`dashboard/components/ManageTabs.tsx`, sticky under `CenterHeader`, icon + label tabs, invites badge on `Thành viên`, active tab scrolled into view) mounted by `DashboardPage` on every `/manage/*` page except chat. Active item resolution is longest-prefix (`core/nav-meta.ts`), so exactly one primary item is bold.
   - Rail item style: `RailNavItem` pill hugging icon + label (`h-[26px]` icon, `text-xl` label; compact `h-5`/`text-[15px]`), `hover:bg-zinc-100 dark:hover:bg-zinc-900` on the pill only, active = `font-bold` + `stroke-[2.75]` icon + `aria-current="page"` (no accent fill). Badges are neutral discs (`bg-zinc-900 text-white`, dark `bg-zinc-100 text-zinc-950`). Icon-only rails keep `aria-label` + `title`.
   - Center header (`CenterHeader`): sticky `top-0 z-30`, `bg-white/85 dark:bg-zinc-950/85 backdrop-blur border-b`, title `text-xl font-bold` from `pageMeta()` (workspace pages add the `Bảng điều khiển` caption), back arrow on detail routes (history back, else the parent route). On phones its leading button opens the drawer (avatar when signed in, `FiMenu` for guests). Pages keep their own `h1` (visually hidden when it would repeat the header title).
   - Right rail (`RightRail`): sticky search pill (`TextField pill hideLabel`, submits to `/?tab=orgs&q=` which the orgs tab passes to `GET /orgs?q=`), then `RailCard` widgets: personal `Hành trình của bạn` (hours, certificates, pending invites, `Xem hồ sơ`) or guest `Mới đến AmigoACT?`, `Sắp diễn ra` (discovery), `Tổ chức nổi bật` (orgs by members), then a footer. `RailCard` (rounded-2xl border, heavy title, edge-to-edge hover rows) is the rail-only widget primitive; page surfaces stay `Section`.
   - Routes: auth screens live at `/login`, `/register`, `/verify` (kept functional while the verification gate is deferred), `/forgot-password`, `/reset-password` (guest-only via `RequireGuest`; signed-in users redirect to `/`), `/profile`, `/change-password` (auth-only via `RequireAuth`; guests redirect to `/login`). Registration signs the user in immediately and lands on `/` (falls back to `/login` with a notice only if the auto sign-in fails). Change-password requires the new password to differ from the current password (code `SAME_AS_CURRENT`, validated live on change). `/manage` is the self-serve workspace where individuals or businesses create and manage organizations, clubs, and groups (legacy `/my-dashboard/*` URLs redirect to `/manage/*`; the feature folder is `dashboard/`). The visibility eye on password fields is mouse-only (`tabIndex={-1}`) with a shared per-form state, and every field validates live on change.
   - Popovers (More, account) and the drawer close on `Esc`/outside press (`core/dismiss.ts`), open with the `expandPanel` motion preset, and return focus to their trigger. Never `shadow`/`ring`; surfaces separate by borders only.
6. Motion (`animejs` only, via `core/motion.ts`):
   - Allowed uses: drawer/popover open, page/hero entrance (fade + `translateY 8-12px`), list stagger (`30-50ms`), `ThemeToggle` icon cross-fade, micro-feedback on primary buttons. Durations `150-300ms`, easing `ease-out`.
   - Forbidden: looping/ambient animation on chrome, scroll-jacking, parallax, layout-thrashing loops, per-page `anime()` one-offs bypassing `core/motion.ts`, any second animation library.
   - Accessibility: `core/motion.ts` MUST check `window.matchMedia('(prefers-reduced-motion: reduce)')` and skip/jump-to-end when set. No content may depend on animation to be visible (final state is always rendered even if `animejs` fails to load).
7. Icons (`react-icons` everywhere):
   - Every button (`Button`, nav link, icon-button, `ThemeToggle`, empty-state action) renders a `react-icons` glyph at a fixed size. Buttons without an icon are defects unless justified in the PR.
   - Allowed: one family per release, tree-shaken named imports (e.g. `import { FiHome } from 'react-icons/fi'`). Forbidden: `react-icons` wildcard star imports, emoji icons, pasted raw SVG paths, adding `lucide-react` / `@heroicons` alongside `react-icons`.
8. Buttons: compact, content-sized, never stretched horizontally:
   - All buttons go through `core/components/Button.tsx` with locked size variants only (e.g. `sm: px-3 py-1.5 text-sm`, `md: px-4 py-2 text-sm`). No per-page padding inventions such as `px-8 / px-10 / px-12` or arbitrary `px-[...]` to make buttons look longer.
   - Buttons are `inline-flex items-center justify-center gap-2 whitespace-nowrap` and size to their content (icon + label). Forbidden: horizontally long buttons with excess horizontal padding and empty space on both sides.
   - Forbidden stretch patterns: `w-full` on desktop or inside toolbars/cards, `flex-1` / `grow` buttons in a row, `justify-between` stretching a single label across the full section width. `w-full` is allowed only for a single-column form submit on mobile (`360px`) with justification, and must revert to content-sized (`sm:w-auto`) from `sm:` up. Single shell exception: the left-rail primary CTA pill (X "Post" equivalent, `h-[52px] rounded-full`) is full rail width from `xl:` and a 52px icon disc below it; shell rail/menu rows (`RailNavItem`, popover rows) are navigation chrome, not buttons.
   - Reach the `>= 44px` touch target with height (`py-2 / min-h-[44px]`), never by widening horizontal padding. Icon stays fixed (`h-4 w-4` inline, `h-5 w-5` headers) with `gap-2`; do not pad the icon away from the label.
   - A button that looks like a wide empty bar with small centered text is a defect. Review new buttons side-by-side with existing `Button` variants for drift.
9. Deep-linkable tabs (locked):
   - Every tab or sidebar view inside a single page MUST have its own URL.

## 8. No Browser-Default Chrome

Minimize anything that looks like an unstyled browser:

- Never render bare `<button>`, `<a>`, `<input>`, `<select>`, `<textarea>` — always use `core/components/` primitives.
- Links have deliberate styles (`text-zinc-900 underline decoration-zinc-400 decoration-2 underline-offset-2 hover:bg-zinc-100 dark:text-zinc-100 dark:decoration-zinc-500 dark:hover:bg-zinc-900` or button styles), never default blue-underline UA styling by accident.
- Form controls: custom borders (`border-zinc-300 dark:border-zinc-700`), `rounded-lg`, explicit `placeholder:text-zinc-400`, `appearance-none` for selects with a custom chevron icon. No default OS bevels.
- Scrollbars/number spinners: normalize where they break the grid aesthetic; do not ship pages with mixed native and custom control styles.
- Favicon/title/meta in `index.html` must be set per release; no `vite.svg` leftovers, no `lorem ipsum`.

## 9. TypeScript, Accessibility, and Quality Gates

- Strict TypeScript: no `any` (use `unknown` + narrowing), no unused locals/params, explicit return types on exported functions, typed API contracts per feature.
- React: functional components only, no class components; keys on lists; no nested component definitions inside render; effects only for non-server concerns (theme, focus, subscriptions).
- Accessibility: semantic landmarks (`header/main/nav/footer`), labels for every input, `aria-busy`/`aria-live` on async sections, keyboard-reachable actions, visible focus per §5.4.
- DoD for every change:
  1. `bun run build` (tsc + vite) passes.
  2. `bun run lint` passes with no new warnings.
  3. `.tsx <= 250` / `.ts <= 350` lines; Tailwind-only; zero `shadow`/`ring` hits; every color has `dark:` coverage.
  4. Data flows through TanStack Query hooks with loading/empty/error states in each feed section.
  5. New/changed sections reviewed side-by-side with an existing page for drift (spacing, surfaces, type, colors).
  6. Mobile-first + motion + icons + theme verified: no overflow at `360px`; only `animejs` via `core/motion.ts` with `prefers-reduced-motion` guard (no second animation lib); every button/nav affordance renders a `react-icons` glyph with Vietnamese accessible label; first-visit theme follows OS (`prefers-color-scheme`) with no FOUC and persisted toggle; shell rails/header/tab bar/drawer order, routes and labels match §7.5, and page content uses only container-query breakpoints (§5.6).

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
2. TanStack Query stays the source of truth (§4). WS messages only invalidate exact query keys or apply narrow deltas — never replace whole caches. Every live section keeps the same loading/empty/error states via `Feedback.tsx`.
3. Channels mirror the backend (§16 of backend AGENTS.md): `notifications:{userId}`, `attendance:{activityId}`, `activities:{orgId}`, `members:{orgId}`. Subscribe only to channels the current user is authorized for; render `403`-style denial through `Feedback.tsx` in Vietnamese, never a blank section.
4. Speculation Rules API from day one: `index.html` MUST contain a `<script type="speculationrules">` block with same-origin `prefetch` (moderate eagerness) and `prerender` for safe GET navigations. Exclude `/auth/*`, logout, export downloads, and any mutation URL. When routes are added, the rules JSON is updated in the same change. No `instant.page`-style library, no manual `<link rel="prefetch">` hacks.
5. Language: all user-visible realtime copy (toasts, connection banners, live badges) is Vietnamese (§10.5). Connection loss shows a `Feedback`-style banner with retry, never `alert()` or console-only errors.
6. DoD for realtime work: reconnect + resume verified, query invalidation asserted in tests, speculation-rules JSON validated (parses, excludes unsafe URLs), light/dark screenshots of live states attached to the PR.
