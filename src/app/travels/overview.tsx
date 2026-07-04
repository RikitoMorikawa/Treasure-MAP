"use client";

import { useState } from "react";
import { TravelRouteMap } from "./client-widgets";
import type { MapFocus, TravelRoute } from "./travel-route-map";

export function TravelsOverview({
  travelCount,
  cityCount,
  countryStats,
  routes,
}: {
  travelCount: number;
  cityCount: number;
  countryStats: { name: string; count: number }[];
  routes: TravelRoute[];
}) {
  const [focus, setFocus] = useState<MapFocus | null>(null);
  const [focusCountry, setFocusCountry] = useState<string | null>(null);

  const zoomToCountry = (name: string) => {
    const positions = routes.flatMap((r) =>
      r.stops
        .filter((s) => s.country === name)
        .map((s) => [s.lat, s.lng] as [number, number]),
    );
    if (positions.length === 0) return;
    setFocusCountry(name);
    setFocus((f) => ({ seq: (f?.seq ?? 0) + 1, positions }));
  };

  return (
    <>
      <section className="space-y-3">
        <h2 className="border-l-4 border-sky-500 pl-3 font-bold text-slate-800">
          📊 旅の記録
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border-2 border-sky-200 bg-white p-4 text-center shadow-md">
            <p className="text-xs font-semibold text-slate-500">✈️ 旅行回数</p>
            <p className="mt-1 text-3xl font-extrabold text-sky-600">
              {travelCount}
              <span className="ml-1 text-sm font-semibold text-slate-400">
                回
              </span>
            </p>
          </div>
          <div className="rounded-2xl border-2 border-sky-200 bg-white p-4 text-center shadow-md">
            <p className="text-xs font-semibold text-slate-500">🌍 訪問国数</p>
            <p className="mt-1 text-3xl font-extrabold text-sky-600">
              {countryStats.length}
              <span className="ml-1 text-sm font-semibold text-slate-400">
                ヶ国
              </span>
            </p>
          </div>
          <div className="rounded-2xl border-2 border-sky-200 bg-white p-4 text-center shadow-md">
            <p className="text-xs font-semibold text-slate-500">
              🏙 訪問都市数
            </p>
            <p className="mt-1 text-3xl font-extrabold text-sky-600">
              {cityCount}
              <span className="ml-1 text-sm font-semibold text-slate-400">
                都市
              </span>
            </p>
          </div>
        </div>
        {countryStats.length > 0 && (
          <div className="rounded-2xl border-2 border-sky-200 bg-white p-4 shadow-md">
            <p className="mb-2 text-xs font-semibold text-slate-500">
              国ごとの訪問回数
              <span className="ml-2 font-normal text-slate-400">
                クリックすると下のマップでその国にズームします
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              {countryStats.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => zoomToCountry(c.name)}
                  className={`rounded-full px-3 py-1 text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow ${
                    focusCountry === c.name
                      ? "bg-gradient-to-r from-sky-500 to-blue-500 text-white"
                      : "bg-gradient-to-r from-sky-100 to-blue-100 text-sky-700"
                  }`}
                >
                  {c.name}
                  <span
                    className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs font-bold ${
                      focusCountry === c.name
                        ? "bg-white text-sky-600"
                        : "bg-sky-500 text-white"
                    }`}
                  >
                    ×{c.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="border-l-4 border-sky-500 pl-3 font-bold text-slate-800">
          🗺 旅の経路マップ
          <span className="ml-2 rounded-full bg-sky-500 px-2.5 py-0.5 text-xs font-bold text-white">
            {routes.length}旅
          </span>
        </h2>
        <div className="overflow-hidden rounded-2xl border-2 border-sky-200 shadow-md">
          <TravelRouteMap routes={routes} focus={focus} />
        </div>
      </section>
    </>
  );
}
