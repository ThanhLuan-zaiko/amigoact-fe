import { orgMediaUrl } from "../dashboard/api.ts";
import type {
  ArticleBlock,
  BlockType,
  OrgPost,
  OrgPostMedia,
} from "./board-api.ts";

// Client-side block plus a stable React key (never sent to the API).
export type EditorBlock = ArticleBlock & { key: string };

export interface MediaRef {
  url: string;
  mime: string;
}

export type MediaLookup = Record<string, MediaRef>;

const WORDS_PER_MINUTE = 200;

let keySeed = 0;
export function blockKey(): string {
  keySeed += 1;
  return `b${Date.now().toString(36)}${keySeed.toString(36)}`;
}

export function emptyBlock(type: BlockType, assetId = ""): EditorBlock {
  const key = blockKey();
  switch (type) {
    case "heading":
      return { key, type, text: "", level: 2 };
    case "quote":
      return { key, type, text: "", cite: "" };
    case "list":
      return { key, type, ordered: false, items: [""] };
    case "image":
    case "video":
      return { key, type, asset_id: assetId, caption: "" };
    case "divider":
      return { key, type };
    default:
      return { key, type: "paragraph", text: "" };
  }
}

export function withKeys(blocks: ArticleBlock[]): EditorBlock[] {
  return blocks.map((block) => ({ ...block, key: blockKey() }));
}

export function stripKeys(blocks: EditorBlock[]): ArticleBlock[] {
  return blocks.map((block) => {
    const copy: Partial<EditorBlock> = { ...block };
    delete copy.key;
    return copy as ArticleBlock;
  });
}

// Legacy posts (plain body + image strip) open in the editor as
// paragraph blocks followed by image blocks, so one save upgrades them.
export function articleBlocks(post: OrgPost): ArticleBlock[] {
  if (post.blocks.length > 0) return post.blocks;
  const paragraphs: ArticleBlock[] = post.body
    .split(/\n{2,}/)
    .map((text) => text.trim())
    .filter(Boolean)
    .map((text) => ({ type: "paragraph", text }));
  const images: ArticleBlock[] = post.media
    .filter(
      (item) =>
        item.mime.startsWith("image/") && item.asset_id !== post.cover_media_id,
    )
    .map((item) => ({ type: "image", asset_id: item.asset_id, caption: "" }));
  return [...paragraphs, ...images];
}

export function mediaLookup(media: OrgPostMedia[]): MediaLookup {
  const lookup: MediaLookup = {};
  for (const item of media) {
    lookup[item.asset_id] = { url: orgMediaUrl(item.file_url), mime: item.mime };
  }
  return lookup;
}

export function coverUrl(post: OrgPost): string | null {
  if (post.cover_media_id) {
    const cover = post.media.find((item) => item.asset_id === post.cover_media_id);
    if (cover) return orgMediaUrl(cover.file_url);
  }
  const image = articleBlocks(post).find((block) => block.type === "image");
  if (image && image.type === "image") {
    const item = post.media.find((m) => m.asset_id === image.asset_id);
    if (item) return orgMediaUrl(item.file_url);
  }
  return null;
}

export function blockText(block: ArticleBlock): string {
  switch (block.type) {
    case "list":
      return block.items.join(" ");
    case "image":
    case "video":
      return block.caption;
    case "divider":
      return "";
    default:
      return block.text;
  }
}

export function hasArticleContent(blocks: ArticleBlock[]): boolean {
  return blocks.some(
    (block) =>
      block.type === "image" ||
      block.type === "video" ||
      blockText(block).trim() !== "",
  );
}

export function wordCount(blocks: ArticleBlock[]): number {
  return blocks
    .map(blockText)
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
}

export function readingMinutes(words: number): number {
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export function excerpt(post: OrgPost, max = 200): string {
  const lead = articleBlocks(post).find(
    (block) => block.type === "paragraph" && block.text.trim() !== "",
  );
  const text = (lead && lead.type === "paragraph" ? lead.text : post.body)
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max).trimEnd()}...` : text;
}

export function insertAt<T>(list: T[], index: number, items: T[]): T[] {
  return [...list.slice(0, index), ...items, ...list.slice(index)];
}

export function moveItem<T>(list: T[], index: number, delta: number): T[] {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  return next;
}

// Drop empty text blocks and media blocks whose upload never finished.
export function cleanBlocks(blocks: EditorBlock[]): ArticleBlock[] {
  return stripKeys(blocks).filter((block) => {
    if (block.type === "image" || block.type === "video") {
      return block.asset_id !== "";
    }
    if (block.type === "divider") return true;
    if (block.type === "list") return block.items.some((item) => item.trim());
    return block.text.trim() !== "";
  });
}
