"use client";

import Link from "next/link";
import { useState } from "react";
import {
  FiBell,
  FiFileText,
  FiMessageCircle,
  FiSave,
  FiSend,
  FiX,
} from "react-icons/fi";
import type { FormState } from "@/lib/account";
import { type PostKind, validatePost } from "@/lib/posts";
import { FormMessage, TextField } from "../account/FormParts";
import { useAccountForm } from "../account/useAccountForm";
import BodyField from "../compose/BodyField";
import MediaField from "../compose/MediaField";
import SelectMenu from "../SelectMenu";
import {
  chipButton,
  chipPressed,
  fieldLabel,
  iconButton,
  mutedText,
  neutralButton,
  panel,
  primaryButton,
} from "../ui";

type Action = (previous: FormState, formData: FormData) => Promise<FormState>;

export type PostFormInitial = {
  kind: PostKind;
  visibility: string;
  title: string;
  body: string;
  tags: string[];
  media: { id: string; mime: string }[];
  isDraft: boolean;
};

type PostFormProps = {
  action: Action;
  // The kinds this user may post here. Only managers announce.
  kinds: PostKind[];
  organizationName: string;
  cancelHref: string;
  draftsHref: string;
  // Present when editing. The kind of an existing post cannot change.
  initial?: PostFormInitial;
};

const KIND_LABELS: Record<PostKind, string> = {
  announcement: "Thông báo",
  discussion: "Thảo luận",
};

function readValues(form: HTMLFormElement) {
  const data = new FormData(form);
  const text = (name: string) => String(data.get(name) ?? "");
  return {
    title: text("post_title"),
    body: text("post_body"),
    tags: text("post_tags"),
    kind: text("kind"),
    visibility: text("visibility"),
    mediaCount: data.getAll("media_id").length,
  };
}

export default function PostForm({
  action,
  kinds,
  organizationName,
  cancelHref,
  draftsHref,
  initial,
}: PostFormProps) {
  const editing = initial !== undefined;
  const [kind, setKind] = useState<PostKind>(
    initial?.kind ?? kinds[kinds.length - 1] ?? "discussion",
  );
  // A saved draft keeps what was typed. A new post clears after a draft save.
  const { state, pending, formProps } = useAccountForm(action, {
    resetOnSuccess: !editing,
    validate: (form) => validatePost(readValues(form)),
  });
  const errors = state.fieldErrors;
  const shownKinds = editing ? [kind] : kinds;
  const showDraftButton = !editing || initial.isDraft;

  return (
    <form
      {...formProps}
      className={`${panel} flex flex-col gap-5 p-4 sm:p-6`}
      aria-labelledby="post-form-title"
    >
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="flex min-w-0 flex-1 flex-col">
          <h1
            id="post-form-title"
            className="text-xl font-extrabold tracking-tight"
          >
            {editing ? "Sửa bài viết" : "Tạo bài viết"}
          </h1>
          <p className={`${mutedText} truncate`}>{organizationName}</p>
        </div>
        <Link
          href={cancelHref}
          aria-label="Đóng"
          title="Đóng"
          className={iconButton}
        >
          <FiX aria-hidden="true" />
        </Link>
      </div>

      <FormMessage state={state} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <span className={fieldLabel}>Loại bài</span>
          <input type="hidden" name="kind" value={kind} />
          <div className="flex flex-wrap gap-2">
            {shownKinds.map((option) => {
              const Icon = option === "announcement" ? FiBell : FiMessageCircle;
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={kind === option}
                  disabled={editing}
                  onClick={() => setKind(option)}
                  className={kind === option ? chipPressed : chipButton}
                >
                  <Icon aria-hidden="true" />
                  {KIND_LABELS[option]}
                </button>
              );
            })}
          </div>
        </div>
        <SelectMenu
          label="Hiển thị"
          name="visibility"
          defaultValue={initial?.visibility ?? ""}
          options={[
            ...(editing
              ? []
              : [{ value: "", label: "Mặc định theo loại bài" }]),
            { value: "public", label: "Công khai" },
            { value: "members", label: "Chỉ thành viên" },
          ]}
        />
      </div>

      <TextField
        label="Tiêu đề"
        name="post_title"
        maxLength={160}
        defaultValue={initial?.title}
        hint="Cần có ít nhất một chữ cái."
        errors={errors}
        required
      />

      <BodyField error={errors?.post_body} defaultValue={initial?.body} />
      <MediaField
        key={editing ? "media" : (state.success ?? "media")}
        error={errors?.media_ids}
        initial={initial?.media}
      />

      <TextField
        label="Thẻ (tối đa 3)"
        name="post_tags"
        defaultValue={initial?.tags.join(", ")}
        hint="Cách nhau bằng dấu phẩy."
        errors={errors}
      />

      <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
        <span className={`${mutedText} flex flex-1 items-center gap-2`}>
          Bài nháp chỉ bạn nhìn thấy.
          <Link
            href={draftsHref}
            className="inline-flex items-center gap-1 font-semibold text-teal-700 hover:underline dark:text-teal-400"
          >
            <FiFileText aria-hidden="true" />
            Bản nháp
          </Link>
        </span>
        {showDraftButton ? (
          <button
            type="submit"
            name="intent"
            value="draft"
            disabled={pending}
            aria-label="Lưu nháp"
            title="Lưu nháp"
            className={neutralButton}
          >
            <FiSave aria-hidden="true" />
          </button>
        ) : null}
        <button
          type="submit"
          name="intent"
          value="publish"
          disabled={pending}
          className={`${primaryButton} disabled:opacity-50`}
        >
          {editing && !initial.isDraft ? (
            <FiSave aria-hidden="true" />
          ) : (
            <FiSend aria-hidden="true" />
          )}
          {pending
            ? "Đang lưu…"
            : editing && !initial.isDraft
              ? "Lưu thay đổi"
              : "Đăng bài"}
        </button>
      </div>
    </form>
  );
}
