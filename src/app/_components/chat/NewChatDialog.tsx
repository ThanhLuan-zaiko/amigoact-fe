"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { loadContacts } from "@/app/_actions/chat";
import { attempt, type ChatContact, type ChatResult } from "@/lib/chat";
import { foldText } from "@/lib/messenger";
import { iconButton, inputField, mutedText, sectionTitle } from "../ui";
import ChatAvatar from "./ChatAvatar";

type NewChatDialogProps = {
  onClose: () => void;
  onPick: (slug: string, userId: string) => Promise<ChatResult>;
};

type Contacts =
  | { status: "loading" }
  | { status: "ready"; items: ChatContact[] }
  | { status: "failed"; error: string };

// Picks a person to message. A direct message belongs to one organization the two share,
// so someone met in two organizations appears once for each.
export default function NewChatDialog({ onClose, onPick }: NewChatDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [contacts, setContacts] = useState<Contacts>({ status: "loading" });
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    dialogRef.current?.showModal();
    let active = true;
    attempt(() => loadContacts()).then((result) => {
      if (active) {
        setContacts(
          result.ok
            ? { status: "ready", items: result.data }
            : { status: "failed", error: result.error },
        );
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const needle = foldText(query.trim());
  const shown =
    contacts.status === "ready"
      ? contacts.items.filter(
          (item) =>
            !needle ||
            foldText(item.full_name).includes(needle) ||
            foldText(item.org.name).includes(needle),
        )
      : [];

  function pick(contact: ChatContact) {
    startTransition(async () => {
      const result = await onPick(contact.org.slug, contact.user_id);
      setError(result.ok ? null : result.error);
    });
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label="Tin nhắn mới"
      onClose={onClose}
      className="m-auto max-h-[80dvh] w-[calc(100%-2rem)] max-w-md flex-col rounded-xl border border-slate-200 bg-white p-0 text-slate-900 shadow-sm backdrop:bg-slate-900/50 open:flex dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
    >
      <div className="flex items-center gap-2 border-b border-slate-200 p-4 dark:border-slate-800">
        <h2 className={`${sectionTitle} flex-1`}>Tin nhắn mới</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          title="Đóng"
          className={iconButton}
        >
          <FiX aria-hidden="true" />
        </button>
      </div>
      <div className="relative p-4 pb-2">
        <FiSearch
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-7 -translate-y-1/4 text-slate-400"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Tìm người"
          placeholder="Tìm theo tên hoặc tổ chức"
          className={`${inputField} pl-9`}
        />
      </div>
      {error ? (
        <p role="alert" className="px-4 text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      ) : null}
      <div className="min-h-40 overflow-y-auto p-2">
        {contacts.status === "loading" ? (
          <p className={`${mutedText} p-4`}>Đang tải…</p>
        ) : contacts.status === "failed" ? (
          <p className="p-4 text-sm text-red-700 dark:text-red-400">
            {contacts.error}
          </p>
        ) : shown.length === 0 ? (
          <p className={`${mutedText} p-4`}>
            {contacts.items.length === 0
              ? "Chưa có ai để nhắn. Hãy tham gia một tổ chức."
              : "Không tìm thấy ai."}
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {shown.map((contact) => (
              <li key={`${contact.org.id}:${contact.user_id}`}>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => pick(contact)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-teal-700 disabled:opacity-50 dark:hover:bg-slate-900/60 dark:focus-visible:outline-teal-400"
                >
                  <ChatAvatar
                    name={contact.full_name}
                    url={contact.avatar_url}
                    size="sm"
                  />
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-semibold">
                      {contact.full_name}
                    </span>
                    <span className={`${mutedText} truncate text-xs`}>
                      {contact.org.name}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </dialog>
  );
}
