import { useState, type ReactElement } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import {
  useCreateSlot,
  useDeleteSlot,
  useSlots,
} from "../slots-hooks.ts";

interface SlotEditorProps {
  orgId: string;
  activityId: string;
  scheduleId: string;
}

export function SlotEditor({
  orgId,
  activityId,
  scheduleId,
}: SlotEditorProps): ReactElement {
  const slots = useSlots(orgId, activityId);
  const create = useCreateSlot(orgId, activityId);
  const remove = useDeleteSlot(orgId, activityId);
  const [title, setTitle] = useState("");
  const [capacity, setCapacity] = useState("");
  const [error, setError] = useState("");
  const mine = (slots.data ?? []).filter(
    (s) => s.schedule_id === scheduleId,
  );

  const add = async (): Promise<void> => {
    setError("");
    try {
      const parsed = capacity.trim() ? Number(capacity) : null;
      await create.mutateAsync({
        scheduleId,
        input: {
          title: title.trim(),
          capacity:
            parsed != null && Number.isFinite(parsed) && parsed > 0
              ? Math.floor(parsed)
              : null,
        },
      });
      setTitle("");
      setCapacity("");
    } catch (cause) {
      setError(
        cause instanceof ApiError ? cause.message : "Không thêm được ca.",
      );
    }
  };

  return (
    <div className="mt-2 flex flex-col gap-2 border-t border-zinc-100 pt-2 dark:border-zinc-800/60">
      {mine.map((s) => (
        <div
          key={s.slot_id}
          className="flex items-center justify-between gap-2 text-xs text-zinc-600 dark:text-zinc-400"
        >
          <span>
            {s.title}
            <span className="ml-2 text-zinc-400 dark:text-zinc-500">
              {s.capacity != null
                ? `${s.registered}/${s.capacity}`
                : `${s.registered} đăng ký`}
            </span>
          </span>
          <Button
            size="icon"
            variant="ghost"
            aria-label={`Xóa ca ${s.title}`}
            disabled={remove.isPending}
            onClick={() =>
              void remove
                .mutateAsync({ scheduleId, slotId: s.slot_id })
                .catch((cause: unknown) =>
                  setError(
                    cause instanceof ApiError
                      ? cause.message
                      : "Không xóa được ca.",
                  ),
                )
            }
            icon={<FiTrash2 className="h-3 w-3" aria-hidden="true" />}
          >
            <span className="sr-only">Xóa</span>
          </Button>
        </div>
      ))}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <TextField
            label="Tên ca"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="VD: Ca sáng"
          />
        </div>
        <div className="w-24">
          <TextField
            label="Sức chứa"
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
          />
        </div>
        <Button
          variant="ghost"
          onClick={() => void add()}
          disabled={title.trim().length < 1 || create.isPending}
          icon={<FiPlus className="h-4 w-4" aria-hidden="true" />}
        >
          <span className="sr-only">Thêm ca</span>
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
