import { useState } from "react";
import type { ReactElement, ReactNode } from "react";
import {
  FiActivity,
  FiHash,
  FiMessageCircle,
  FiPlus,
} from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { BentoCard } from "../../core/components/BentoCard.tsx";
import { Button } from "../../core/components/Button.tsx";
import {
  ErrorState,
  LoadingState,
} from "../../core/components/Feedback.tsx";
import type { DashboardMember } from "../../dashboard/members-api.ts";
import { useOrgActivities } from "../../activities/hooks.ts";
import { useDmRooms, useOpenDm } from "../hooks.ts";
import type { DmRoom } from "../api.ts";
import { toVietnameseWorkspaceMessage } from "../messages.tsx";

const ROOM_BASE =
  "w-full justify-start gap-2 whitespace-normal text-left font-normal";

interface ChatRoomRailProps {
  orgId: string;
  roomId: string;
  selfId?: string;
  members: DashboardMember[];
  onSelect: (roomId: string) => void;
}

function RoomButton({
  active,
  icon,
  children,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  children: ReactNode;
  onClick: () => void;
}): ReactElement {
  return (
    <Button
      type="button"
      variant="ghost"
      aria-pressed={active}
      onClick={onClick}
      icon={icon}
      className={`${ROOM_BASE} ${
        active
          ? "bg-brand/15 text-zinc-900 hover:bg-brand/20 " +
            "dark:bg-brand/20 dark:text-zinc-100 dark:hover:bg-brand/25"
          : ""
      }`}
    >
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </Button>
  );
}

// Right rail of the chat page: the general room, one room per activity,
// and the dm inbox with a member picker to start new conversations.
export function ChatRoomRail({
  orgId,
  roomId,
  selfId,
  members,
  onSelect,
}: ChatRoomRailProps): ReactElement {
  const activities = useOrgActivities(orgId);
  const dmRooms = useDmRooms(orgId);
  const openDm = useOpenDm(orgId);
  const [picking, setPicking] = useState(false);
  const [dmError, setDmError] = useState<string | null>(null);

  const dmPeers = new Set(
    (dmRooms.data?.items ?? []).map((room: DmRoom) => room.peer_id),
  );
  // Members without an existing dm room, minus the caller.
  const candidates = members.filter(
    (member) => member.user_id !== selfId && !dmPeers.has(member.user_id),
  );

  function startDm(peerId: string): void {
    setDmError(null);
    openDm.mutate(peerId, {
      onSuccess: (room) => {
        setPicking(false);
        onSelect(room.room_id);
      },
      onError: (error) =>
        setDmError(
          toVietnameseWorkspaceMessage(
            error instanceof ApiError ? error.code : "REQUEST_FAILED",
          ),
        ),
    });
  }

  return (
    <BentoCard className="md:col-span-6 lg:col-span-4">
      <div data-rise>
        <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          <FiHash className="h-5 w-5" aria-hidden="true" />
          Kênh trò chuyện
        </h2>
      </div>
      <nav aria-label="Kênh trò chuyện" className="mt-3 flex flex-col gap-1.5">
        <RoomButton
          active={roomId === orgId}
          icon={<FiMessageCircle className="h-4 w-4" aria-hidden="true" />}
          onClick={() => onSelect(orgId)}
        >
          Phòng chung
        </RoomButton>

        {activities.isPending && (
          <LoadingState label="Đang tải hoạt động…" />
        )}
        {(activities.data?.length ?? 0) > 0 && (
          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Theo hoạt động
          </p>
        )}
        {(activities.data ?? []).map((activity) => (
          <RoomButton
            key={activity.id}
            active={roomId === activity.id}
            icon={<FiActivity className="h-4 w-4" aria-hidden="true" />}
            onClick={() => onSelect(activity.id)}
          >
            {activity.title}
          </RoomButton>
        ))}

        <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Tin nhắn riêng
        </p>
        {dmRooms.isPending && <LoadingState label="Đang tải…" />}
        {dmRooms.isError && (
          <ErrorState
            title="Không tải được tin nhắn riêng"
            message={toVietnameseWorkspaceMessage(
              dmRooms.error instanceof ApiError
                ? dmRooms.error.code
                : "REQUEST_FAILED",
            )}
          />
        )}
        {(dmRooms.data?.items ?? []).map((room) => (
          <RoomButton
            key={room.room_id}
            active={roomId === room.room_id}
            icon={<FiMessageCircle className="h-4 w-4" aria-hidden="true" />}
            onClick={() => onSelect(room.room_id)}
          >
            {room.peer_name}
          </RoomButton>
        ))}

        {!picking && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => setPicking(true)}
            disabled={candidates.length === 0}
            icon={<FiPlus className="h-4 w-4" aria-hidden="true" />}
            className="mt-1 self-start"
          >
            Nhắn tin mới
          </Button>
        )}
        {picking && (
          <div className="mt-1 flex flex-col gap-1.5">
            {candidates.map((member) => (
              <RoomButton
                key={member.user_id}
                active={false}
                icon={<FiPlus className="h-4 w-4" aria-hidden="true" />}
                onClick={() => startDm(member.user_id)}
              >
                {member.full_name}
              </RoomButton>
            ))}
            {candidates.length === 0 && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Không còn thành viên nào để nhắn tin mới.
              </p>
            )}
            <Button
              type="button"
              variant="ghost"
              onClick={() => setPicking(false)}
            >
              Đóng
            </Button>
          </div>
        )}
        {openDm.isPending && (
          <LoadingState label="Đang mở cuộc trò chuyện…" />
        )}
        {dmError && (
          <p role="alert" className="text-xs text-red-600 dark:text-red-400">
            {dmError}
          </p>
        )}
      </nav>
    </BentoCard>
  );
}
