import Link from "next/link";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { cities, countries, travelDestinations, travels } from "@/db/schema";
import { addTravel, deleteTravel } from "@/app/actions";
import { TravelCalendar } from "./calendar";
import { TravelForm } from "./travel-form";
import { TravelRouteMap } from "./client-widgets";

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
    .orderBy(asc(travelDestinations.id));

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

  // フォーム用マスター(国 → 都市)
  const countryRows = await db
    .select()
    .from(countries)
    .orderBy(asc(countries.name));
  const cityRows = await db.select().from(cities).orderBy(asc(cities.name));
  const masters = countryRows.map((co) => ({
    id: co.id,
    name: co.name,
    cities: cityRows
      .filter((ci) => ci.countryId === co.id)
      .map((ci) => ({ id: ci.id, name: ci.name })),
  }));

  const calendarTravels = rows.map((t) => ({
    id: t.id,
    title: t.title,
    departedOn: t.departedOn,
    returnedOn: t.returnedOn,
    destinationText: destText(t.id),
  }));

  // 座標を持つ行き先を到着日順(なければ登録順)に並べて経路にする
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
        }))
        .filter((d) => d.lat != null && d.lng != null) as {
        id: number;
        country: string;
        cities: string[];
        lat: number;
        lng: number;
        arrivedOn: string | null;
        leftOn: string | null;
      }[];
      const sorted = stops.every((d) => d.arrivedOn)
        ? [...stops].sort((a, b) =>
            (a.arrivedOn as string).localeCompare(b.arrivedOn as string),
          )
        : stops;
      return { travelId: t.id, title: t.title, stops: sorted };
    })
    .filter((r) => r.stops.length > 0);

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-5 text-white shadow-lg shadow-sky-200">
        <h1 className="text-2xl font-extrabold tracking-tight">✈️ 旅行記録</h1>
        <p className="mt-1 text-sm text-sky-100">
          行った場所と思い出を記録します。
        </p>
      </div>

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
          ＋ 新しい記録を追加
        </h2>
        <TravelForm action={addTravel} masters={masters} submitLabel="追加する" />
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
