import { useState } from "react";
import type { FormEvent, ReactElement } from "react";
import { Link } from "react-router-dom";
import { FiCalendar } from "react-icons/fi";
import { toLocalInput } from "../../activities/dates.tsx";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { Modal } from "../../core/components/Modal.tsx";
import { SelectField } from "../../core/components/SelectField.tsx";
import { TextArea } from "../../core/components/TextArea.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import {
  QuickEventPartialError,
  useQuickEventThread,
} from "../channel-hooks.ts";
import { toVietnameseWorkspaceMessage } from "../messages.tsx";

const LINK =
  "text-sm text-zinc-900 underline decoration-zinc-400 decoration-2 " +
  "underline-offset-2 hover:bg-zinc-100 focus-visible:outline-2 " +
  "focus-visible:outline-offset-2 focus-visible:outline-zinc-500 " +
  "dark:text-zinc-100 dark:decoration-zinc-500 dark:hover:bg-zinc-900 " +
  "dark:focus-visible:outline-zinc-400";

interface QuickEventDialogProps {
  open: boolean;
  onClose: () => void;
  orgId: string;
  roomId: string;
  onCreated: (threadId: string) => void;
}

function nextHourValue(): string {
  const date = new Date();
  date.setMinutes(0, 0, 0);
  date.setHours(date.getHours() + 1);
  return toLocalInput(date.toISOString());
}

// Few fields from a parent room: a draft activity plus the sub-thread
// used to announce and coordinate it.
export function QuickEventDialog({
  open,
  onClose,
  orgId,
  roomId,
  onCreated,
}: QuickEventDialogProps): ReactElement {
  const [title, setTitle] = useState("");
  const [startAt, setStartAt] = useState("");
  const [place, setPlace] = useState<"place" | "remote">("place");
  const [location, setLocation] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) {
      setTitle("");
      setStartAt(nextHourValue());
      setPlace("place");
      setLocation("");
      setNote("");
      setError(null);
      setDraftId(null);
    }
  }

  const create = useQuickEventThread(orgId, roomId);
  const busy = create.isPending;
  const name = title.trim();
  const ready = name.length >= 3 && startAt !== "" && !busy;

  function fail(err: unknown): void {
    if (err instanceof QuickEventPartialError) {
      setDraftId(err.activityId);
      setError(toVietnameseWorkspaceMessage(err.code));
      return;
    }
    setDraftId(null);
    setError(
      toVietnameseWorkspaceMessage(
        err instanceof ApiError ? err.code : "REQUEST_FAILED",
      ),
    );
  }

  function submit(event: FormEvent): void {
    event.preventDefault();
    if (!ready) return;
    setError(null);
    setDraftId(null);
    const remote = place === "remote";
    create.mutate(
      {
        title: name,
        description: note.trim() || null,
        location: remote ? null : location.trim() || null,
        isRemote: remote,
        startAt: new Date(startAt).toISOString(),
        threadName: name.slice(0, 80),
        threadTopic: (note.trim() || name).slice(0, 200),
      },
      {
        onSuccess: (thread) => {
          onClose();
          onCreated(thread.channel_id);
        },
        onError: fail,
      },
    );
  }

  return (
    <Modal open={open} title="Tạo sự kiện nhanh" onClose={onClose}>
      <form
        onSubmit={submit}
        className="flex flex-col gap-3"
        aria-busy={busy}
      >
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Sự kiện lưu dạng bản nháp trên Quản lý hoạt động. Một luồng
          chat mở ngay để gửi thông báo và điều phối.
        </p>
        <TextField
          label="Tên sự kiện"
          name="quick-event-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Ngày hội hiến máu"
          minLength={3}
          maxLength={160}
          autoComplete="off"
          required
        />
        <TextField
          label="Bắt đầu"
          name="quick-event-start"
          type="datetime-local"
          value={startAt}
          onChange={(event) => setStartAt(event.target.value)}
          required
        />
        <SelectField
          label="Hình thức"
          name="quick-event-place"
          value={place}
          onChange={(value) => setPlace(value as typeof place)}
          options={[
            { value: "place", label: "Tại chỗ" },
            { value: "remote", label: "Trực tuyến" },
          ]}
        />
        {place === "place" && (
          <TextField
            label="Địa điểm"
            name="quick-event-location"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Công viên Lê Văn Tám"
            maxLength={200}
            autoComplete="off"
          />
        )}
        <TextArea
          label="Ghi chú"
          name="quick-event-note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Việc cần thông báo cho cả phòng"
          maxLength={200}
          rows={2}
          hint="Dùng làm mô tả sự kiện và chủ đề của luồng chat."
        />
        {error !== null && (
          <p role="alert" className="text-xs text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        {draftId !== null && (
          <Link
            to={`/manage/events/${orgId}/${draftId}`}
            className={LINK}
          >
            Mở bản nháp trên Quản lý hoạt động
          </Link>
        )}
        <Button
          type="submit"
          variant="primary"
          disabled={!ready}
          icon={<FiCalendar className="h-4 w-4" aria-hidden="true" />}
        >
          Tạo sự kiện và mở luồng
        </Button>
      </form>
    </Modal>
  );
}
