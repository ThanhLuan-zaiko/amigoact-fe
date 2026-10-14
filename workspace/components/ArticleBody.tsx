import type { ReactElement } from "react";
import { articleBlocks, mediaLookup } from "../article.ts";
import type { ArticleBlock, OrgPost } from "../board-api.ts";

// Read-only article renderer shared by the read page and card previews:
// typed blocks first, legacy plain body + image strip as a fallback.
export function ArticleBody({ post }: { post: OrgPost }): ReactElement {
  const blocks = articleBlocks(post);
  const lookup = mediaLookup(post.media);
  return (
    <div className="mt-4 flex flex-col gap-4">
      {blocks.map((block, index) => (
        <BlockView key={index} block={block} lookup={lookup} />
      ))}
    </div>
  );
}

function BlockView({
  block,
  lookup,
}: {
  block: ArticleBlock;
  lookup: ReturnType<typeof mediaLookup>;
}): ReactElement | null {
  switch (block.type) {
    case "heading":
      return block.level === 2 ? (
        <h2 className="text-lg font-semibold text-zinc-900 sm:text-xl dark:text-zinc-100">
          {block.text}
        </h2>
      ) : (
        <h3 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
          {block.text}
        </h3>
      );
    case "quote":
      return (
        <figure className="border-l-4 border-zinc-300 pl-4 dark:border-zinc-600">
          <blockquote className="text-base break-words whitespace-pre-wrap text-zinc-700 italic sm:text-lg dark:text-zinc-300">
            {block.text}
          </blockquote>
          {block.cite.trim() !== "" && (
            <figcaption className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              — {block.cite}
            </figcaption>
          )}
        </figure>
      );
    case "list":
      return block.ordered ? (
        <ol className="list-decimal space-y-1 pl-6 text-sm break-words text-zinc-700 sm:text-base dark:text-zinc-300">
          {block.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ol>
      ) : (
        <ul className="list-disc space-y-1 pl-6 text-sm break-words text-zinc-700 sm:text-base dark:text-zinc-300">
          {block.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
    case "image": {
      const ref = lookup[block.asset_id];
      if (ref === undefined) return null;
      return (
        <figure>
          <img
            src={ref.url}
            alt={block.caption.trim() || "Ảnh minh họa bài viết"}
            loading="lazy"
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800"
          />
          {block.caption.trim() !== "" && (
            <figcaption className="mt-1 text-center text-xs text-zinc-500 dark:text-zinc-400">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    }
    case "video": {
      const ref = lookup[block.asset_id];
      if (ref === undefined) return null;
      return (
        <figure>
          <video
            src={ref.url}
            controls
            preload="metadata"
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800"
          />
          {block.caption.trim() !== "" && (
            <figcaption className="mt-1 text-center text-xs text-zinc-500 dark:text-zinc-400">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    }
    case "divider":
      return (
        <hr
          aria-hidden="true"
          className="border-t border-zinc-200 dark:border-zinc-800"
        />
      );
    default:
      return block.text.trim() === "" ? null : (
        <p className="text-sm break-words whitespace-pre-wrap text-zinc-700 sm:text-base dark:text-zinc-300">
          {block.text}
        </p>
      );
  }
}
