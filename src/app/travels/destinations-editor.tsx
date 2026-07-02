"use client";

import { useId, useState } from "react";
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
  country: string;
  city: string;
  lat: number | null;
  lng: number | null;
  showMap: boolean;
  arrivedOn: string;
  leftOn: string;
};

const EMPTY_ROW: Row = {
  country: "",
  city: "",
  lat: null,
  lng: null,
  showMap: false,
  arrivedOn: "",
  leftOn: "",
};

function Badge({ isNew, filled }: { isNew: boolean; filled: boolean }) {
  if (!filled) return null;
  return isNew ? (
    <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">
      新規
    </span>
  ) : (
    <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">
      ✓
    </span>
  );
}

export function DestinationsEditor({
  masters,
  initial,
}: {
  masters: MasterCountry[];
  initial?: DestinationInitial[];
}) {
  const uid = useId();
  const [rows, setRows] = useState<Row[]>(() =>
    initial && initial.length > 0
      ? initial.map((d) => {
          const co = masters.find((m) => m.id === d.countryId);
          const ci = co?.cities.find((c) => c.id === d.cityId);
          return {
            ...EMPTY_ROW,
            country: co?.name ?? "",
            city: ci?.name ?? "",
            arrivedOn: d.arrivedOn ?? "",
            leftOn: d.leftOn ?? "",
          };
        })
      : [{ ...EMPTY_ROW }],
  );

  const update = (i: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  const matched = rows.map((r) => {
    const co = masters.find((m) => m.name === r.country.trim());
    const ci = co?.cities.find((c) => c.name === r.city.trim());
    return { co, ci };
  });

  const serialized = JSON.stringify(
    rows
      .map((r, i) => {
        const { co, ci } = matched[i];
        const isNewCity = !ci && r.city.trim() !== "";
        return {
          countryId: co?.id ?? null,
          countryName: co ? "" : r.country.trim(),
          cityId: ci?.id ?? null,
          cityName: isNewCity ? r.city.trim() : "",
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
          入力で候補を絞り込み。マスターにない名前はそのまま新規登録されます
        </span>
      </span>
      <datalist id={`${uid}-countries`}>
        {masters.map((m) => (
          <option key={m.id} value={m.name} />
        ))}
      </datalist>
      {rows.map((r, i) => {
        const { co, ci } = matched[i];
        const isNewCity = !ci && r.city.trim() !== "";
        const cityListId = `${uid}-cities-${i}`;
        const newCityQuery = [r.city.trim(), r.country.trim()]
          .filter(Boolean)
          .join(", ");
        return (
          <div
            key={i}
            className="space-y-2 rounded-xl border border-sky-100 bg-sky-50/50 p-3"
          >
            <datalist id={cityListId}>
              {co?.cities.map((c) => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500 text-xs font-bold text-white">
                {i + 1}
              </span>
              <div className="flex items-center gap-1">
                <input
                  value={r.country}
                  onChange={(e) =>
                    update(i, {
                      country: e.target.value,
                      // 国が変わったら都市の座標指定はリセット
                      lat: null,
                      lng: null,
                      showMap: false,
                    })
                  }
                  list={`${uid}-countries`}
                  required={i === 0}
                  placeholder="国(入力で検索)"
                  className={`w-40 ${inputCls}`}
                />
                <Badge isNew={!co} filled={r.country.trim() !== ""} />
              </div>
              <div className="flex items-center gap-1">
                <input
                  value={r.city}
                  onChange={(e) =>
                    update(i, {
                      city: e.target.value,
                      lat: null,
                      lng: null,
                    })
                  }
                  list={cityListId}
                  placeholder="都市(空欄なら国のみ)"
                  className={`w-44 ${inputCls}`}
                />
                <Badge isNew={!ci} filled={r.city.trim() !== ""} />
              </div>
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
              {isNewCity && (
                <button
                  type="button"
                  onClick={() => update(i, { showMap: !r.showMap })}
                  className="rounded-full border border-sky-300 px-2.5 py-1 text-xs font-bold text-sky-600 transition hover:bg-sky-50"
                >
                  {r.showMap ? "地図を閉じる" : "🗺 位置を確認・調整"}
                </button>
              )}
            </div>
            {r.showMap && isNewCity && (
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
