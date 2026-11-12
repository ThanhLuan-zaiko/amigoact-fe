"use client";

import { useEffect, useState } from "react";
import { FiBookmark } from "react-icons/fi";
import { loadPins } from "@/app/_actions/chat";
import { attempt, type ChatMessage, messageDay, messageTime } from "@/lib/chat";
import { mutedText } from "../ui";

type PinsPanelProps = {
  roomId: string;
};

type PinsState =
  | { status: "loading" }
  | { status: "ready"; items: ChatMessage[] }
  | { status: "failed"; error: string };

export default function PinsPanel({ roomId }: PinsPanelProps) {
  const [state, setState] = useState<PinsState>({ status: "loading" });

  useEffect(() => {
    let active = true;
    attempt(() => loadPins(roomId)).then((result) => {
      if (!active) {
        return;
      }
      setState(
        result.ok
          ? { status: "ready", items: result.data }
          : { status: "failed", error: result.error },
      );
    });
    return () => {
      active = false;
    };
  }, [roomId]);

  return (
    <section
      aria-label="Tin đã ghim"
      className="flex max-h-60 flex-col gap-2 overflow-y-auto border-b border-slate-200 p-3 sm:px-4 dark:border-slate-800"
    >
      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
        <FiBookmark aria-hidden="true" />
        Tin đã ghim
      </h3>
      {state.status === "loading" ? (
        <p className={mutedText}>Đang tải…</p>
      ) : state.status === "failed" ? (
        <p className="text-sm text-red-700 dark:text-red-400">{state.error}</p>
      ) : state.items.length === 0 ? (
        <p className={mutedText}>Chưa có tin nào được ghim.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-slate-200 dark:divide-slate-800">
          {state.items.map((message) => (
            <li key={message.id} className="flex flex-col gap-0.5 py-2">
              <p className={`${mutedText} text-xs`}>
                <span className="font-semibold">{message.author_name}</span> ·{" "}
                {messageDay(message.created_at)}{" "}
                {messageTime(message.created_at)}
              </p>
              <p className="line-clamp-3 text-sm break-words whitespace-pre-wrap text-slate-800 dark:text-slate-200">
                {message.body || "Ảnh hoặc video"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
