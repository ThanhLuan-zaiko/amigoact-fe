import { isPictureId } from "@/lib/pictureRules";

// Serves organization pictures from the backend, so the browser never talks to it.
// Only public pictures come back: the backend answers 404 for every private file.
export async function GET(
  request: Request,
  ctx: RouteContext<"/media/[id]/file">,
) {
  const { id } = await ctx.params;
  if (!isPictureId(id)) {
    return new Response(null, { status: 404 });
  }

  const range = request.headers.get("range");
  let upstream: Response;
  try {
    upstream = await fetch(`${process.env.BACKEND_URL}/media/${id}/file`, {
      cache: "no-store",
      // Video players ask for byte ranges in order to seek.
      headers: range ? { range } : undefined,
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
