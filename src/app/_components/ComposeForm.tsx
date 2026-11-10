"use client";

import Link from "next/link";
import { useId, useState } from "react";
import {
  FiBell,
  FiFileText,
  FiMessageCircle,
  FiSave,
  FiSend,
  FiX,
} from "react-icons/fi";
import { createPost } from "@/app/_actions/posts";
import type { MyOrganization } from "@/lib/organizations";
import { postableOrganizations, validatePost } from "@/lib/posts";
import { FieldNotes, FormMessage, TextField } from "./account/FormParts";
import { useAccountForm } from "./account/useAccountForm";
import BodyField from "./compose/BodyField";
import MediaField from "./compose/MediaField";
import SelectMenu from "./SelectMenu";
import {
  chipButton,
  chipPressed,
  fieldLabel,
  iconButton,
  mutedText,
  neutralButton,
  panel,
  primaryButton,
} from "./ui";

type Kind = "announcement" | "discussion";

function readValues(form: HTMLFormElement) {
  const data = new FormData(form);
  const text = (name: string) => String(data.get(name) ?? "");
  return {
    org: text("org_slug"),
    title: text("post_title"),
    body: text("post_body"),
    tags: text("post_tags"),
    kind: text("kind"),
    visibility: text("visibility"),
    mediaCount: data.getAll("media_id").length,
  };
}

export default function ComposeForm({
  organizations,
}: {
  organizations: MyOrganization[];
}) {
  const orgErrorId = useId();
  const [kind, setKind] = useState<Kind>("discussion");
  const { state, pending, formProps } = useAccountForm(createPost, {
    validate: (form) => validatePost(readValues(form)),
  });
  const errors = state.fieldErrors;
  const choices = postableOrganizations(organizations, kind);
  const orgOptions =
    choices.length > 0
      ? choices.map((org) => ({ value: org.slug, label: org.name }))
      : [{ value: "", label: "Chưa có tổ chức phù hợp", disabled: true }];
  const orgHint =
    choices.length > 0
      ? undefined
      : kind === "announcement"
        ? "Chỉ chủ sở hữu và quản trị viên được đăng thông báo."
        : "Hãy tham gia hoặc tạo một tổ chức trước.";

  return (
    <form
      {...formProps}
      className={`${panel} flex flex-col gap-5 p-4 sm:p-6`}
      aria-labelledby="compose-title"
    >
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
        <h1
          id="compose-title"
          className="flex-1 text-xl font-extrabold tracking-tight"
        >
          Tạo bài viết
        </h1>
        <Link href="/" aria-label="Đóng" className={iconButton}>
          <FiX aria-hidden="true" />
        </Link>
      </div>

      <FormMessage state={state} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          {/* The key resets the pick when the list changes with the post kind. */}
          <SelectMenu
            key={kind}
            label="Đăng dưới"
            name="org_slug"
            defaultValue={choices[0]?.slug ?? ""}
            options={orgOptions}
          />
          <FieldNotes id={orgErrorId} error={errors?.org_slug} hint={orgHint} />
        </div>
        <SelectMenu
          label="Hiển thị"
          name="visibility"
          defaultValue=""
          options={[
            { value: "", label: "Mặc định theo loại bài" },
            { value: "public", label: "Công khai" },
            { value: "members", label: "Chỉ thành viên" },
          ]}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className={fieldLabel}>Loại bài</span>
        <input type="hidden" name="kind" value={kind} />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={kind === "announcement"}
            onClick={() => setKind("announcement")}
            className={kind === "announcement" ? chipPressed : chipButton}
          >
            <FiBell aria-hidden="true" />
            Thông báo
          </button>
          <button
            type="button"
            aria-pressed={kind === "discussion"}
            onClick={() => setKind("discussion")}
            className={kind === "discussion" ? chipPressed : chipButton}
          >
            <FiMessageCircle aria-hidden="true" />
            Thảo luận
          </button>
        </div>
      </div>

      <TextField
        label="Tiêu đề"
        name="post_title"
        maxLength={160}
        errors={errors}
      />

      <BodyField error={errors?.post_body} />
      <MediaField key={state.success ?? "media"} error={errors?.media_ids} />

      <TextField
        label="Thẻ (tối đa 3)"
        name="post_tags"
        hint="Cách nhau bằng dấu phẩy."
        errors={errors}
      />

      <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
        <span className={`${mutedText} flex flex-1 items-center gap-2`}>
          Bài nháp chỉ bạn nhìn thấy.
          <Link
            href="/drafts"
            className="inline-flex items-center gap-1 font-semibold text-teal-700 hover:underline dark:text-teal-400"
          >
            <FiFileText aria-hidden="true" />
            Bản nháp
          </Link>
        </span>
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
        <button
          type="submit"
          name="intent"
          value="publish"
          disabled={pending}
          className={`${primaryButton} disabled:opacity-50`}
        >
          <FiSend aria-hidden="true" />
          {pending ? "Đang đăng…" : "Đăng bài"}
        </button>
      </div>
    </form>
  );
}
