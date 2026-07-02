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

export function TravelCalendar({
  travels,
  initialMonth,
}: {
  travels: Travel[];
  initialMonth: string; // "YYYY-MM"
}) {
  const [ym, setYm] = useState(() => {
    const [y, m] = initialMonth.split("-").map(Number);
    return { y, m };
  });

  const shift = (months: number) =>
    setYm(({ y, m }) => {
      const total = y * 12 + (m - 1) + months;
      return { y: Math.floor(total / 12), m: (total % 12) + 1 };
    });

  const goToday = () => {
    const [y, m] = new Date()
      .toLocaleDateString("en-CA", { timeZone: "Asia/Tokyo" })
      .slice(0, 7)
      .split("-")
      .map(Number);
    setYm({ y, m });
  };

  const { y: year, m: mon } = ym;
  const month = `${year}-${pad(mon)}`;
  const firstWeekday = new Date(Date.UTC(year, mon - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, mon, 0)).getUTCDate();

  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Tokyo",
  });

  // 表示月と期間が重なる旅行だけに絞る
  const monthStart = `${month}-01`;
  const monthEnd = `${month}-31`;
  const monthTravels = travels.filter(
    (t) => t.departedOn <= monthEnd && travelEnd(t) >= monthStart,
  );

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const navBtn =
    "rounded-full px-2.5 py-1 text-sm font-bold text-sky-500 transition hover:bg-sky-100";

  return (
    <div className="rounded-2xl border-2 border-sky-200 bg-white p-5 shadow-md">
      <div className="mb-4 flex items-center justify-between gap-1">
        <div className="flex items-center">
          <button type="button" onClick={() => shift(-12)} className={navBtn} title="前年">
            «
          </button>
          <button type="button" onClick={() => shift(-1)} className={navBtn} title="前月">
            ‹
          </button>
        </div>
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-extrabold text-slate-700">
            {year}年 {mon}月
          </h3>
          <button
            type="button"
            onClick={goToday}
            className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-bold text-sky-600 transition hover:bg-sky-200"
          >
            今月
          </button>
        </div>
        <div className="flex items-center">
          <button type="button" onClick={() => shift(1)} className={navBtn} title="翌月">
            ›
          </button>
          <button type="button" onClick={() => shift(12)} className={navBtn} title="翌年">
            »
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold">
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            className={
              i === 0
                ? "py-1 text-rose-400"
                : i === 6
                  ? "py-1 text-sky-400"
                  : "py-1 text-slate-400"
            }
          >
            {w}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;
          const dateStr = `${month}-${pad(day)}`;
          const dayTravels = monthTravels.filter(
            (t) => t.departedOn <= dateStr && dateStr <= travelEnd(t),
          );
          const isToday = dateStr === today;
          return (
            <div
              key={i}
              className={`min-h-14 rounded-lg border p-1 text-left align-top ${
                isToday
                  ? "border-amber-400 bg-amber-50"
                  : dayTravels.length > 0
                    ? "border-sky-400 bg-sky-100"
                    : "border-slate-200 bg-slate-50"
              }`}
            >
              <span
                className={`text-[11px] font-semibold ${
                  isToday ? "text-amber-600" : "text-slate-400"
                }`}
              >
                {day}
              </span>
              {dayTravels.map((t) => {
                // タイトルは期間の初日(または月初)に表示、続く日は帯だけ
                const showLabel = dateStr === t.departedOn || day === 1;
                const isStart = dateStr === t.departedOn;
                const isEnd = dateStr === travelEnd(t);
                const rounding =
                  isStart && isEnd
                    ? "rounded"
                    : isStart
                      ? "-mr-1 rounded-l"
                      : isEnd
                        ? "-ml-1 rounded-r"
                        : "-mx-1";
                return showLabel ? (
                  <p
                    key={t.id}
                    title={`${t.title}(${t.destination})${t.departedOn}〜${travelEnd(t)}`}
                    className={`mt-0.5 truncate bg-gradient-to-r from-sky-400 to-blue-400 px-1 py-0.5 text-[10px] font-semibold text-white ${rounding}`}
                  >
                    ✈️ {t.title}
                  </p>
                ) : (
                  <div
                    key={t.id}
                    title={`${t.title}(${t.destination})${t.departedOn}〜${travelEnd(t)}`}
                    className={`mt-0.5 h-[19px] bg-gradient-to-r from-sky-300 to-blue-300 ${rounding}`}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
