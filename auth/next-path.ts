// Return paths after sign-in. Only same-origin paths are honoured, so a crafted
// next= parameter cannot send the user to another site or back to the login page.
const PROBE_ORIGIN = "https://amigoact.invalid";

export function safeNextPath(raw: string | null): string | null {
  if (raw === null || !raw.startsWith("/") || raw.startsWith("//")) return null;
  if (raw.includes("\\") || /\s/.test(raw)) return null;
  let url: URL;
  try {
    url = new URL(raw, PROBE_ORIGIN);
  } catch {
    return null;
  }
  if (url.origin !== PROBE_ORIGIN || url.pathname.startsWith("/login")) {
    return null;
  }
  return `${url.pathname}${url.search}${url.hash}`;
}

// Login URL that comes back to the given in-app path once signed in.
export function loginPath(next: string): string {
  return `/login?next=${encodeURIComponent(next)}`;
}
