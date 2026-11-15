import { proxyMedia } from "@/lib/mediaProxy";
import { hlsFileName } from "@/lib/video";

// Files of a video's HLS stream. Only the names the backend writes pass through.
export async function GET(
  request: Request,
  ctx: RouteContext<"/media/[id]/hls/[...name]">,
) {
  const { id, name } = await ctx.params;
  const file = hlsFileName(name);
  if (file === null) {
    return new Response(null, { status: 404 });
  }
  return proxyMedia(request, id, `hls/${file}`);
}
