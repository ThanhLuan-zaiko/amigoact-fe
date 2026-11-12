import { internalKeyHeaders } from "./internalKey";

type MineItem = { slug: string; role: string };

// Used by proxy.ts, which cannot use the server-only helpers. Any failure means
// "not an owner", so the viewer lands on the public address and the backend
// still decides what they may do.
export async function ownsOrganization(
  slug: string,
  accessToken: string | undefined,
): Promise<boolean> {
  if (!accessToken) {
    return false;
  }
  try {
    const response = await fetch(
      `${process.env.BACKEND_URL}/organizations/mine`,
      {
        headers: {
          ...internalKeyHeaders(),
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      },
    );
    if (!response.ok) {
      return false;
    }
    const items = (await response.json()) as MineItem[];
    return items.some((item) => item.slug === slug && item.role === "owner");
  } catch {
    return false;
  }
}
