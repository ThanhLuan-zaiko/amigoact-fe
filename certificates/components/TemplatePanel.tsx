import { useState, type ReactElement } from "react";
import {
  FiPlus,
  FiToggleLeft,
  FiToggleRight,
} from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../core/components/Feedback.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { useCreateTemplate, useTemplates, useUpdateTemplate } from "../hooks.ts";

interface TemplatePanelProps {
  orgId: string;
}

export function TemplatePanel({ orgId }: TemplatePanelProps): ReactElement {
  const templates = useTemplates(orgId);
  const create = useCreateTemplate(orgId);
  const update = useUpdateTemplate(orgId);
  const [name, setName] = useState("");
  const [layout, setLayout] = useState("");
  const [error, setError] = useState("");

  const submit = async (): Promise<void> => {
    setError("");
    if (!name.trim()) {
      setError("Nhập tên mẫu chứng nhận.");
      return;
    }
    if (layout.trim()) {
      try {
        JSON.parse(layout);
      } catch {
        setError("Layout phải là JSON hợp lệ.");
        return;
      }
    }
    try {
      await create.mutateAsync({
        name: name.trim(),
        layout_json: layout.trim() || null,
      });
      setName("");
      setLayout("");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Có lỗi xảy ra.",
      );
    }
  };

  if (templates.isPending) {
    return <LoadingState label="Đang tải mẫu chứng nhận…" />;
  }
  if (templates.isError) {
    return (
      <ErrorState
        title="Không tải được"
        message={templates.error?.message}
      />
    );
  }
  const rows = templates.data ?? [];

  return (
    <div data-rise>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
        Mẫu chứng nhận
      </h3>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        Mẫu đang bật được chọn khi cấp chứng nhận trong danh sách đăng ký.
      </p>
      {rows.length === 0 ? (
        <EmptyState
          title="Chưa có mẫu"
          message="Tạo mẫu để tùy biến nền và bố cục chứng nhận."
        />
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {rows.map((t) => (
            <li
              key={t.template_id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
            >
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {t.name}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {t.layout_json ? "Có layout tùy biến" : "Layout mặc định"}
                  {t.background_media_id ? " · Có ảnh nền" : ""}
                </p>
              </div>
              <Button
                variant="ghost"
                disabled={update.isPending}
                onClick={() =>
                  void update.mutateAsync({
                    templateId: t.template_id,
                    patch: { is_active: !t.is_active },
                  })
                }
                icon={
                  t.is_active ? (
                    <FiToggleRight className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <FiToggleLeft className="h-4 w-4" aria-hidden="true" />
                  )
                }
              >
                {t.is_active ? "Đang bật" : "Đang tắt"}
              </Button>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 border-t border-zinc-200 pt-3 dark:border-zinc-800">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <TextField
            label="Tên mẫu"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Mẫu chứng nhận 2026"
            className="flex-1"
          />
          <TextField
            label="Layout JSON (tùy chọn)"
            value={layout}
            onChange={(e) => setLayout(e.target.value)}
            placeholder='{"title_y": 120}'
            className="flex-1"
          />
          <Button
            variant="secondary"
            disabled={create.isPending}
            onClick={() => void submit()}
            icon={<FiPlus className="h-4 w-4" aria-hidden="true" />}
          >
            Thêm mẫu
          </Button>
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
