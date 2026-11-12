import { type BodyBlock, parseBody } from "@/lib/postFormat";
import PostMediaView from "./PostMediaView";
import type { PostMedia } from "./types";

function renderBlock(block: BodyBlock, index: number, media: PostMedia[]) {
  switch (block.type) {
    case "media": {
      // A token for a file the post no longer has renders nothing.
      const item = media.find((entry) => entry.id === block.id);
      return item ? <PostMediaView key={index} item={item} /> : null;
    }
    case "heading":
      return (
        <h3
          key={index}
          className="text-base font-bold text-slate-900 dark:text-slate-100"
        >
          {block.text}
        </h3>
      );
    case "quote":
      return (
        <blockquote
          key={index}
          className="border-l-2 border-slate-300 pl-3 whitespace-pre-line text-slate-600 dark:border-slate-700 dark:text-slate-400"
        >
          {block.lines.join("\n")}
        </blockquote>
      );
    case "list":
      return (
        <ul key={index} className="list-disc pl-5">
          {block.items.map((item, itemIndex) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: the parsed list is static and never reordered.
            <li key={`${index}-${itemIndex}`}>{item}</li>
          ))}
        </ul>
      );
    case "rule":
      return (
        <hr key={index} className="border-slate-200 dark:border-slate-800" />
      );
    default:
      return (
        <p key={index} className="whitespace-pre-line">
          {block.text}
        </p>
      );
  }
}

// Plain text in, React elements out, so a post body can never inject markup.
export default function PostBody({
  body,
  media = [],
}: {
  body: string;
  media?: PostMedia[];
}) {
  return (
    <div className="flex flex-col gap-2 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
      {parseBody(body).map((block, index) => renderBlock(block, index, media))}
    </div>
  );
}
