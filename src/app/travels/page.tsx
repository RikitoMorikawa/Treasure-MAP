import Link from "next/link";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  cities,
  countries,
  flights,
  hotels,
  travelDestinations,
  travels,
} from "@/db/schema";
import { TravelCalendar } from "./calendar";
import { TravelsOverview } from "./overview";
import { DestinationLines } from "./destination-lines";

export const dynamic = "force-dynamic";

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

  // ホテル・航空券リンク
  const hotelRows = await db.select().from(hotels);
  type HotelInfo = {
    url: string;
    checkinOn: string | null;
    checkoutOn: string | null;
  };
  const hotelsByDest = new Map<number, HotelInfo[]>();
  for (const h of hotelRows) {
    const list = hotelsByDest.get(h.destinationId) ?? [];
    list.push({ url: h.url, checkinOn: h.checkinOn, checkoutOn: h.checkoutOn });
    hotelsByDest.set(h.destinationId, list);
  }
  const flightRows = await db.select().from(flights);
  const flightsByTravel = new Map<
    number,
    { url: string; flownOn: string | null; flownUntil: string | null }[]
  >();
  for (const f of flightRows) {
    const list = flightsByTravel.get(f.travelId) ?? [];
    list.push({ url: f.url, flownOn: f.flownOn, flownUntil: f.flownUntil });
    flightsByTravel.set(f.travelId, list);
  }

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
    flights: flightsByTravel.get(t.id) ?? [],
    dests: (destsByTravel.get(t.id) ?? []).map((d) => ({
      country: d.country,
      city: d.city,
      arrivedOn: d.arrivedOn,
      leftOn: d.leftOn,
      hotels: hotelsByDest.get(d.id) ?? [],
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
          urls: (hotelsByDest.get(d.id) ?? []).map((h) => h.url),
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
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-4 text-white shadow-lg shadow-sky-200 sm:gap-4 sm:px-6 sm:py-5">
        <div className="min-w-0">
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
            ✈️ 旅行記録
          </h1>
          <p className="mt-1 text-xs text-sky-100 sm:text-sm">
            行った場所と思い出を記録します。
          </p>
        </div>
        <Link
          href="/travels/new"
          className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-sky-600 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg sm:px-4 sm:py-2 sm:text-sm"
        >
          ＋ 記録を追加
        </Link>
      </div>

      <TravelsOverview
        travelCount={rows.length}
        cityCount={cityCount}
        countryStats={countryStats}
        routes={routes}
      />

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
                className="flex flex-col gap-2 rounded-2xl border-2 border-sky-200 bg-white p-4 shadow-md transition hover:border-sky-400 hover:shadow-lg sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:p-5"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold">{t.title}</span>
                    <span className="text-xs font-semibold text-slate-500">
                      🗓 {t.departedOn}
                      {t.returnedOn && t.returnedOn !== t.departedOn
                        ? ` 〜 ${t.returnedOn}`
                        : ""}
                    </span>
                  </div>
                  <DestinationLines
                    dests={(destsByTravel.get(t.id) ?? []).map((d) => ({
                      id: d.id,
                      country: d.country,
                      city: d.city,
                      arrivedOn: d.arrivedOn,
                      leftOn: d.leftOn,
                    }))}
                  />
                  {t.memo && (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                      {t.memo}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1 self-end sm:self-auto">
                  <Link
                    href={`/travels/${t.id}`}
                    className="rounded-full bg-sky-500 px-2.5 py-1 text-xs font-bold text-white transition hover:bg-sky-600"
                  >
                    詳細
                  </Link>
                  <Link
                    href={`/travels/${t.id}/edit`}
                    className="rounded-full px-2 py-1 text-xs font-semibold text-sky-500 transition hover:bg-sky-50"
                  >
                    編集
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
