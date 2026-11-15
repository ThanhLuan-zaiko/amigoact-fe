import { proxyMedia, queryNumber } from "@/lib/mediaProxy";
import { parseQuality } from "@/lib/video";

// A transcoded MP4 copy at ?q= (480, 720, 1080), or the upload while it is not ready.
export async function GET(
  request: Request,
  ctx: RouteContext<"/media/[id]/video">,
) {
  const { id } = await ctx.params;
  return proxyMedia(
    request,
    id,
    `video${queryNumber(request, "q", parseQuality)}`,
  );
}
