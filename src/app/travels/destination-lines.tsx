"use client";

import { useState } from "react";

type DestLine = {
  id: number;
  country: string;
  city: string | null;
  arrivedOn: string | null;
  leftOn: string | null;
};

const INITIAL_LINES = 3;

function fmtShort(d: string) {
  const [, m, day] = d.split("-");
  return `${Number(m)}/${Number(day)}`;
}

// 記録一覧の行き先を1行ずつ表示。多い場合は3行で折りたたむ
export function DestinationLines({ dests }: { dests: DestLine[] }) {
  const [open, setOpen] = useState(false);
  const visible = open ? dests : dests.slice(0, INITIAL_LINES);
  const hidden = dests.length - INITIAL_LINES;

  return (
    <div className="mt-1.5">
      <ul className="space-y-0.5">
        {visible.map((d, i) => (
          <li
            key={d.id}
            className="flex items-center gap-1.5 text-xs text-slate-600"
          >
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sky-100 text-[9px] font-bold text-sky-600">
              {i + 1}
            </span>
            <span className="font-semibold">
              {d.country}
              {d.city && <span className="text-sky-600">・{d.city}</span>}
            </span>
            {(d.arrivedOn || d.leftOn) && (
              <span className="text-slate-400">
                {d.arrivedOn ? fmtShort(d.arrivedOn) : "?"}→
                {d.leftOn ? fmtShort(d.leftOn) : "?"}
              </span>
            )}
          </li>
        ))}
      </ul>
      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="mt-1 flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold text-sky-500 transition hover:bg-sky-50"
        >
          {open ? "▲ 閉じる" : `▼ ほか ${hidden} 件を表示`}
        </button>
      )}
    </div>
  );
}
