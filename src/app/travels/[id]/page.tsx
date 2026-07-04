import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  cities,
  countries,
  flights,
  hotels,
  travelDestinations,
  travels,
} from "@/db/schema";
import { TravelRouteMap } from "../client-widgets";

export const dynamic = "force-dynamic";

function urlHost(u: string) {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
}

function fmt(d: string) {
  const [, m, day] = d.split("-");
  return `${Number(m)}/${Number(day)}`;
}

export default async function TravelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isInteger(numId)) notFound();

  const [travel] = await db
    .select()
    .from(travels)
    .where(eq(travels.id, numId));
  if (!travel) notFound();

  const dests = await db
    .select({
      id: travelDestinations.id,
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
    .where(eq(travelDestinations.travelId, numId))
    .orderBy(asc(travelDestinations.sortOrder), asc(travelDestinations.id));

  const hotelRows = await db.select().from(hotels);
  const hotelUrls = (destId: number) =>
    hotelRows.filter((h) => h.destinationId === destId).map((h) => h.url);
  const flightRows = (
    await db.select().from(flights).where(eq(flights.travelId, numId))
  ).sort((a, b) => (a.flownOn ?? "").localeCompare(b.flownOn ?? ""));

  const stops = dests
    .map((d) => ({
      id: d.id,
      country: d.country,
      cities: d.city ? [d.city] : [],
      lat: d.cityLat ?? d.countryLat,
      lng: d.cityLng ?? d.countryLng,
      arrivedOn: d.arrivedOn,
      leftOn: d.leftOn,
      urls: hotelUrls(d.id),
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

  const routes =
    stops.length > 0
      ? [{ travelId: travel.id, title: travel.title, stops }]
      : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-5 text-white shadow-lg shadow-sky-200">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            ✈️ {travel.title}
          </h1>
          <p className="mt-1 text-sm text-sky-100">
            🗓 {travel.departedOn}
            {travel.returnedOn && travel.returnedOn !== travel.departedOn
              ? ` 〜 ${travel.returnedOn}`
              : ""}
          </p>
        </div>
        <Link
          href={`/travels/${travel.id}/edit`}
          className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-bold text-sky-600 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          ✏️ 編集
        </Link>
      </div>

      {flightRows.length > 0 && (
        <section className="space-y-3">
          <h2 className="border-l-4 border-sky-500 pl-3 font-bold text-slate-800">
            ✈️ 航空券
          </h2>
          <div className="flex flex-wrap gap-2 rounded-2xl border-2 border-sky-200 bg-white p-4 shadow-md">
            {flightRows.map((f) => (
              <a
                key={f.id}
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-200"
              >
                ✈️ {f.flownOn ? `${fmt(f.flownOn)} ` : ""}
                {urlHost(f.url)}
              </a>
            ))}
          </div>
        </section>
      )}

      {routes.length > 0 && (
        <section className="space-y-3">
          <h2 className="border-l-4 border-sky-500 pl-3 font-bold text-slate-800">
            🗺 経路
          </h2>
          <div className="overflow-hidden rounded-2xl border-2 border-sky-200 shadow-md">
            <TravelRouteMap routes={routes} fitToStops />
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="border-l-4 border-sky-500 pl-3 font-bold text-slate-800">
          📍 行程
        </h2>
        <ol className="space-y-2">
          {dests.map((d, i) => (
            <li
              key={d.id}
              className="flex items-start gap-3 rounded-2xl border-2 border-sky-200 bg-white p-4 shadow-md"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-500 text-sm font-bold text-white">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="font-bold text-slate-700">
                  {d.country}
                  {d.city && (
                    <span className="font-semibold text-sky-600">
                      ・{d.city}
                    </span>
                  )}
                </p>
                {(d.arrivedOn || d.leftOn) && (
                  <p className="mt-0.5 text-xs font-semibold text-slate-500">
                    🛬 {d.arrivedOn ? fmt(d.arrivedOn) : "?"} → 🛫{" "}
                    {d.leftOn ? fmt(d.leftOn) : "?"}
                  </p>
                )}
                {hotelUrls(d.id).length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {hotelUrls(d.id).map((u, ui) => (
                      <a
                        key={ui}
                        href={u}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-200"
                      >
                        🔗 {urlHost(u)}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {travel.memo && (
        <section className="space-y-3">
          <h2 className="border-l-4 border-sky-500 pl-3 font-bold text-slate-800">
            📝 メモ
          </h2>
          <p className="rounded-2xl border-2 border-sky-200 bg-white p-4 text-sm whitespace-pre-wrap text-slate-600 shadow-md">
            {travel.memo}
          </p>
        </section>
      )}

      <Link
        href="/travels"
        className="inline-block text-sm font-semibold text-sky-600 hover:underline"
      >
        ← 一覧へ戻る
      </Link>
    </div>
  );
}
