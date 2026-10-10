import type { FormEvent, ReactElement } from "react";
import { useState } from "react";
import { FiPlus, FiTrash2, FiUserCheck } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { BentoCard } from "../../core/components/BentoCard.tsx";
import { Button } from "../../core/components/Button.tsx";
import { EmptyState } from "../../core/components/Feedback.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { useAddContact, useRemoveContact } from "../hooks.ts";
import { profileMessage } from "../messages.tsx";
import type { VolunteerProfile } from "../api.ts";

const MAX_CONTACTS = 3;

export function ContactsCard({
  profile,
}: {
  profile: VolunteerProfile;
}): ReactElement {
  const add = useAddContact();
  const remove = useRemoveContact();
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const full = profile.contacts.length >= MAX_CONTACTS;

  const report = (err: unknown): void =>
    setError(
      profileMessage(err instanceof ApiError ? err.code : "REQUEST_FAILED"),
    );

  const onSubmit = (event: FormEvent): void => {
    event.preventDefault();
    setError(null);
    if (name.trim() === "" || phone.trim() === "") {
      setError("Vui lòng nhập tên và số điện thoại liên hệ.");
      return;
    }
    add.mutate(
      {
        name: name.trim(),
        relation: relation.trim() || null,
        phone: phone.trim(),
        is_primary: false,
      },
      {
        onSuccess: () => {
          setName("");
          setRelation("");
          setPhone("");
        },
        onError: report,
      },
    );
  };

  return (
    <BentoCard className="md:col-span-6 lg:col-span-5">
      <div className="flex items-center gap-2">
        <FiUserCheck className="h-5 w-5 text-zinc-900 dark:text-brand" aria-hidden="true" />
        <h2 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
          Liên hệ khẩn cấp
        </h2>
      </div>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Tối đa {MAX_CONTACTS} người; nhà tổ chức dùng khi có sự cố.
      </p>
      {profile.contacts.length === 0 ? (
        <div className="mt-3">
          <EmptyState
            title="Chưa có liên hệ"
            message="Thêm người thân để ban tổ chức liên hệ khi cần."
          />
        </div>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {profile.contacts.map((contact) => (
            <li
              key={contact.contact_id}
              className="flex items-center gap-3 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {contact.name}
                  {contact.is_primary && (
                    <span className="ml-2 rounded-full border border-brand/40 bg-brand/10 px-2 py-0.5 text-xs text-zinc-700 dark:border-brand/30 dark:text-zinc-300">
                      Ưu tiên
                    </span>
                  )}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {contact.relation ? `${contact.relation} · ` : ""}
                  {contact.phone}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Xoá liên hệ ${contact.name}`}
                disabled={remove.isPending}
                onClick={() =>
                  remove.mutate(contact.contact_id, { onError: report })
                }
              >
                <FiTrash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}
      {!full && (
        <form className="mt-4 flex flex-col gap-3" onSubmit={onSubmit}>
          <TextField
            label="Họ tên"
            name="contact_name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: Nguyễn Văn A"
          />
          <TextField
            label="Mối quan hệ"
            name="contact_relation"
            value={relation}
            onChange={(e) => setRelation(e.target.value)}
            placeholder="VD: Mẹ, Anh trai…"
          />
          <TextField
            label="Số điện thoại"
            name="contact_phone"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="VD: 0901234567"
          />
          <div>
            <Button
              type="submit"
              variant="secondary"
              disabled={add.isPending}
              icon={<FiPlus className="h-4 w-4" aria-hidden="true" />}
            >
              {add.isPending ? "Đang thêm…" : "Thêm liên hệ"}
            </Button>
          </div>
        </form>
      )}
      {error && (
        <p role="alert" className="mt-3 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </BentoCard>
  );
}
