import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { FiCheckCircle, FiSend } from "react-icons/fi";
import { Section } from "../../core/components/Section.tsx";
import { Button } from "../../core/components/Button.tsx";
import { ErrorState } from "../../core/components/Feedback.tsx";
import { cleanBlocks, readingMinutes, wordCount } from "../article.ts";
import type { ArticleEditorState } from "../editor-hooks.ts";
import {
  formatTime,
  POST_KIND_LABELS,
  POST_STATUS_LABELS,
  readingTimeLabel,
  toVietnameseWorkspaceMessage,
} from "../messages.tsx";
import { CoverPicker } from "./CoverPicker.tsx";

interface PublishPanelProps {
  editor: ArticleEditorState;
  orgId: string;
  canAnnounce: boolean;
}

// Right rail of the write page: status chip, kind toggle (standalone
// drafts only - revisions follow the live post's kind), cover picker,
// live stats, and the save-draft / publish pipeline.
export function PublishPanel({
  editor,
  orgId,
  canAnnounce,
}: PublishPanelProps): ReactElement {
  const blocks = cleanBlocks(editor.blocks);
  const words = wordCount(blocks);
  const minutes = readingMinutes(words);
  const published = editor.status === "published";
  const isRevision = editor.revisionOf !== null;
  const statusLabel =
    editor.status === "new"
      ? "Bản nháp mới"
      : isRevision
        ? "Nháp chờ đăng"
        : editor.status === "draft" && editor.wasPublished
          ? "Đã gỡ xuống"
          : POST_STATUS_LABELS[editor.status];
  const announceBlocked = editor.kind === "announcement" && !canAnnounce;
  const saveLabel = published
    ? "Lưu thay đổi"
    : announceBlocked
      ? "Cần quyền đăng thông báo"
      : isRevision || editor.wasPublished
        ? "Đăng lại"
        : "Đăng bài";
  const draftLabel = published ? "Lưu nháp riêng" : "Lưu nháp";

  return (
    <Section>
      <div data-rise className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
          Xuất bản
        </h2>
        <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          {statusLabel}
        </span>
      </div>
      {!published && !isRevision && (
        <div className="mt-3">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Loại bài viết
          </p>
          <div role="group" aria-label="Loại bài viết" className="mt-2 flex gap-2">
            {(["discussion", "announcement"] as const).map((kind) => (
              <Button
                key={kind}
                type="button"
                variant={editor.kind === kind ? "primary" : "secondary"}
                onClick={() => editor.setKind(kind)}
                aria-pressed={editor.kind === kind}
                disabled={kind === "announcement" && !canAnnounce}
                title={
                  kind === "announcement" && !canAnnounce
                    ? "Chỉ quản lý mới đăng được thông báo"
                    : undefined
                }
              >
                {POST_KIND_LABELS[kind]}
              </Button>
            ))}
          </div>
        </div>
      )}
      {isRevision && (
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          Đây là bản nháp riêng của bài đang hiển thị — đăng lại sẽ thay
          thế bản đang hiển thị.{" "}
          <Link
            to={`/manage/board/post?org=${orgId}&post=${editor.revisionOf}`}
            className="underline decoration-zinc-300 underline-offset-2 hover:text-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:decoration-zinc-600 dark:hover:text-zinc-200 dark:focus-visible:outline-zinc-400"
          >
            Xem bài đang hiển thị
          </Link>
        </p>
      )}
      <div className="mt-3">
        <CoverPicker
          coverId={editor.coverId}
          lookup={editor.lookup}
          upload={editor.uploads["cover"]}
          onChange={(file) => void editor.changeCover(file)}
        />
      </div>
      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
        {`${blocks.length} khối · ${words} từ · ${readingTimeLabel(minutes)}`}
      </p>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        {editor.dirty
          ? "Có thay đổi chưa lưu."
          : editor.savedAt !== null
            ? `Đã lưu lúc ${formatTime(editor.savedAt)}`
            : "Chưa lưu lần nào."}
      </p>
      {editor.errorCode !== null && (
        <div className="mt-3">
          <ErrorState
            title="Chưa lưu được"
            message={toVietnameseWorkspaceMessage(editor.errorCode)}
          />
        </div>
      )}
      <div className="mt-4 flex flex-col gap-2">
        <Button
          type="button"
          variant="primary"
          disabled={editor.saving || announceBlocked}
          onClick={() => void editor.save("publish")}
          icon={<FiSend className="h-4 w-4" aria-hidden="true" />}
        >
          {editor.saving ? "Đang lưu…" : saveLabel}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={editor.saving}
          onClick={() => void editor.save("draft")}
          icon={<FiCheckCircle className="h-4 w-4" aria-hidden="true" />}
        >
          {editor.saving ? "Đang lưu…" : draftLabel}
        </Button>
      </div>
    </Section>
  );
}
