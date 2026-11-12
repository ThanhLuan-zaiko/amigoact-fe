import { headers } from "next/headers";
import { isSerialShape, normalizeSerial } from "@/lib/certificates";
import { internalKeyHeaders } from "@/lib/internalKey";

// Streams the certificate PDF from the backend, so the browser never talks to it.
// Public like the verify page. The client address is forwarded, because the backend
// limits lookups per client.
export async function GET(
  _request: Request,
  ctx: RouteContext<"/certificates/verify/[serial]/pdf">,
) {
  const { serial } = await ctx.params;
  const typed = normalizeSerial(serial);
  if (!isSerialShape(typed)) {
    return new Response(null, { status: 404 });
  }

  const forwarded = (await headers()).get("x-forwarded-for");
  let upstream: Response;
  try {
    upstream = await fetch(
      `${process.env.BACKEND_URL}/certificates/verify/${encodeURIComponent(typed)}/pdf`,
      {
        cache: "no-store",
        headers: {
          ...internalKeyHeaders(),
          ...(forwarded ? { "x-forwarded-for": forwarded } : {}),
        },
      },
    );
  } catch {
    return new Response(null, { status: 502 });
  }
  if (!upstream.ok || !upstream.body) {
    // Not found, revoked (409) and rate limited (429) keep their status.
    return new Response(null, {
      status: [404, 409, 429].includes(upstream.status) ? upstream.status : 502,
    });
  }
  return new Response(upstream.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        upstream.headers.get("content-disposition") ?? "inline",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
