"use client";

import { useState } from "react";
import Link from "next/link";

export type CalendarHotel = {
  url: string;
  checkinOn: string | null;
  checkoutOn: string | null;
};

export type CalendarDest = {
  country: string;
  city: string | null;
  arrivedOn: string | null;
  leftOn: string | null;
  hotels: CalendarHotel[];
};

// その日に該当するホテルのリンク。宿泊期間があれば期間中のみ、
// 期間未設定のホテルは滞在中ずっと表示する
export function hotelUrlsOn(d: CalendarDest, date: string) {
  return d.hotels
    .filter((h) =>
      h.checkinOn && h.checkoutOn
        ? h.checkinOn <= date && date <= h.checkoutOn
        : true,
    )
    .map((h) => h.url);
}

export function urlHost(u: string) {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
}

export type CalendarFlight = {
  url: string;
  flownOn: string | null;
  flownUntil: string | null;
};

// フライトがその日を含むか(到着日があれば期間扱い)
export function flightCovers(f: CalendarFlight, date: string) {
  if (!f.flownOn) return false;
  return f.flownOn <= date && date <= (f.flownUntil ?? f.flownOn);
}

export type CalendarTravel = {
  id: number;
  title: string;
  departedOn: string;
  returnedOn: string | null;
  destinationText: string;
  flights: CalendarFlight[];
  dests: CalendarDest[];
};

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function travelEnd(t: CalendarTravel) {
  return t.returnedOn ?? t.departedOn;
}

// 日別詳細では都市名だけを表示(都市未指定の行き先のみ国名)
export function destName(d: CalendarDest) {
  return d.city ?? d.country;
}

export function fmt(d: string) {
  const [, m, day] = d.split("-");
  return `${Number(m)}/${Number(day)}`;
}

export type DayEvent = { text: string; urls: string[] };

// その日の出来事(移動・滞在)を文章にする。
// 到着・滞在イベントには行き先のホテルリンク等を添える
export function dayEvents(t: CalendarTravel, date: string): DayEvent[] {
  const events: DayEvent[] = [];
  // 搭乗日なしの航空券は出発日・帰国日に添える。搭乗日ありはその日に表示
  const undatedFlights = t.flights
    .filter((f) => !f.flownOn)
    .map((f) => f.url);
  if (t.departedOn === date)
    events.push({ text: "✈️ 出発日", urls: undatedFlights });
  for (const f of t.flights) {
    if (!flightCovers(f, date)) continue;
    const range = f.flownUntil
      ? `(${fmt(f.flownOn as string)}〜${fmt(f.flownUntil)})`
      : "";
    events.push({
      text:
        date === t.departedOn
          ? `✈️ フライト${range}`
          : `✈️ フライト(移動日)${range}`,
      urls: [f.url],
    });
  }
  t.dests.forEach((s, i) => {
    const name = destName(s);
    if (s.arrivedOn === date) {
      const prev = i > 0 ? destName(t.dests[i - 1]) : null;
      events.push({
        text: prev
          ? `🚝 ${prev} → ${name} へ移動・到着`
          : `🛬 ${name} に到着`,
        urls: hotelUrlsOn(s, date),
      });
    }
    if (s.leftOn === date && s.arrivedOn !== date) {
      const isLast = i === t.dests.length - 1;
      const next = !isLast ? t.dests[i + 1] : null;
      // 次の行き先の到着日が同日ならそちらの「移動」で表現されるので重複させない
      if (!(next && next.arrivedOn === date)) {
        events.push({ text: `🛫 ${name} を出発`, urls: [] });
      }
    }
    if (s.arrivedOn && s.leftOn && s.arrivedOn < date && date < s.leftOn) {
      events.push({
        text: `🏨 ${name} に滞在(${fmt(s.arrivedOn)}〜${fmt(s.leftOn)})`,
        urls: hotelUrlsOn(s, date),
      });
    }
  });
  if (t.returnedOn === date)
    events.push({ text: "🏠 帰国日", urls: undatedFlights });
  return events;
}

