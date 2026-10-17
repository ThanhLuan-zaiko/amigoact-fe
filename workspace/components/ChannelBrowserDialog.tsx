import { useState } from "react";
import type { ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../core/components/Feedback.tsx";
import { Modal } from "../../core/components/Modal.tsx";
import { useOrgMembers } from "../../dashboard/members-hooks.ts";
import type { ChatChannel } from "../api.ts";
import { useChannels } from "../channel-hooks.ts";
import { toVietnameseWorkspaceMessage } from "../messages.tsx";
import { ChannelFormDialog } from "./ChannelFormDialog.tsx";
import { ChannelMembersDialog } from "./ChannelMembersDialog.tsx";
import { ChannelRow } from "./ChannelRow.tsx";

interface ChannelBrowserDialogProps {
  open: boolean;
  onClose: () => void;
  orgs: { id: string; name: string }[];
}

// Channel directory per org: every visible channel with open/edit/
// archive actions for managers, plus the create-channel entry point.
export function ChannelBrowserDialog({
  open,
  onClose,
  orgs,
}: ChannelBrowserDialogProps): ReactElement {
  const [orgId, setOrgId] = useState<string | null>(null);
  const [editing, setEditing] = useState<ChatChannel | null>(null);
  const [creating, setCreating] = useState(false);
  const [rosterFor, setRosterFor] = useState<ChatChannel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const activeOrg = orgId ?? orgs[0]?.id ?? null;
  const channels = useChannels(activeOrg, open);
  const members = useOrgMembers(activeOrg, {
    limit: 50,
    status: "active",
  });
  const navigate = useNavigate();
  const canManage =
    (members.data?.viewer_role ?? "") === "owner" ||
    (members.data?.viewer_permissions ?? []).includes("chat:manage");

  function openRoom(channel: ChatChannel): void {
    onClose();
    navigate(`/manage/chat?room=${channel.channel_id}`);
  }

  function fail(err: unknown): void {
    setError(
      toVietnameseWorkspaceMessage(
        err instanceof ApiError ? err.code : "REQUEST_FAILED",
      ),
    );
  }

  return (
    <>
      <Modal open={open} title="Kênh của tổ chức" onClose={onClose}>
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
          {channels.isPending && (
            <LoadingState label="Đang tải kênh…" />
          )}
          {channels.isError && (
            <ErrorState
              title="Không tải được kênh"
              message={toVietnameseWorkspaceMessage(
                channels.error instanceof ApiError
                  ? channels.error.code
                  : "REQUEST_FAILED",
              )}
            />
          )}
          {channels.data !== undefined &&
            channels.data.items.length === 0 && (
              <EmptyState
                title="Chưa có kênh"
                message={
                  canManage
                    ? "Tạo kênh đầu tiên để tách chủ đề trò chuyện."
                    : "Quản lý chưa tạo kênh nào cho tổ chức này."
                }
              />
            )}
          <ul className="flex flex-col gap-1.5">
            {(channels.data?.items ?? []).map((channel) => (
              <ChannelRow
                key={channel.channel_id}
                channel={channel}
                canManage={canManage}
                orgId={activeOrg ?? ""}
                onOpen={() => openRoom(channel)}
                onEdit={() => setEditing(channel)}
                onRoster={() => setRosterFor(channel)}
                onError={fail}
              />
            ))}
          </ul>
          {canManage && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setCreating(true)}
              icon={<FiPlus className="h-4 w-4" aria-hidden="true" />}
            >
              Tạo kênh mới
            </Button>
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
      </Modal>
      {activeOrg !== null && (
        <ChannelFormDialog
          open={creating || editing !== null}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          orgId={activeOrg}
          channel={editing}
        />
      )}
      {activeOrg !== null && rosterFor !== null && (
        <ChannelMembersDialog
          open={rosterFor !== null}
          onClose={() => setRosterFor(null)}
          orgId={activeOrg}
          channel={rosterFor}
        />
      )}
    </>
  );
}
