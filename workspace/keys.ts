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
  // Cross-org Telegram inbox: one merged list, never org-scoped.
  chatInbox: () => [...workspaceKeys.all, "chat-inbox"] as const,
};