// ホバーで表示する日別詳細ポップアップ(年間・旅程カレンダー共用)
export function DayPopup({ date, travels }: { date: string; travels: CalendarTravel[] }) {
  return (
    <div className="pointer-events-auto fixed inset-x-3 bottom-3 z-50 hidden rounded-xl border-2 border-sky-200 bg-white p-3 text-left shadow-xl group-hover:block sm:absolute sm:inset-x-auto sm:bottom-full sm:left-1/2 sm:z-30 sm:mb-1.5 sm:w-72 sm:-translate-x-1/2">
      <p className="mb-1.5 text-xs font-extrabold text-slate-700">
        📅 {date.replace(/-/g, "/")}
      </p>
      <div className="space-y-2">
        {travels.map((t) => {
          const events = dayEvents(t, date);
          return (
            <div key={t.id}>
              <p className="text-xs font-bold text-slate-700">
                ✈️ {t.title}
                <span className="ml-1.5 font-semibold text-slate-400">
                  {t.departedOn}
                  {travelEnd(t) !== t.departedOn ? ` 〜 ${travelEnd(t)}` : ""}
                </span>
              </p>
              {events.length > 0 ? (
                <ul className="mt-0.5 space-y-0.5">
                  {events.map((e, i) => (
                    <li key={i} className="text-xs text-slate-600">
                      {e.text}
                      {e.urls.map((u, ui) => (
                        <a
                          key={ui}
                          href={u}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-1.5 inline-flex items-center gap-0.5 rounded-full bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700 no-underline transition hover:bg-sky-200"
                        >
                          🔗 {urlHost(u)}
                        </a>
                      ))}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-0.5 text-xs text-slate-500">
                  行き先: {t.destinationText}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MiniMonth({
  year,
  mon,
  travels,
  today,
}: {
  year: number;
  mon: number;
  travels: CalendarTravel[];
  today: string;
}) {
  const month = `${year}-${pad(mon)}`;
  const firstWeekday = new Date(Date.UTC(year, mon - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, mon, 0)).getUTCDate();

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="rounded-xl border border-sky-100 bg-white p-2.5 shadow-sm">
      <p className="mb-1 text-center text-xs font-extrabold text-slate-600">
        {mon}月
      </p>
      <div className="grid grid-cols-7 gap-px text-center">
        {WEEKDAYS.map((w, i) => (
          <span
            key={w}
            className={`text-[9px] font-bold ${
              i === 0
                ? "text-rose-300"
                : i === 6
                  ? "text-sky-300"
                  : "text-slate-300"
            }`}
          >
            {w}
          </span>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <span key={i} />;
          const dateStr = `${month}-${pad(day)}`;
          const dayTravels = travels.filter(
            (t) => t.departedOn <= dateStr && dateStr <= travelEnd(t),
          );
          const isToday = dateStr === today;
          const covered = dayTravels.length > 0;
          return (
            <span key={i} className="group relative">
              <span
                className={`mx-auto flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                  covered
                    ? "cursor-pointer bg-gradient-to-br from-sky-400 to-blue-500 font-bold text-white transition group-hover:scale-125"
                    : "text-slate-500"
                } ${isToday ? "ring-2 ring-amber-400" : ""}`}
              >
                {day}
              </span>
              {covered && <DayPopup date={dateStr} travels={dayTravels} />}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function TravelCalendar({
  travels,
  initialYear,
}: {
  travels: CalendarTravel[];
  initialYear: number;
}) {
  const [year, setYear] = useState(initialYear);

  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Tokyo",
  });

  const goThisYear = () => setYear(Number(today.slice(0, 4)));

  // 表示年と期間が重なる旅行だけに絞る
  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;
  const yearTravels = travels.filter(
    (t) => t.departedOn <= yearEnd && travelEnd(t) >= yearStart,
  );

  const navBtn =
    "rounded-full px-3 py-1 text-sm font-bold text-sky-500 transition hover:bg-sky-100";

  return (
    <div className="rounded-2xl border-2 border-sky-200 bg-white p-5 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setYear((y) => y - 1)}
          className={navBtn}
        >
          ← 前年
        </button>
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-extrabold text-slate-700">{year}年</h3>
          <button
            type="button"
            onClick={goThisYear}
            className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-bold text-sky-600 transition hover:bg-sky-200"
          >
            今年
          </button>
        </div>
        <button
          type="button"
          onClick={() => setYear((y) => y + 1)}
          className={navBtn}
        >
          翌年 →
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }, (_, i) => (
          <MiniMonth
            key={i}
            year={year}
            mon={i + 1}
            travels={yearTravels}
            today={today}
          />
        ))}
      </div>

      {yearTravels.length > 0 && (
        <ul className="mt-4 space-y-1 border-t border-sky-100 pt-3">
          {yearTravels.map((t) => (
            <li key={t.id} className="text-xs">
              <Link
                href={`/travels/${t.id}`}
                className="group flex flex-wrap items-center gap-2 rounded-lg px-1.5 py-1 transition hover:bg-sky-50"
              >
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-gradient-to-br from-sky-400 to-blue-500" />
                <span className="font-bold text-slate-700 group-hover:text-sky-700">
                  ✈️ {t.title}
                </span>
                <span className="font-semibold text-sky-600">
                  {t.departedOn}
                  {travelEnd(t) !== t.departedOn ? ` 〜 ${travelEnd(t)}` : ""}
                </span>
                <span className="text-sky-400 opacity-0 transition group-hover:opacity-100">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
