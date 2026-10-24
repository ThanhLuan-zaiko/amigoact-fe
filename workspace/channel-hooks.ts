import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { createActivity, type ActivityInput } from "../activities/api.ts";
import { activityKeys } from "../activities/keys.ts";
import { useOrgMembers } from "../dashboard/members-hooks.ts";
import { ApiError } from "../core/api.ts";
import {
  addChannelMember,
  createChannel,
  createRoomThread,
  listChannelMembers,
  listChannels,
  listRoomThreads,
  removeChannelMember,
  updateChannel,
  type ChannelCreateInput,
  type ChannelList,
  type ChannelMember,
  type ChannelMemberList,
  type ChannelUpdateInput,
  type ChatChannel,
  type ThreadCreateInput,
} from "./api.ts";
import { workspaceKeys } from "./keys.ts";

// Named-channel hooks: list/CRUD plus restricted-roster management.
// Mutations invalidate the channel list AND the chat inbox so the rail
// picks up renamed/archived/created rooms without a manual refresh.

async function invalidateChannels(
  queryClient: ReturnType<typeof useQueryClient>,
  orgId: string,
): Promise<void> {
  await queryClient.invalidateQueries({
    queryKey: workspaceKeys.channels(orgId),
  });
  await queryClient.invalidateQueries({
    queryKey: workspaceKeys.chatInbox(),
  });
}

export function useChannels(
  orgId: string | null,
  enabled = true,
): UseQueryResult<ChannelList, ApiError> {
  return useQuery({
    queryKey: workspaceKeys.channels(orgId),
    queryFn: () => listChannels(orgId as string),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: enabled && orgId !== null,
  });
}

export function useCreateChannel(
  orgId: string,
): UseMutationResult<ChatChannel, ApiError, ChannelCreateInput> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ChannelCreateInput) => createChannel(orgId, input),
    onSuccess: () => invalidateChannels(queryClient, orgId),
  });
}

export function useUpdateChannel(
  orgId: string,
  channelId: string,
): UseMutationResult<ChatChannel, ApiError, ChannelUpdateInput> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ChannelUpdateInput) =>
      updateChannel(orgId, channelId, input),
    onSuccess: () => invalidateChannels(queryClient, orgId),
  });
}

export function useChannelMembers(
  orgId: string | null,
  channelId: string | null,
): UseQueryResult<ChannelMemberList, ApiError> {
  return useQuery({
    queryKey: workspaceKeys.channelMembers(orgId, channelId),
    queryFn: () =>
      listChannelMembers(orgId as string, channelId as string),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: orgId !== null && channelId !== null,
  });
}

export function useAddChannelMember(
  orgId: string,
  channelId: string,
): UseMutationResult<ChannelMember, ApiError, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      addChannelMember(orgId, channelId, userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: workspaceKeys.channelMembers(orgId, channelId),
      });
      await queryClient.invalidateQueries({
        queryKey: workspaceKeys.chatInbox(),
      });
    },
  });
}

export function useRemoveChannelMember(
  orgId: string,
  channelId: string,
): UseMutationResult<void, ApiError, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      removeChannelMember(orgId, channelId, userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: workspaceKeys.channelMembers(orgId, channelId),
      });
      await queryClient.invalidateQueries({
        queryKey: workspaceKeys.chatInbox(),
      });
    },
  });
}

// Sub-threads of one room: the listing lives next to the channel
// cache; creates invalidate it plus the merged inbox (the new thread
// room appears there immediately).
export function useRoomThreads(
  orgId: string | null,
  roomId: string | null,
): UseQueryResult<ChannelList, ApiError> {
  return useQuery({
    queryKey: workspaceKeys.roomThreads(orgId, roomId),
    queryFn: () => listRoomThreads(orgId as string, roomId as string),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: orgId !== null && roomId !== null,
  });
}

export function useCreateRoomThread(
  orgId: string,
  roomId: string,
): UseMutationResult<ChatChannel, ApiError, ThreadCreateInput> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ThreadCreateInput) =>
      createRoomThread(orgId, roomId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: workspaceKeys.roomThreads(orgId, roomId),
      });
      await queryClient.invalidateQueries({
        queryKey: workspaceKeys.chatInbox(),
      });
    },
  });
}

// The activity row exists, but the linked sub-thread did not open.
// `code` is the backend envelope code from the thread call.
export class QuickEventPartialError extends Error {
  readonly code: string;
  readonly activityId: string;

  constructor(code: string, activityId: string) {
    super(code);
    this.name = "QuickEventPartialError";
    this.code = code;
    this.activityId = activityId;
  }
}

// Owner or activity:create holders may open events from chat. Same rule as
// the backend gate (chat/channel_helpers.event_creator). The members query
// matches the room header's, so this adds no request.
export function useCanCreateEvent(orgId: string | null): boolean {
  const members = useOrgMembers(orgId, { limit: 50, status: "active" });
  if (members.data?.viewer_role === "owner") return true;
  return (members.data?.viewer_permissions ?? []).includes("activity:create");
}

export interface QuickEventInput {
  activity: ActivityInput;
  threadName: string;
  threadTopic: string;
}

// Draft activity plus a sub-thread under the open parent room. Inbox
// and the org activity list refresh before the caller navigates, so
// the new thread and the events page both see the row immediately.
export function useQuickEventThread(
  orgId: string,
  roomId: string,
): UseMutationResult<
  ChatChannel,
  ApiError | QuickEventPartialError,
  QuickEventInput
> {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { successToast: "activity.thread" },
    mutationFn: async (input: QuickEventInput) => {
      const activity = await createActivity(orgId, input.activity);
      try {
        const thread = await createRoomThread(orgId, roomId, {
          name: input.threadName,
          topic: input.threadTopic,
          kind: "text",
          post_policy: "everyone",
          activity_id: activity.id,
        });
        await queryClient.invalidateQueries({ queryKey: activityKeys.all });
        await queryClient.invalidateQueries({
          queryKey: workspaceKeys.roomThreads(orgId, roomId),
        });
        await queryClient.invalidateQueries({
          queryKey: workspaceKeys.chatInbox(),
        });
        return thread;
      } catch (err: unknown) {
        await queryClient.invalidateQueries({ queryKey: activityKeys.all });
        const code = err instanceof ApiError ? err.code : "REQUEST_FAILED";
        throw new QuickEventPartialError(code, activity.id);
      }
    },
  });
}
