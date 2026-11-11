"use client";

import { type FormEvent, type ReactNode, useState, useTransition } from "react";
import type { IconType } from "react-icons";
import {
  FiArchive,
  FiHash,
  FiLock,
  FiMessageCircle,
  FiSend,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { badgeText, type ChatResult, type ChatRoom } from "@/lib/chat";
import SelectMenu from "../SelectMenu";
import { iconButton, mutedText, panel } from "../ui";

export type Person = { user_id: string; full_name: string };

type RoomListProps = {
  rooms: ChatRoom[];
  activeId: string | null;
  unread: Record<string, number>;
  people: Person[];
  onSelect: (roomId: string) => void;
  onOpenDm: (userId: string) => Promise<ChatResult>;
};

function roomIcon(room: ChatRoom): IconType {
  if (room.kind === "org") {
    return FiUsers;
  }
  if (room.kind === "dm") {
    return FiUser;
  }
  return room.archived ? FiArchive : room.restricted ? FiLock : FiHash;
}

function roomLabel(room: ChatRoom): string {
  if (room.archived) {
    return `${room.name} (đã lưu trữ)`;
  }
  return room.restricted ? `${room.name} (kênh giới hạn)` : room.name;
}

function RoomButton({
  room,
  active,
  count,
  onSelect,
}: {
  room: ChatRoom;
  active: boolean;
  count: number;
  onSelect: (roomId: string) => void;
}) {
  const Icon = roomIcon(room);
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(room.id)}
        aria-current={active ? "true" : undefined}
        title={roomLabel(room)}
        className={`flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 dark:focus-visible:outline-teal-400 ${
          active
            ? "border-teal-700 bg-teal-50 text-teal-700 dark:border-teal-400 dark:bg-teal-950/40 dark:text-teal-400"
            : "border-transparent text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
        }`}
      >
        <Icon aria-hidden="true" className="shrink-0" />
        <span
          className={`min-w-0 flex-1 truncate ${count > 0 ? "font-bold" : "font-medium"} ${room.archived ? "text-slate-500 dark:text-slate-400" : ""}`}
        >
          {room.name}
        </span>
        {count > 0 ? (
          <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-teal-700 px-1.5 py-0.5 text-xs font-bold text-white dark:bg-teal-400 dark:text-teal-950">
            <span className="sr-only">Chưa đọc: </span>
            {badgeText(count)}
          </span>
        ) : null}
      </button>
    </li>
  );
}

function NewDirectMessage({
  people,
  onOpenDm,
}: {
  people: Person[];
  onOpenDm: (userId: string) => Promise<ChatResult>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const userId = new FormData(event.currentTarget).get("peer");
    if (typeof userId !== "string" || !userId) {
      setError("Hãy chọn một thành viên.");
      return;
    }
    startTransition(async () => {
      const result = await onOpenDm(userId);
      setError(result.ok ? null : result.error);
    });
  }

  if (people.length === 0) {
    return null;
  }
  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <div className="flex items-end gap-2">
        <SelectMenu
          label="Nhắn riêng cho"
          name="peer"
          defaultValue=""
          className="min-w-0 flex-1"
          options={[
            { value: "", label: "Chọn thành viên", disabled: true },
            ...people.map((person) => ({
              value: person.user_id,
              label: person.full_name,
            })),
          ]}
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="Mở tin nhắn riêng"
          title="Mở tin nhắn riêng"
          className={`${iconButton} disabled:opacity-50`}
        >
          <FiSend aria-hidden="true" />
        </button>
      </div>
      {error ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </form>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: IconType;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-1">
      <h3
        className={`${mutedText} flex items-center gap-2 px-1 text-xs font-semibold uppercase`}
      >
        <Icon aria-hidden="true" />
        {title}
      </h3>
      {children}
    </section>
  );
}

export default function RoomList({
  rooms,
  activeId,
  unread,
  people,
  onSelect,
  onOpenDm,
}: RoomListProps) {
  const general = rooms.filter((room) => room.kind === "org");
  const channels = rooms.filter((room) => room.kind === "channel");
  const dms = rooms.filter((room) => room.kind === "dm");
  const renderRoom = (room: ChatRoom) => (
    <RoomButton
      key={room.id}
      room={room}
      active={room.id === activeId}
      count={unread[room.id] ?? 0}
      onSelect={onSelect}
    />
  );

  return (
    <nav
      aria-label="Phòng chat"
      className={`${panel} flex flex-col gap-4 p-3 sm:p-4`}
    >
      <ul className="flex flex-col gap-1">{general.map(renderRoom)}</ul>
      {channels.length > 0 ? (
        <Section title="Kênh" icon={FiHash}>
          <ul className="flex flex-col gap-1">{channels.map(renderRoom)}</ul>
        </Section>
      ) : null}
      <Section title="Tin nhắn riêng" icon={FiMessageCircle}>
        {dms.length > 0 ? (
          <ul className="flex flex-col gap-1">{dms.map(renderRoom)}</ul>
        ) : (
          <p className={`${mutedText} px-1`}>Chưa có cuộc trò chuyện riêng.</p>
        )}
        <div className="mt-2 border-t border-slate-200 pt-3 dark:border-slate-800">
          <NewDirectMessage people={people} onOpenDm={onOpenDm} />
        </div>
      </Section>
    </nav>
  );
}
