import { useMemo, useState } from "react";
import type { ReactElement } from "react";
import { FiMessageCircle, FiSearch } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Avatar } from "../../core/components/Avatar.tsx";
import { Button } from "../../core/components/Button.tsx";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../core/components/Feedback.tsx";
import { Modal } from "../../core/components/Modal.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { useOrgMembers } from "../../dashboard/members-hooks.ts";
import { useChatInbox, useOpenDm } from "../hooks.ts";
import { toVietnameseWorkspaceMessage } from "../messages.tsx";

const MEMBER_ROW =
  "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left " +
  "transition-colors hover:bg-zinc-100 focus-visible:outline-2 " +
  "focus-visible:outline-offset-2 focus-visible:outline-zinc-500 " +
  "dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-400";

interface NewDmDialogProps {
  open: boolean;
  onClose: () => void;
  orgs: { id: string; name: string }[];
  selfId: string | undefined;
  onOpened: (roomId: string, orgId: string) => void;
}

// "Soạn tin nhắn mới": pick an org folder, then one of its members.
// Members with an existing dm room in that org are hidden, matching the
// old room rail's candidate rule.
export function NewDmDialog({
  open,
  onClose,
  orgs,
  selfId,
  onOpened,
}: NewDmDialogProps): ReactElement {
  const [orgId, setOrgId] = useState<string | null>(null);
  const [term, setTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const activeOrg = orgId ?? orgs[0]?.id ?? null;
  const members = useOrgMembers(activeOrg, { limit: 100, status: "active" });
  const inbox = useChatInbox(selfId !== undefined);
  const openDm = useOpenDm(activeOrg ?? "");

  // Every open resets the picker to the first org and an empty search;
  // adjusted during render so the reset needs no extra pass.
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) {
      setOrgId(null);
      setTerm("");
      setError(null);
    }
  }

  const dmPeers = useMemo(() => {
    const peers = new Set<string>();
    for (const room of inbox.data?.items ?? []) {
      if (room.kind === "dm" && room.org_id === activeOrg && room.peer_id) {
        peers.add(room.peer_id);
      }
    }
    return peers;
  }, [inbox.data, activeOrg]);

  const candidates = useMemo(() => {
    const needle = term.trim().toLowerCase();
    return (members.data?.items ?? []).filter((member) => {
      if (member.user_id === selfId || dmPeers.has(member.user_id)) {
        return false;
      }
      return (
        needle === "" || member.full_name.toLowerCase().includes(needle)
      );
    });
  }, [members.data, selfId, dmPeers, term]);

  function startDm(peerId: string): void {
    if (activeOrg === null) return;
    setError(null);
    openDm.mutate(peerId, {
      onSuccess: (room) => onOpened(room.room_id, activeOrg),
      onError: (err) =>
        setError(
          toVietnameseWorkspaceMessage(
            err instanceof ApiError ? err.code : "REQUEST_FAILED",
          ),
        ),
    });
  }

  return (
    <Modal open={open} title="Tin nhắn mới" onClose={onClose}>
      {orgs.length === 0 ? (
        <EmptyState
          title="Chưa có tổ chức"
          message="Hãy tham gia một tổ chức trước khi nhắn tin riêng."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {orgs.length > 1 && (
            <div
              role="group"
              aria-label="Chọn tổ chức"
              className="flex flex-wrap gap-2"
            >
              {orgs.map((org) => (
                <Button
                  key={org.id}
                  type="button"
                  variant={activeOrg === org.id ? "primary" : "secondary"}
                  onClick={() => setOrgId(org.id)}
                  aria-pressed={activeOrg === org.id}
                  className="min-h-[36px] max-w-[200px] px-3 py-1 text-[13px]"
                >
                  <span className="truncate">{org.name}</span>
                </Button>
              ))}
            </div>
          )}
          <TextField
            label="Tìm thành viên"
            hideLabel
            pill
            name="dm-member-q"
            type="search"
            autoComplete="off"
            placeholder="Tìm thành viên"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            icon={<FiSearch className="h-4 w-4" />}
          />
          {members.isPending && (
            <LoadingState label="Đang tải thành viên…" />
          )}
          {members.isError && (
            <ErrorState
              title="Không tải được thành viên"
              message={toVietnameseWorkspaceMessage(
                members.error instanceof ApiError
                  ? members.error.code
                  : "REQUEST_FAILED",
              )}
            />
          )}
          {members.data !== undefined && candidates.length === 0 && (
            <EmptyState
              title="Không còn ai để nhắn"
              message="Mọi thành viên đã có cuộc trò chuyện riêng với bạn."
            />
          )}
          {candidates.length > 0 && (
            <ul
              aria-label="Chọn người nhận"
              className="max-h-[50vh] overflow-y-auto"
            >
              {candidates.map((member) => (
                <li key={member.user_id}>
                  <button
                    type="button"
                    className={MEMBER_ROW}
                    disabled={openDm.isPending}
                    onClick={() => startDm(member.user_id)}
                  >
                    <Avatar name={member.full_name} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {member.full_name}
                      </span>
                      <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400">
                        {member.roles.join(", ")}
                      </span>
                    </span>
                    <FiMessageCircle
                      className="h-4 w-4 shrink-0 text-zinc-400"
                      aria-hidden="true"
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {openDm.isPending && (
            <LoadingState label="Đang mở cuộc trò chuyện…" />
          )}
          {error !== null && (
            <p
              role="alert"
              className="text-xs text-red-600 dark:text-red-400"
            >
              {error}
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}
