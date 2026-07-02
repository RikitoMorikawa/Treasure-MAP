"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const PinConfirm = dynamic(() => import("./pin-confirm"), { ssr: false });

export type MasterCountry = {
  id: number;
  name: string;
  cities: { id: number; name: string }[];
};

export type DestinationInitial = {
  countryId: number;
  cityId: number | null;
  arrivedOn: string | null;
  leftOn: string | null;
};

type Row = {
  countrySel: string; // "" | "new" | "<countryId>"
  countryName: string;
  citySel: string; // "" (国のみ) | "new" | "<cityId>"
  cityName: string;
  lat: number | null;
  lng: number | null;
  showMap: boolean;
  arrivedOn: string;
  leftOn: string;
};

const EMPTY_ROW: Row = {
  countrySel: "",
  countryName: "",
  citySel: "",
  cityName: "",
  lat: null,
  lng: null,
  showMap: false,
  arrivedOn: "",
  leftOn: "",
};

export function DestinationsEditor({
  masters,
  initial,
}: {
  masters: MasterCountry[];
  initial?: DestinationInitial[];
}) {
  const [rows, setRows] = useState<Row[]>(() =>
    initial && initial.length > 0
      ? initial.map((d) => ({
          ...EMPTY_ROW,
          countrySel: String(d.countryId),
          citySel: d.cityId != null ? String(d.cityId) : "",
          arrivedOn: d.arrivedOn ?? "",
          leftOn: d.leftOn ?? "",
        }))
      : [{ ...EMPTY_ROW }],
  );

  const update = (i: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  const serialized = JSON.stringify(
    rows
      .map((r) => {
        const isNewCountry = r.countrySel === "new";
        const isNewCity = r.citySel === "new";
        return {
          countryId: !isNewCountry && r.countrySel ? Number(r.countrySel) : null,
          countryName: isNewCountry ? r.countryName.trim() : "",
          cityId: !isNewCity && r.citySel ? Number(r.citySel) : null,
          cityName: isNewCity ? r.cityName.trim() : "",
          lat: isNewCity ? r.lat : null,
          lng: isNewCity ? r.lng : null,
          arrivedOn: r.arrivedOn || null,
          leftOn: r.leftOn || null,
        };
      })
      .filter((d) => d.countryId != null || d.countryName),
  );

  const inputCls =
    "rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-sm transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 focus:outline-none";

  return (
    <div className="space-y-2">
      <span className="block text-sm font-semibold text-slate-600">
        行き先 <span className="text-rose-400">*</span>
        <span className="ml-2 text-xs font-normal text-slate-400">
          1行 = 1都市。訪れた順に並べて到着日・出発日を入れると経路になります
        </span>
      </span>
      {rows.map((r, i) => {
        const selectedCountry =
          r.countrySel && r.countrySel !== "new"
            ? masters.find((m) => m.id === Number(r.countrySel))
            : undefined;
        const newCityQuery = [
          r.cityName,
          r.countrySel === "new" ? r.countryName : (selectedCountry?.name ?? ""),
        ]
          .filter(Boolean)
          .join(", ");
        return (
          <div
            key={i}
            className="space-y-2 rounded-xl border border-sky-100 bg-sky-50/50 p-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500 text-xs font-bold text-white">
                {i + 1}
              </span>
              <select
                value={r.countrySel}
                onChange={(e) =>
                  update(i, {
                    countrySel: e.target.value,
                    citySel: "",
                    cityName: "",
                    lat: null,
                    lng: null,
                    showMap: false,
                  })
                }
                required={i === 0}
                className={`w-44 ${inputCls}`}
              >
                <option value="">国を選択…</option>
                {masters.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
                <option value="new">＋ 新しい国…</option>
              </select>
              {r.countrySel === "new" && (
                <input
                  value={r.countryName}
                  onChange={(e) => update(i, { countryName: e.target.value })}
                  placeholder="国名(例: フランス)"
                  className={`w-40 ${inputCls}`}
                />
              )}
              {r.countrySel === "new" ? (
                <input
                  value={r.cityName}
                  onChange={(e) =>
                    update(i, { citySel: "new", cityName: e.target.value })
                  }
                  placeholder="都市名(空欄なら国のみ)"
                  className={`w-44 ${inputCls}`}
                />
              ) : (
                r.countrySel && (
                  <select
                    value={r.citySel}
                    onChange={(e) =>
                      update(i, {
                        citySel: e.target.value,
                        cityName: "",
                        lat: null,
                        lng: null,
                        showMap: false,
                      })
                    }
                    className={`w-44 ${inputCls}`}
                  >
                    <option value="">(国のみ)</option>
                    {selectedCountry?.cities.map((ct) => (
                      <option key={ct.id} value={ct.id}>
                        {ct.name}
                      </option>
                    ))}
                    <option value="new">＋ 新しい都市…</option>
                  </select>
                )
              )}
              {r.countrySel !== "new" && r.citySel === "new" && (
                <input
                  value={r.cityName}
                  onChange={(e) => update(i, { cityName: e.target.value })}
                  placeholder="都市名(例: パリ)"
                  className={`w-40 ${inputCls}`}
                />
              )}
              {rows.length > 1 && (
                <button
                  type="button"
                  onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}
                  className="rounded-full px-2 py-1 text-xs font-bold text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                  title="この行き先を削除"
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
              {r.citySel === "new" && r.cityName.trim() && (
                <button
                  type="button"
                  onClick={() => update(i, { showMap: !r.showMap })}
                  className="rounded-full border border-sky-300 px-2.5 py-1 text-xs font-bold text-sky-600 transition hover:bg-sky-50"
                >
                  {r.showMap ? "地図を閉じる" : "🗺 位置を確認・調整"}
                </button>
              )}
            </div>
            {r.showMap && r.citySel === "new" && (
              <div className="pl-8">
                <PinConfirm
                  query={newCityQuery}
                  lat={r.lat}
                  lng={r.lng}
                  onPick={(lat, lng) => update(i, { lat, lng })}
                />
              </div>
            )}
          </div>
        );
      })}
      <button
        type="button"
        onClick={() => setRows((rs) => [...rs, { ...EMPTY_ROW }])}
        className="rounded-full border border-sky-300 px-3 py-1 text-xs font-bold text-sky-600 transition hover:bg-sky-50"
      >
        ＋ 行き先を追加
      </button>
      <input type="hidden" name="destinations" value={serialized} />
    </div>
  );
}
