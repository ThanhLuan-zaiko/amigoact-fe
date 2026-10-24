import { useState } from "react";
import type { FormEvent, ReactElement } from "react";
import { Link } from "react-router-dom";
import { FiCalendar } from "react-icons/fi";
import { toLocalInput } from "../../activities/dates.tsx";
import { useCategories } from "../../activities/hooks.ts";
import {
  initialActivityValues,
  toActivityInput,
  toTagSuggestions,
} from "../../activities/form-values.ts";
import { useMyTags } from "../../activities/tags-hooks.ts";
import { ApiError } from "../../core/api.ts";
import {
  ActivityFields,
  type ActivityFieldValues,
} from "../../core/components/ActivityFields.tsx";
import { Button } from "../../core/components/Button.tsx";
import { Modal } from "../../core/components/Modal.tsx";
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

// Defaults match the activity form on /manage/events, with the start time
// set to the next full hour.
function quickEventDefaults(): ActivityFieldValues {
  return { ...initialActivityValues(), startAt: nextHourValue() };
}

// Same fields as the activity form on /manage/events. Saving creates a draft
// activity and a sub-thread in this room, then opens that thread.
export function QuickEventDialog({
  open,
  onClose,
  orgId,
  roomId,
  onCreated,
}: QuickEventDialogProps): ReactElement {
  const [values, setValues] = useState<ActivityFieldValues>(quickEventDefaults);
  const [error, setError] = useState<string | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) {
      setValues(quickEventDefaults());
      setError(null);
      setDraftId(null);
    }
  }

  const categories = useCategories(orgId);
  const tags = useMyTags();
  const create = useQuickEventThread(orgId, roomId);
  const busy = create.isPending;
  const name = values.title.trim();
  const ready = name.length >= 3 && values.startAt !== "" && !busy;

  function patch(next: Partial<ActivityFieldValues>): void {
    setValues((prev) => ({ ...prev, ...next }));
  }

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
    create.mutate(
      {
        activity: toActivityInput(values),
        threadName: name.slice(0, 80),
        threadTopic: (values.description.trim() || name).slice(0, 200),
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
    <Modal open={open} title="Tạo sự kiện nhanh" onClose={onClose} wide>
      <form
        onSubmit={submit}
        className="flex flex-col gap-3"
        aria-busy={busy}
      >
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Sự kiện lưu dạng bản nháp trên Quản lý hoạt động. Một luồng
          chat mở ngay để gửi thông báo và điều phối.
        </p>
        <ActivityFields
          values={values}
          onChange={patch}
          categories={categories.data ?? []}
          tagSuggestions={toTagSuggestions(tags.data)}
          tagSuggestionsError={tags.isError}
          disabled={busy}
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
