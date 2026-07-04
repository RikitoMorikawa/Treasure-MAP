"use client";

import { useState } from "react";

export type FlightInput = { url: string; flownOn: string | null };

type Row = { url: string; flownOn: string };

// 航空券リンクの入力(旅行に紐づく。複数可、搭乗日付き)
export function FlightUrlsEditor({ initial }: { initial?: FlightInput[] }) {
  const [rows, setRows] = useState<Row[]>(
    () =>
      initial?.map((f) => ({ url: f.url, flownOn: f.flownOn ?? "" })) ?? [],
  );

  const update = (i: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  const inputCls =
    "rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-sm transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 focus:outline-none";

  return (
    <div className="space-y-2">
      <span className="block text-sm font-semibold text-slate-600">
        ✈️ 航空券リンク
        <span className="ml-2 text-xs font-normal text-slate-400">
          予約確認ページなどの URL(複数可)。搭乗日を入れるとカレンダーに移動日として表示されます
        </span>
      </span>
      {rows.map((r, i) => (
        <div
          key={i}
          className="flex flex-wrap items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50/50 p-2"
        >
          <span className="text-xs">✈️</span>
          <input
            type="url"
            value={r.url}
            onChange={(e) => update(i, { url: e.target.value })}
            placeholder="https://(航空券の予約確認 URL など)"
            className={`min-w-52 flex-1 ${inputCls}`}
          />
          <label className="flex items-center gap-1 text-xs text-slate-500">
            🗓 搭乗日
            <input
              type="date"
              value={r.flownOn}
              onChange={(e) => update(i, { flownOn: e.target.value })}
              className={inputCls}
            />
          </label>
          <button
            type="button"
            onClick={() => setRows((rs) => rs.filter((_, xi) => xi !== i))}
            className="rounded-full px-2 py-1 text-xs font-bold text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
            title="この航空券を削除"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setRows((rs) => [...rs, { url: "", flownOn: "" }])}
        className="rounded-full border border-indigo-300 px-3 py-1 text-xs font-bold text-indigo-600 transition hover:bg-indigo-50"
      >
        ✈️ 航空券を追加
      </button>
      <input
        type="hidden"
        name="flights"
        value={JSON.stringify(
          rows
            .map((r) => ({
              url: r.url.trim(),
              flownOn: r.flownOn || null,
            }))
            .filter((r) => r.url),
        )}
      />
    </div>
  );
}
