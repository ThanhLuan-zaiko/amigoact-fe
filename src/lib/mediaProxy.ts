import { getAccessToken } from "@/lib/auth";
import { internalKeyHeaders } from "@/lib/internalKey";
import { isPictureId } from "@/lib/pictureRules";

// Streams one media file from the backend, so the browser never talks to it.
// Public files come back for everyone. A private one comes back only to people the
// backend lets see it, whose token is forwarded. Byte ranges pass through, so video
// players can seek. `path` is built by the caller from checked parts only.
export async function proxyMedia(
  request: Request,
  id: string,
  path: string,
): Promise<Response> {
  if (!isPictureId(id)) {
    return new Response(null, { status: 404 });
  }
  const range = request.headers.get("range");
  const token = await getAccessToken();
  let upstream: Response;
  try {
    upstream = await fetch(`${process.env.BACKEND_URL}/media/${id}/${path}`, {
      cache: "no-store",
      headers: {
        ...internalKeyHeaders(),
        ...(range ? { range } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch {
    return new Response(null, { status: 502 });
  }
  if (!upstream.ok || !upstream.body) {
    return new Response(null, { status: upstream.status === 404 ? 404 : 502 });
  }
  const partial = upstream.headers.get("content-range");
  const length = upstream.headers.get("content-length");
  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "Accept-Ranges": "bytes",
      ...(partial ? { "Content-Range": partial } : {}),
      ...(length ? { "Content-Length": length } : {}),
      "Content-Type":
        upstream.headers.get("content-type") ?? "application/octet-stream",
      "Cache-Control": upstream.headers.get("cache-control") ?? "public",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

// One query number in a range, or nothing. Never forwards other query text.
export function queryNumber(
  request: Request,
  name: string,
  parse: (raw: string | null) => number | null,
): string {
  const value = parse(new URL(request.url).searchParams.get(name));
  return value === null ? "" : `?${name}=${value}`;
}
