"use client";

import { useState } from "react";
import Link from "next/link";

type CalendarDest = {
  country: string;
  city: string | null;
  arrivedOn: string | null;
  leftOn: string | null;
  urls: string[];
};

function urlHost(u: string) {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
}

type CalendarTravel = {
  id: number;
  title: string;
  departedOn: string;
  returnedOn: string | null;
  destinationText: string;
  dests: CalendarDest[];
};

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function travelEnd(t: CalendarTravel) {
  return t.returnedOn ?? t.departedOn;
}

function destName(d: CalendarDest) {
  return d.city ? `${d.country}・${d.city}` : d.country;
}

function fmt(d: string) {
  const [, m, day] = d.split("-");
  return `${Number(m)}/${Number(day)}`;
}

type DayEvent = { text: string; urls: string[] };

// その日の出来事(移動・滞在)を文章にする。
// 到着・滞在イベントには行き先のホテルリンク等を添える
function dayEvents(t: CalendarTravel, date: string): DayEvent[] {
  const events: DayEvent[] = [];
  if (t.departedOn === date) events.push({ text: "✈️ 出発日", urls: [] });
  t.dests.forEach((s, i) => {
    const name = destName(s);
    if (s.arrivedOn === date) {
      const prev = i > 0 ? destName(t.dests[i - 1]) : null;
      events.push({
        text: prev
          ? `🚝 ${prev} → ${name} へ移動・到着`
          : `🛬 ${name} に到着`,
        urls: s.urls,
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
        urls: s.urls,
      });
    }
  });
  if (t.returnedOn === date) events.push({ text: "🏠 帰国日", urls: [] });
  return events;
}

function MiniMonth({
  year,
  mon,
  travels,
  today,
  selected,
  onSelect,
}: {
  year: number;
  mon: number;
  travels: CalendarTravel[];
  today: string;
  selected: string | null;
  onSelect: (date: string) => void;
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
          const isSelected = dateStr === selected;
          return (
            <button
              key={i}
              type="button"
              disabled={!covered}
              onClick={() => onSelect(dateStr)}
              title={
                covered
                  ? dayTravels
                      .map(
                        (t) =>
                          `✈️ ${t.title}(${t.destinationText})${t.departedOn}〜${travelEnd(t)}`,
                      )
                      .join("\n")
                  : undefined
              }
              className={`mx-auto flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                covered
                  ? "cursor-pointer bg-gradient-to-br from-sky-400 to-blue-500 font-bold text-white transition hover:scale-125"
                  : "text-slate-500"
              } ${isToday ? "ring-2 ring-amber-400" : ""} ${
                isSelected ? "scale-125 ring-2 ring-rose-400" : ""
              }`}
            >
              {day}
            </button>
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
  const [selected, setSelected] = useState<string | null>(null);

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

  const selectedTravels = selected
    ? travels.filter(
        (t) => t.departedOn <= selected && selected <= travelEnd(t),
      )
    : [];

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
            selected={selected}
            onSelect={(d) => setSelected((cur) => (cur === d ? null : d))}
          />
        ))}
      </div>

      {selected && selectedTravels.length > 0 && (
        <div className="mt-4 rounded-xl border-2 border-rose-200 bg-rose-50/50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-slate-700">
              📅 {selected.replace(/-/g, "/")} の予定
            </h4>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="rounded-full px-2 py-0.5 text-xs font-bold text-slate-400 transition hover:bg-white hover:text-rose-500"
            >
              ✕ 閉じる
            </button>
          </div>
          <div className="space-y-3">
            {selectedTravels.map((t) => {
              const events = dayEvents(t, selected);
              return (
                <div key={t.id} className="rounded-lg bg-white p-3 shadow-sm">
                  <p className="text-sm font-bold text-slate-700">
                    ✈️ {t.title}
                    <span className="ml-2 text-xs font-semibold text-slate-400">
                      {t.departedOn}
                      {travelEnd(t) !== t.departedOn
                        ? ` 〜 ${travelEnd(t)}`
                        : ""}
                    </span>
                  </p>
                  {events.length > 0 ? (
                    <ul className="mt-1.5 space-y-0.5">
                      {events.map((e, i) => (
                        <li key={i} className="text-sm text-slate-600">
                          {e.text}
                          {e.urls.map((u, ui) => (
                            <a
                              key={ui}
                              href={u}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 inline-flex items-center gap-0.5 rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-700 no-underline transition hover:bg-sky-200"
                            >
                              🔗 {urlHost(u)}
                            </a>
                          ))}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1.5 text-sm text-slate-500">
                      行き先: {t.destinationText}
                      <span className="ml-1 text-xs text-slate-400">
                        (都市ごとの到着日・出発日を入れると、この日の滞在・移動が表示されます)
                      </span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

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
