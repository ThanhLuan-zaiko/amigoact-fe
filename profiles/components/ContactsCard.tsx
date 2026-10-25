import type { ReactElement } from "react";
import { FiPlus, FiTrash2, FiUserCheck } from "react-icons/fi";
import { Section } from "../../core/components/Section.tsx";
import { Button } from "../../core/components/Button.tsx";
import { EmptyState } from "../../core/components/Feedback.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { fieldText } from "../messages.tsx";
import { MAX_CONTACTS, type ContactInput } from "../draft.ts";
import type { ContactDraft } from "../api.ts";

// Emergency contacts of the volunteer form. Rows are drafts until the single
// save; the first row is the primary contact. Adding only stacks a row here.
export function ContactsCard({
  contacts,
  input,
  errors,
  onInputChange,
  onAdd,
  onRemove,
}: {
  contacts: ContactDraft[];
  input: ContactInput;
  errors: Record<string, string>;
  onInputChange: (patch: Partial<ContactInput>) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}): ReactElement {
  const full = contacts.length >= MAX_CONTACTS;

  return (
    <Section>
      <div className="flex items-center gap-2">
        <FiUserCheck className="h-5 w-5 text-zinc-900 dark:text-zinc-100" aria-hidden="true" />
        <h2 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
          Liên hệ khẩn cấp
        </h2>
      </div>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Tối đa {MAX_CONTACTS} người; nhà tổ chức dùng khi có sự cố.
      </p>
      {contacts.length === 0 ? (
        <div className="mt-3">
          <EmptyState
            title="Chưa có liên hệ"
            message="Thêm người thân để ban tổ chức liên hệ khi cần."
          />
        </div>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {contacts.map((contact, index) => (
            <li
              key={contact.contact_id ?? `new-${index}`}
              className="flex items-center gap-3 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {contact.name}
                  {index === 0 && (
                    <span className="ml-2 rounded-full border border-zinc-300 bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
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
                onClick={() => onRemove(index)}
              >
                <FiTrash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}
      {!full && (
        <div className="mt-4 grid grid-cols-1 gap-3 @md:grid-cols-2">
          <TextField
            label="Họ tên"
            name="contact_name"
            maxLength={120}
            value={input.name}
            onChange={(e) => onInputChange({ name: e.target.value })}
            error={fieldText(errors, "contact_name")}
            placeholder="VD: Nguyễn Văn A"
            className="@md:col-span-2"
          />
          <TextField
            label="Mối quan hệ"
            name="contact_relation"
            maxLength={60}
            value={input.relation}
            onChange={(e) => onInputChange({ relation: e.target.value })}
            placeholder="VD: Mẹ, Anh trai…"
          />
          <TextField
            label="Số điện thoại"
            name="contact_phone"
            inputMode="tel"
            maxLength={20}
            value={input.phone}
            onChange={(e) => onInputChange({ phone: e.target.value })}
            error={fieldText(errors, "contact_phone")}
            hint="Từ 8 đến 20 ký tự."
            placeholder="VD: 0901234567"
          />
          <div className="@md:col-span-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onAdd}
              icon={<FiPlus className="h-4 w-4" aria-hidden="true" />}
            >
              Thêm vào danh sách
            </Button>
          </div>
        </div>
      )}
    </Section>
  );
}
