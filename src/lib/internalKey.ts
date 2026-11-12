// The backend refuses every HTTP request without this key, so only this
// server can call it. The value comes from INTERNAL_API_KEY in .env.local and
// must match the backend's .env. Never send it to the browser.
export const INTERNAL_KEY_HEADER = "x-internal-key";

export function internalKeyHeaders(
  key: string | undefined = process.env.INTERNAL_API_KEY,
): Record<string, string> {
  return key ? { [INTERNAL_KEY_HEADER]: key } : {};
}
