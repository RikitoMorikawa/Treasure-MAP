import Link from "next/link";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { cities, countries, travelDestinations, travels } from "@/db/schema";
import { deleteTravel } from "@/app/actions";
import { TravelCalendar } from "./calendar";
import { TravelRouteMap } from "./client-widgets";

export const dynamic = "force-dynamic";

function urlHost(u: string) {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
}

export default async function TravelsPage() {
  const currentYear = Number(
    new Date()
      .toLocaleDateString("en-CA", { timeZone: "Asia/Tokyo" })
      .slice(0, 4),
  );

  const rows = await db
    .select()
    .from(travels)
    .orderBy(desc(travels.departedOn), desc(travels.id));

  // 行き先(マスター JOIN 済み)。座標は都市優先、なければ国の代表点
  const destRows = await db
    .select({
      id: travelDestinations.id,
      travelId: travelDestinations.travelId,
      arrivedOn: travelDestinations.arrivedOn,
      leftOn: travelDestinations.leftOn,
      urls: travelDestinations.urls,
      country: countries.name,
      city: cities.name,
      cityLat: cities.latitude,
      cityLng: cities.longitude,
      countryLat: countries.latitude,
      countryLng: countries.longitude,
    })
    .from(travelDestinations)
    .innerJoin(countries, eq(travelDestinations.countryId, countries.id))
    .leftJoin(cities, eq(travelDestinations.cityId, cities.id))
    .orderBy(asc(travelDestinations.sortOrder), asc(travelDestinations.id));

  const destsByTravel = new Map<number, typeof destRows>();
  for (const d of destRows) {
    const list = destsByTravel.get(d.travelId) ?? [];
    list.push(d);
    destsByTravel.set(d.travelId, list);
  }
  // 「フランス(パリ、ニース)/ イタリア(ローマ)」形式のテキスト
  const destText = (id: number) => {
    const grouped = new Map<string, string[]>();
    for (const d of destsByTravel.get(id) ?? []) {
      const list = grouped.get(d.country) ?? [];
      if (d.city && !list.includes(d.city)) list.push(d.city);
      grouped.set(d.country, list);
    }
    return (
      [...grouped.entries()]
        .map(([country, cs]) =>
          cs.length > 0 ? `${country}(${cs.join("、")})` : country,
        )
        .join(" / ") || "—"
    );
  };

  // 国ごとの訪問回数(同じ旅行内で複数都市を回っても1回と数える)
  const countryVisits = new Map<string, Set<number>>();
  for (const d of destRows) {
    const set = countryVisits.get(d.country) ?? new Set<number>();
    set.add(d.travelId);
    countryVisits.set(d.country, set);
  }
  const countryStats = [...countryVisits.entries()]
    .map(([name, set]) => ({ name, count: set.size }))
    .sort(
      (a, b) => b.count - a.count || a.name.localeCompare(b.name, "ja"),
    );
  const cityCount = new Set(
    destRows.filter((d) => d.city).map((d) => `${d.country}:${d.city}`),
  ).size;

  const calendarTravels = rows.map((t) => ({
    id: t.id,
    title: t.title,
    departedOn: t.departedOn,
    returnedOn: t.returnedOn,
    destinationText: destText(t.id),
    dests: (destsByTravel.get(t.id) ?? []).map((d) => ({
      country: d.country,
      city: d.city,
      arrivedOn: d.arrivedOn,
      leftOn: d.leftOn,
      urls: d.urls,
    })),
  }));

  // 座標を持つ行き先を並び順(sort_order)どおりに経路にする
  const routes = rows
    .map((t) => {
      const stops = (destsByTravel.get(t.id) ?? [])
        .map((d) => ({
          id: d.id,
          country: d.country,
          cities: d.city ? [d.city] : [],
          lat: d.cityLat ?? d.countryLat,
          lng: d.cityLng ?? d.countryLng,
          arrivedOn: d.arrivedOn,
          leftOn: d.leftOn,
          urls: d.urls,
        }))
        .filter((d) => d.lat != null && d.lng != null) as {
        id: number;
        country: string;
        cities: string[];
        lat: number;
        lng: number;
        arrivedOn: string | null;
        leftOn: string | null;
        urls: string[];
      }[];
      return { travelId: t.id, title: t.title, stops };
    })
    .filter((r) => r.stops.length > 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-5 text-white shadow-lg shadow-sky-200">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            ✈️ 旅行記録
          </h1>
          <p className="mt-1 text-sm text-sky-100">
            行った場所と思い出を記録します。
          </p>
        </div>
        <Link
          href="/travels/new"
          className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-bold text-sky-600 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          ＋ 記録を追加
        </Link>
      </div>

      <section className="space-y-3">
        <h2 className="border-l-4 border-sky-500 pl-3 font-bold text-slate-800">
          📊 旅の記録
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border-2 border-sky-200 bg-white p-4 text-center shadow-md">
            <p className="text-xs font-semibold text-slate-500">✈️ 旅行回数</p>
            <p className="mt-1 text-3xl font-extrabold text-sky-600">
              {rows.length}
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
            </p>
            <div className="flex flex-wrap gap-2">
              {countryStats.map((c) => (
                <span
                  key={c.name}
                  className="rounded-full bg-gradient-to-r from-sky-100 to-blue-100 px-3 py-1 text-sm font-semibold text-sky-700"
                >
                  {c.name}
                  <span className="ml-1.5 rounded-full bg-sky-500 px-1.5 py-0.5 text-xs font-bold text-white">
                    ×{c.count}
                  </span>
                </span>
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
          <TravelRouteMap routes={routes} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="border-l-4 border-sky-500 pl-3 font-bold text-slate-800">
          🗓 カレンダー
        </h2>
        <TravelCalendar initialYear={currentYear} travels={calendarTravels} />
      </section>

      <section className="space-y-3">
        <h2 className="border-l-4 border-sky-500 pl-3 font-bold text-slate-800">
          記録一覧
          <span className="ml-2 rounded-full bg-sky-500 px-2.5 py-0.5 text-xs font-bold text-white">
            {rows.length}件
          </span>
        </h2>
        {rows.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-sky-300 bg-white p-8 text-center text-sm text-slate-500">
            まだ記録がありません。最初の旅行を追加しましょう 🌏
          </p>
        ) : (
          <ul className="space-y-3">
            {rows.map((t) => (
              <li
                key={t.id}
                className="flex items-start justify-between gap-4 rounded-2xl border-2 border-sky-200 bg-white p-5 shadow-md transition hover:border-sky-400 hover:shadow-lg"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold">{t.title}</span>
                    {(destsByTravel.get(t.id) ?? []).map((d) => (
                      <span
                        key={d.id}
                        className="rounded-full bg-gradient-to-r from-sky-100 to-blue-100 px-2.5 py-0.5 text-xs font-semibold text-sky-700"
                      >
                        📍 {d.country}
                        {d.city && (
                          <span className="font-normal text-sky-500">
                            ・{d.city}
                          </span>
                        )}
                        {(d.arrivedOn || d.leftOn) && (
                          <span className="ml-1 font-normal text-sky-400">
                            {d.arrivedOn?.slice(5).replace("-", "/")}→
                            {d.leftOn?.slice(5).replace("-", "/")}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    🗓 {t.departedOn}
                    {t.returnedOn && t.returnedOn !== t.departedOn
                      ? ` 〜 ${t.returnedOn}`
                      : ""}
                  </p>
                  {(destsByTravel.get(t.id) ?? []).some(
                    (d) => d.urls.length > 0,
                  ) && (
                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                      {(destsByTravel.get(t.id) ?? []).flatMap((d) =>
                        d.urls.map((u, ui) => (
                          <a
                            key={`${d.id}-${ui}`}
                            href={u}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-sky-600 underline decoration-sky-300 hover:text-sky-800"
                          >
                            🏨 {d.city ?? d.country}:{urlHost(u)}
                          </a>
                        )),
                      )}
                    </div>
                  )}
                  {t.memo && (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                      {t.memo}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Link
                    href={`/travels/${t.id}/edit`}
                    className="rounded-full px-2 py-1 text-xs font-semibold text-sky-500 transition hover:bg-sky-50"
                  >
                    編集
                  </Link>
                  <form action={deleteTravel}>
                    <input type="hidden" name="id" value={t.id} />
                    <button
                      type="submit"
                      className="rounded-full px-2 py-1 text-xs text-slate-500 transition hover:bg-rose-50 hover:text-rose-500"
                    >
                      削除
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
