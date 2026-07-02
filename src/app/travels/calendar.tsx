"use client";

import { useState } from "react";
import type { Travel } from "@/db/schema";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function travelEnd(t: Travel) {
  return t.returnedOn ?? t.departedOn;
}

function MiniMonth({
  year,
  mon,
  travels,
  today,
}: {
  year: number;
  mon: number;
  travels: Travel[];
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
            <span
              key={i}
              title={
                covered
                  ? dayTravels
                      .map(
                        (t) =>
                          `✈️ ${t.title}(${t.destination})${t.departedOn}〜${travelEnd(t)}`,
                      )
                      .join("\n")
                  : undefined
              }
              className={`mx-auto flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                covered
                  ? "bg-gradient-to-br from-sky-400 to-blue-500 font-bold text-white"
                  : "text-slate-500"
              } ${isToday ? "ring-2 ring-amber-400" : ""}`}
            >
              {day}
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
  travels: Travel[];
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
            <li key={t.id} className="flex flex-wrap items-center gap-2 text-xs">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-gradient-to-br from-sky-400 to-blue-500" />
              <span className="font-bold text-slate-700">✈️ {t.title}</span>
              <span className="text-slate-500">({t.destination})</span>
              <span className="font-semibold text-sky-600">
                {t.departedOn}
                {travelEnd(t) !== t.departedOn ? ` 〜 ${travelEnd(t)}` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
