import type { PostListParams } from "./board-api.ts";

// Every board key nests under [..., "posts", orgId] so one prefix
// invalidation (mutations, posts:{org} realtime) refreshes feed, detail,
// drafts and trash together.
export const workspaceKeys = {
  all: ["workspace"] as const,
  posts: (orgId: string | null, params: PostListParams = {}) =>
    [
      ...workspaceKeys.all,
      "posts",
      orgId,
      params.kind ?? "all",
      params.tag ?? "",
      params.page ?? 1,
    ] as const,
  post: (orgId: string | null, postId: string | null) =>
    [...workspaceKeys.all, "posts", orgId, "detail", postId] as const,
  publicPost: (slug: string | null, postId: string | null) =>
    [...workspaceKeys.all, "public-post", slug, postId] as const,
  drafts: (orgId: string | null, page = 1) =>
    [...workspaceKeys.all, "posts", orgId, "drafts", page] as const,
  trash: (orgId: string | null, page = 1) =>
    [...workspaceKeys.all, "posts", orgId, "trash", page] as const,
  comments: (postId: string) =>
    [...workspaceKeys.all, "comments", postId] as const,
  chat: (roomId: string | null) =>
    [...workspaceKeys.all, "chat", roomId] as const,
  chatUnread: (roomId: string | null) =>
    [...workspaceKeys.all, "chat-unread", roomId] as const,
  // Per-member read pointers backing the group "seen by" receipts.
  chatReads: (roomId: string | null) =>
    [...workspaceKeys.all, "chat-reads", roomId] as const,
  // Room info panel: one tab of the shared-item index per (kind,
  // sender) - the "all" sentinel keeps the unfiltered query distinct.
  chatMedia: (roomId: string | null, kind: string, authorId?: string) =>
    [
      ...workspaceKeys.all,
      "chat-media",
      roomId,
      kind,
      authorId ?? "all",
    ] as const,
  // Sender-filter option list of a room's shared-item index.
  chatMediaAuthors: (roomId: string | null) =>
    [...workspaceKeys.all, "chat-media", roomId, "authors"] as const,
  dmRooms: (orgId: string | null) =>
    [...workspaceKeys.all, "dm-rooms", orgId] as const,
  channels: (orgId: string | null) =>
    [...workspaceKeys.all, "channels", orgId] as const,
  channelMembers: (orgId: string | null, channelId: string | null) =>
    [
      ...workspaceKeys.all,
      "channel-members",
      orgId,
      channelId,
    ] as const,
  // Sub-thread listing of one parent room (general or top channel).
  roomThreads: (orgId: string | null, roomId: string | null) =>
    [...workspaceKeys.all, "room-threads", orgId, roomId] as const,
  // Cross-org Telegram inbox: one merged list, never org-scoped.
  chatInbox: () => [...workspaceKeys.all, "chat-inbox"] as const,
};
