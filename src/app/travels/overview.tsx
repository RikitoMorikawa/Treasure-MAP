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
          <div className="rounded-2xl border-2 border-sky-200 bg-white p-2.5 text-center shadow-md sm:p-4">
            <p className="text-[10px] font-semibold text-slate-500 sm:text-xs">✈️ 旅行回数</p>
            <p className="mt-1 text-2xl font-extrabold text-sky-600 sm:text-3xl">
              {travelCount}
              <span className="ml-1 text-sm font-semibold text-slate-400">
                回
              </span>
            </p>
          </div>
          <div className="rounded-2xl border-2 border-sky-200 bg-white p-2.5 text-center shadow-md sm:p-4">
            <p className="text-[10px] font-semibold text-slate-500 sm:text-xs">🌍 訪問国数</p>
            <p className="mt-1 text-2xl font-extrabold text-sky-600 sm:text-3xl">
              {countryStats.length}
              <span className="ml-1 text-sm font-semibold text-slate-400">
                ヶ国
              </span>
            </p>
          </div>
          <div className="rounded-2xl border-2 border-sky-200 bg-white p-2.5 text-center shadow-md sm:p-4">
            <p className="text-[10px] font-semibold text-slate-500 sm:text-xs">
              🏙 訪問都市数
            </p>
            <p className="mt-1 text-2xl font-extrabold text-sky-600 sm:text-3xl">
              {cityCount}
              <span className="ml-1 text-sm font-semibold text-slate-400">
                都市
              </span>
            </p>
          </div>
        </div>
        {countryStats.length > 0 && (
          <div className="rounded-2xl border-2 border-sky-200 bg-white p-3 shadow-md sm:p-4">
            <p className="mb-1.5 text-xs font-semibold text-slate-500 sm:mb-2">
              国ごとの訪問回数
              <span className="ml-2 hidden font-normal text-slate-400 sm:inline">
                クリックすると下のマップでその国にズームします
              </span>
            </p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {countryStats.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => zoomToCountry(c.name)}
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold transition hover:-translate-y-0.5 hover:shadow sm:px-3 sm:py-1 sm:text-sm ${
                    focusCountry === c.name
                      ? "bg-gradient-to-r from-sky-500 to-blue-500 text-white"
                      : "bg-gradient-to-r from-sky-100 to-blue-100 text-sky-700"
                  }`}
                >
                  {c.name}
                  <span
                    className={`ml-1 rounded-full px-1 py-0.5 text-[10px] font-bold sm:ml-1.5 sm:px-1.5 sm:text-xs ${
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
