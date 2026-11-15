import { proxyMedia, queryNumber } from "@/lib/mediaProxy";
import { parseWidth } from "@/lib/pictureSizes";

// A picture at ?w= (see lib/pictureSizes), or a video as uploaded.
export async function GET(
  request: Request,
  ctx: RouteContext<"/media/[id]/file">,
) {
  const { id } = await ctx.params;
  return proxyMedia(
    request,
    id,
    `file${queryNumber(request, "w", parseWidth)}`,
  );
}
