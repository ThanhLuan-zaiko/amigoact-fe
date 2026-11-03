import { isPictureId } from "@/lib/pictureRules";

// Serves organization pictures from the backend, so the browser never talks to it.
// Only public pictures come back: the backend answers 404 for every private file.
export async function GET(
  _request: Request,
  ctx: RouteContext<"/media/[id]/file">,
) {
  const { id } = await ctx.params;
  if (!isPictureId(id)) {
    return new Response(null, { status: 404 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${process.env.BACKEND_URL}/media/${id}/file`, {
      cache: "no-store",
    });
  } catch {
    return new Response(null, { status: 502 });
  }
  if (!upstream.ok || !upstream.body) {
    return new Response(null, { status: upstream.status === 404 ? 404 : 502 });
  }
  return new Response(upstream.body, {
    headers: {
      "Content-Type":
        upstream.headers.get("content-type") ?? "application/octet-stream",
      "Cache-Control": upstream.headers.get("cache-control") ?? "public",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
