import { useMemo, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import {
  FiFile,
  FiImage,
  FiLink,
  FiUsers,
  FiVideo,
} from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { SelectField } from "../../core/components/SelectField.tsx";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../core/components/Feedback.tsx";
import { ChatMediaGrid } from "./ChatMediaGrid.tsx";
import { ChatMembersCard } from "./ChatMembersCard.tsx";
import { ChatSharedRow } from "./ChatSharedRow.tsx";
import {
  useDeleteChatMessage,
  useSharedMedia,
  useSharedMediaAuthors,
} from "../hooks.ts";
import { toVietnameseWorkspaceMessage } from "../messages.tsx";
import type { SharedMediaKind } from "../api.ts";

type PanelTab = SharedMediaKind | "members";

interface ChatSharedPanelProps {
  roomId: string;
  // Query only runs while the info drawer is open.
  open: boolean;
  selfId: string | undefined;
  // chat:manage viewers may remove other members' shared items too.
  canManage: boolean;
  // Members tab needs org context; hidden for direct messages.
  orgId: string | null;
  isDm: boolean;
  onClose: () => void;
}

const MEDIA_TABS: { kind: SharedMediaKind; label: string; icon: ReactNode }[] = [
  { kind: "image", label: "Ảnh", icon: <FiImage aria-hidden="true" /> },
  { kind: "video", label: "Video", icon: <FiVideo aria-hidden="true" /> },
  { kind: "file", label: "Tệp", icon: <FiFile aria-hidden="true" /> },
  { kind: "link", label: "Liên kết", icon: <FiLink aria-hidden="true" /> },
];

const EMPTY: Record<SharedMediaKind, string> = {
  image: "Chưa có ảnh nào được chia sẻ.",
  video: "Chưa có video nào được chia sẻ.",
  file: "Chưa có tệp nào được chia sẻ.",
  link: "Chưa có liên kết nào được chia sẻ.",
};

// Thumbnail kinds render as a wall; file/link stay list rows.
const GRID_KINDS: ReadonlySet<SharedMediaKind> = new Set(["image", "video"]);

export function ChatSharedPanel({
  roomId,
  open,
  selfId,
  canManage,
  orgId,
  isDm,
  onClose,
}: ChatSharedPanelProps): ReactElement {
  const [tab, setTab] = useState<PanelTab>("image");
  // Sender filter applies across every media tab; "" = everyone.
  const [authorId, setAuthorId] = useState("");
  const mediaTab = tab === "members" ? null : tab;
  const mediaKind = mediaTab ?? "image";
  const authors = useSharedMediaAuthors(roomId, open);
  const query = useSharedMedia(
    roomId,
    mediaKind,
    authorId === "" ? null : authorId,
    open && mediaTab !== null,
  );
  const remove = useDeleteChatMessage(roomId);
  const items = useMemo(
    () => (query.data?.pages ?? []).flatMap((page) => page.items),
    [query.data],
  );
  const senderOptions = useMemo(
    () => [
      { value: "", label: "Tất cả mọi người" },
      ...(authors.data?.items ?? []).map((a) => ({
        value: a.author_id,
        label: a.author_name,
      })),
    ],
    [authors.data],
  );

  const tabs = isDm
    ? MEDIA_TABS
    : [
        ...MEDIA_TABS,
        { kind: "members" as const, label: "Thành viên", icon: <FiUsers aria-hidden="true" /> },
      ];

  return (
    <div>
      <div
        role="tablist"
        aria-label="Nội dung phòng"
        className={`grid gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-900 ${
          isDm ? "grid-cols-4" : "grid-cols-5"
        }`}
      >
        {tabs.map(({ kind, label, icon }) => (
          <button
            key={kind}
            type="button"
            role="tab"
            aria-selected={tab === kind}
            onClick={() => setTab(kind)}
            className={`flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-2 text-[11px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:focus-visible:outline-zinc-400 ${
              tab === kind
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <span className="h-4 w-4 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>
      {mediaTab !== null && senderOptions.length > 1 && (
        <div className="mt-2">
          <SelectField
            label="Người gửi"
            value={authorId}
            onChange={setAuthorId}
            options={senderOptions}
            id="shared-media-sender"
          />
        </div>
      )}
      <div role="tabpanel" className="mt-2">
        {mediaTab === null ? (
          <ChatMembersCard orgId={orgId} onClose={onClose} bare />
        ) : (
          <>
            {query.isPending && <LoadingState label="Đang tải…" />}
            {query.isError && (
              <ErrorState
                title="Không tải được nội dung"
                message={toVietnameseWorkspaceMessage(
                  query.error instanceof ApiError
                    ? query.error.code
                    : "REQUEST_FAILED",
                )}
              />
            )}
            {query.data !== undefined && items.length === 0 && (
              <EmptyState title="Trống" message={EMPTY[mediaKind]} />
            )}
            {GRID_KINDS.has(mediaKind) ? (
              <ChatMediaGrid
                items={items}
                selfId={selfId}
                canManage={canManage}
                deleting={remove.isPending}
                onDelete={(id) => remove.mutate(id)}
              />
            ) : (
              <ul className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
                {items.map((item) => (
                  <ChatSharedRow
                    key={`${item.message_id}-${item.url}`}
                    item={item}
                    canDelete={item.author_id === selfId || canManage}
                    deleting={remove.isPending}
                    onDelete={(id) => remove.mutate(id)}
                  />
                ))}
              </ul>
            )}
            {query.hasNextPage && (
              <button
                type="button"
                onClick={() => void query.fetchNextPage()}
                disabled={query.isFetchingNextPage}
                className="mt-2 w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 disabled:opacity-60 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-400"
              >
                {query.isFetchingNextPage ? "Đang tải…" : "Xem thêm"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
