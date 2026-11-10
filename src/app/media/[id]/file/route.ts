import { getAccessToken } from "@/lib/auth";
import { isPictureId } from "@/lib/pictureRules";

// Serves organization pictures from the backend, so the browser never talks to it.
// Public pictures come back for everyone. A private one only comes back to its owner,
// whose token is forwarded. For anyone else the backend answers 404.
export async function GET(
  request: Request,
  ctx: RouteContext<"/media/[id]/file">,
) {
  const { id } = await ctx.params;
  if (!isPictureId(id)) {
    return new Response(null, { status: 404 });
  }

  const range = request.headers.get("range");
  const token = await getAccessToken();
  let upstream: Response;
  try {
    upstream = await fetch(`${process.env.BACKEND_URL}/media/${id}/file`, {
      cache: "no-store",
      // Video players ask for byte ranges in order to seek.
      headers: {
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
  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "Accept-Ranges": "bytes",
      ...(partial ? { "Content-Range": partial } : {}),
      ...(upstream.headers.get("content-length")
        ? { "Content-Length": upstream.headers.get("content-length") ?? "" }
        : {}),
      "Content-Type":
        upstream.headers.get("content-type") ?? "application/octet-stream",
      "Cache-Control": upstream.headers.get("cache-control") ?? "public",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
