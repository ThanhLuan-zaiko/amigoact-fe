import { apiFetch } from "../core/api.ts";

// Named-channel contracts, split from api.ts for the 350-line rule;
// api.ts re-exports this module so existing imports keep working.

export type ChannelKind = "text" | "report" | "task";
export type ChannelPostPolicy = "everyone" | "managers";
export type ChannelVisibility = "org" | "restricted";

// One named channel; channel_id doubles as the chat room id.
// parent_room_id set means the row is a sub-thread of that room;
// activity_id/activity_title carry the optional linked activity.
export interface ChatChannel {
  channel_id: string;
  org_id: string;
  name: string;
  topic: string;
  kind: ChannelKind;
  post_policy: ChannelPostPolicy;
  visibility: ChannelVisibility;
  created_by: string;
  created_at: string | null;
  archived_at: string | null;
  parent_room_id: string | null;
  activity_id: string | null;
  activity_title: string | null;
}

export interface ChannelList {
  items: ChatChannel[];
}

export interface ChannelMember {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  added_at: string | null;
}

export interface ChannelMemberList {
  items: ChannelMember[];
}

export interface ChannelCreateInput {
  name: string;
  topic?: string;
  kind?: ChannelKind;
  post_policy?: ChannelPostPolicy;
  visibility?: ChannelVisibility;
  member_ids?: string[];
}

export interface ChannelUpdateInput {
  name?: string;
  topic?: string;
  kind?: ChannelKind;
  post_policy?: ChannelPostPolicy;
  visibility?: ChannelVisibility;
  archived?: boolean;
}

export function listChannels(orgId: string): Promise<ChannelList> {
  return apiFetch<ChannelList>(`/orgs/${orgId}/chat/channels`);
}

export function createChannel(
  orgId: string,
  input: ChannelCreateInput,
): Promise<ChatChannel> {
  return apiFetch<ChatChannel>(`/orgs/${orgId}/chat/channels`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateChannel(
  orgId: string,
  channelId: string,
  input: ChannelUpdateInput,
): Promise<ChatChannel> {
  return apiFetch<ChatChannel>(
    `/orgs/${orgId}/chat/channels/${channelId}`,
    { method: "PATCH", body: JSON.stringify(input) },
  );
}

export function listChannelMembers(
  orgId: string,
  channelId: string,
): Promise<ChannelMemberList> {
  return apiFetch<ChannelMemberList>(
    `/orgs/${orgId}/chat/channels/${channelId}/members`,
  );
}

export function addChannelMember(
  orgId: string,
  channelId: string,
  userId: string,
): Promise<ChannelMember> {
  return apiFetch<ChannelMember>(
    `/orgs/${orgId}/chat/channels/${channelId}/members`,
    { method: "POST", body: JSON.stringify({ user_id: userId }) },
  );
}

export function removeChannelMember(
  orgId: string,
  channelId: string,
  userId: string,
): Promise<void> {
  return apiFetch<unknown>(
    `/orgs/${orgId}/chat/channels/${channelId}/members/${userId}`,
    { method: "DELETE" },
  ).then(() => undefined);
}

// Sub-threads: channel rows scoped to one parent room. Visibility is
// inherited from the parent, so the create contract never sends it.
export interface ThreadCreateInput {
  name: string;
  topic?: string;
  kind?: ChannelKind;
  post_policy?: ChannelPostPolicy;
  activity_id?: string | null;
}

export function listRoomThreads(
  orgId: string,
  roomId: string,
): Promise<ChannelList> {
  return apiFetch<ChannelList>(
    `/orgs/${orgId}/chat/rooms/${roomId}/threads`,
  );
}

export function createRoomThread(
  orgId: string,
  roomId: string,
  input: ThreadCreateInput,
): Promise<ChatChannel> {
  return apiFetch<ChatChannel>(
    `/orgs/${orgId}/chat/rooms/${roomId}/threads`,
    { method: "POST", body: JSON.stringify(input) },
  );
}
