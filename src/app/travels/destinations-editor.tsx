"use client";

import { useState } from "react";

type Row = { country: string; citiesText: string };

export function DestinationsEditor({
  initial,
}: {
  initial?: { country: string; cities: string[] }[];
}) {
  const [rows, setRows] = useState<Row[]>(() =>
    initial && initial.length > 0
      ? initial.map((d) => ({
          country: d.country,
          citiesText: d.cities.join("、"),
        }))
      : [{ country: "", citiesText: "" }],
  );

  const update = (i: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  const serialized = JSON.stringify(
    rows
      .map((r) => ({
        country: r.country.trim(),
        cities: r.citiesText
          .split(/[、,\/]/)
          .map((s) => s.trim())
          .filter(Boolean),
      }))
      .filter((d) => d.country),
  );

  return (
    <div className="space-y-2">
      <span className="block text-sm font-semibold text-slate-600">
        行き先 <span className="text-rose-400">*</span>
        <span className="ml-2 text-xs font-normal text-slate-400">
          国ごとに都市を「、」区切りで入力
        </span>
      </span>
      {rows.map((r, i) => (
        <div
          key={i}
          className="flex flex-wrap items-center gap-2 rounded-xl border border-sky-100 bg-sky-50/50 p-2"
        >
          <input
            value={r.country}
            onChange={(e) => update(i, { country: e.target.value })}
            required={i === 0}
            placeholder="国(例: フランス)"
            className="w-40 rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-sm transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 focus:outline-none"
          />
          <input
            value={r.citiesText}
            onChange={(e) => update(i, { citiesText: e.target.value })}
            placeholder="都市(例: パリ、ニース)"
            className="min-w-40 flex-1 rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-sm transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 focus:outline-none"
          />
          {rows.length > 1 && (
            <button
              type="button"
              onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}
              className="rounded-full px-2 py-1 text-xs font-bold text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
              title="この国を削除"
            >
              ✕
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => setRows((rs) => [...rs, { country: "", citiesText: "" }])}
        className="rounded-full border border-sky-300 px-3 py-1 text-xs font-bold text-sky-600 transition hover:bg-sky-50"
      >
        ＋ 国を追加
      </button>
      <input type="hidden" name="destinations" value={serialized} />
    </div>
  );
}
