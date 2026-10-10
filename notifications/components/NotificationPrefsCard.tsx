import { useState, type ReactElement } from "react";
import { FiBell, FiBellOff, FiSave } from "react-icons/fi";
import { BentoCard } from "../../core/components/BentoCard.tsx";
import { Button } from "../../core/components/Button.tsx";
import {
  ErrorState,
  LoadingState,
} from "../../core/components/Feedback.tsx";
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "../hooks.ts";

const TYPE_LABELS: Record<string, string> = {
  membership: "Thành viên & lời mời",
  registration: "Đăng ký hoạt động",
  attendance: "Điểm danh",
  hours: "Giờ tình nguyện",
  certificate: "Chứng nhận",
  announcement: "Thông báo hoạt động",
  review: "Đánh giá",
  system: "Hệ thống",
};

const KNOWN_TYPES = Object.keys(TYPE_LABELS);

export function NotificationPrefsCard(): ReactElement {
  const prefs = useNotificationPreferences();
  const update = useUpdateNotificationPreferences();
  const [saved, setSaved] = useState(false);

  if (prefs.isPending) {
    return (
      <BentoCard className="md:col-span-6 lg:col-span-6">
        <LoadingState label="Đang tải tùy chọn…" />
      </BentoCard>
    );
  }
  if (prefs.isError || !prefs.data) {
    return (
      <BentoCard className="md:col-span-6 lg:col-span-6">
        <ErrorState
          title="Không tải được"
          message="Tùy chọn thông báo hiện không khả dụng."
        />
      </BentoCard>
    );
  }

  const inapp = prefs.data.channels["inapp"] ?? true;
  const muted = new Set(prefs.data.muted_types);

  const save = async (next: {
    channels?: Record<string, boolean>;
    muted_types?: string[];
  }): Promise<void> => {
    setSaved(false);
    await update.mutateAsync(next);
    setSaved(true);
  };

  return (
    <BentoCard className="md:col-span-6 lg:col-span-6">
      <div data-rise className="flex items-center gap-2">
        <FiBell
          className="h-5 w-5 text-zinc-900 dark:text-brand"
          aria-hidden="true"
        />
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Thông báo
        </h3>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Nhận thông báo trong ứng dụng
        </p>
        <Button
          variant={inapp ? "primary" : "secondary"}
          disabled={update.isPending}
          onClick={() =>
            void save({ channels: { inapp: !inapp } })
          }
          icon={
            inapp ? (
              <FiBell className="h-4 w-4" aria-hidden="true" />
            ) : (
              <FiBellOff className="h-4 w-4" aria-hidden="true" />
            )
          }
        >
          {inapp ? "Đang bật" : "Đang tắt"}
        </Button>
      </div>
      <p className="mt-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">
        Tắt riêng từng loại
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {KNOWN_TYPES.map((type) => {
          const off = muted.has(type);
          return (
            <Button
              key={type}
              variant={off ? "primary" : "secondary"}
              disabled={update.isPending}
              onClick={() =>
                void save({
                  muted_types: off
                    ? [...muted].filter((t) => t !== type)
                    : [...muted, type],
                })
              }
            >
              {TYPE_LABELS[type]}
            </Button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        Loại đang chọn (đậm) sẽ không gửi thông báo tới bạn.
      </p>
      {saved && (
        <p
          role="status"
          className="mt-2 flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400"
        >
          <FiSave className="h-4 w-4" aria-hidden="true" />
          Đã lưu tùy chọn.
        </p>
      )}
    </BentoCard>
  );
}
