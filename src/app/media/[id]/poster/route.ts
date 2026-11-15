import { proxyMedia, queryNumber } from "@/lib/mediaProxy";
import { parseWidth } from "@/lib/pictureSizes";

// The still frame of a video, in the same widths as a picture.
export async function GET(
  request: Request,
  ctx: RouteContext<"/media/[id]/poster">,
) {
  const { id } = await ctx.params;
  return proxyMedia(
    request,
    id,
    `poster${queryNumber(request, "w", parseWidth)}`,
  );
}
