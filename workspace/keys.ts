import type { PostListParams } from "./api.ts";

export const workspaceKeys = {
  all: ["workspace"] as const,
  posts: (orgId: string | null, params: PostListParams = {}) =>
    [...workspaceKeys.all, "posts", orgId, params.kind ?? "all"] as const,
  comments: (postId: string) =>
    [...workspaceKeys.all, "comments", postId] as const,
  chat: (roomId: string | null) =>
    [...workspaceKeys.all, "chat", roomId] as const,
  chatUnread: (roomId: string | null) =>
    [...workspaceKeys.all, "chat-unread", roomId] as const,
  dmRooms: (orgId: string | null) =>
    [...workspaceKeys.all, "dm-rooms", orgId] as const,
};
