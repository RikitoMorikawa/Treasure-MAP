"use client";

import { useState } from "react";

type Row = {
  country: string;
  citiesText: string;
  arrivedOn: string;
  leftOn: string;
};

export type DestinationInput = {
  country: string;
  cities: string[];
  arrivedOn: string | null;
  leftOn: string | null;
};

export function DestinationsEditor({
  initial,
}: {
  initial?: DestinationInput[];
}) {
  const [rows, setRows] = useState<Row[]>(() =>
    initial && initial.length > 0
      ? initial.map((d) => ({
          country: d.country,
          citiesText: d.cities.join("、"),
          arrivedOn: d.arrivedOn ?? "",
          leftOn: d.leftOn ?? "",
        }))
      : [{ country: "", citiesText: "", arrivedOn: "", leftOn: "" }],
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
        arrivedOn: r.arrivedOn || null,
        leftOn: r.leftOn || null,
      }))
      .filter((d) => d.country),
  );

  const inputCls =
    "rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-sm transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 focus:outline-none";

  return (
    <div className="space-y-2">
      <span className="block text-sm font-semibold text-slate-600">
        行き先 <span className="text-rose-400">*</span>
        <span className="ml-2 text-xs font-normal text-slate-400">
          国ごとに都市(「、」区切り)と到着日・出発日を入力。順番に地図で経路表示されます
        </span>
      </span>
      {rows.map((r, i) => (
        <div
          key={i}
          className="space-y-2 rounded-xl border border-sky-100 bg-sky-50/50 p-3"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-xs font-bold text-white">
              {i + 1}
            </span>
            <input
              value={r.country}
              onChange={(e) => update(i, { country: e.target.value })}
              required={i === 0}
              placeholder="国(例: フランス)"
              className={`w-40 ${inputCls}`}
            />
            <input
              value={r.citiesText}
              onChange={(e) => update(i, { citiesText: e.target.value })}
              placeholder="都市(例: パリ、ニース)"
              className={`min-w-40 flex-1 ${inputCls}`}
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
          <div className="flex flex-wrap items-center gap-2 pl-8 text-xs">
            <label className="flex items-center gap-1 text-slate-500">
              🛬 到着日
              <input
                type="date"
                value={r.arrivedOn}
                onChange={(e) => update(i, { arrivedOn: e.target.value })}
                className={inputCls}
              />
            </label>
            <label className="flex items-center gap-1 text-slate-500">
              🛫 出発日
              <input
                type="date"
                value={r.leftOn}
                onChange={(e) => update(i, { leftOn: e.target.value })}
                className={inputCls}
              />
            </label>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          setRows((rs) => [
            ...rs,
            { country: "", citiesText: "", arrivedOn: "", leftOn: "" },
          ])
        }
        className="rounded-full border border-sky-300 px-3 py-1 text-xs font-bold text-sky-600 transition hover:bg-sky-50"
      >
        ＋ 国を追加
      </button>
      <input type="hidden" name="destinations" value={serialized} />
    </div>
  );
}
