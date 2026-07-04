"use client";

import { useState } from "react";
import {
  dayEvents,
  flightCovers,
  pad,
  travelEnd,
  urlHost,
  type CalendarTravel,
} from "./calendar";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

// 旅行期間に含まれる月("YYYY-MM")の一覧
function monthsBetween(start: string, end: string): string[] {
  const [sy, sm] = start.slice(0, 7).split("-").map(Number);
  const [ey, em] = end.slice(0, 7).split("-").map(Number);
  const out: string[] = [];
  for (
    let t = sy * 12 + (sm - 1);
    t <= ey * 12 + (em - 1) && out.length < 12;
    t++
  ) {
    out.push(`${Math.floor(t / 12)}-${pad((t % 12) + 1)}`);
  }
  return out;
}

// 1旅行専用のカレンダー。期間中の日に滞在都市を表示し、
// クリックでその日の滞在・移動の詳細を出す
export function TripCalendar({ travel }: { travel: CalendarTravel }) {
  const [selected, setSelected] = useState<string | null>(null);

  const start = travel.departedOn;
  const end = travelEnd(travel);
  const months = monthsBetween(start, end);

  // その日に滞在している行き先の表示名(都市優先)
  const stayLabel = (date: string) => {
    const stay = travel.dests.find(
      (d) =>
        d.arrivedOn &&
        d.leftOn &&
        d.arrivedOn <= date &&
        date <= d.leftOn,
    );
    return stay ? (stay.city ?? stay.country) : null;
  };

  const events = selected ? dayEvents(travel, selected) : [];

  return (
    <div className="rounded-2xl border-2 border-sky-200 bg-white p-5 shadow-md">
      <div
        className={`grid gap-4 ${months.length > 1 ? "sm:grid-cols-2" : ""}`}
      >
        {months.map((month) => {
          const [year, mon] = month.split("-").map(Number);
          const firstWeekday = new Date(
            Date.UTC(year, mon - 1, 1),
          ).getUTCDay();
          const daysInMonth = new Date(Date.UTC(year, mon, 0)).getUTCDate();
          const cells: (number | null)[] = [
            ...Array.from({ length: firstWeekday }, () => null),
            ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
          ];
          return (
            <div key={month}>
              <p className="mb-1.5 text-center text-sm font-extrabold text-slate-600">
                {year}年 {mon}月
              </p>
              <div className="grid grid-cols-7 gap-1 text-center">
                {WEEKDAYS.map((w, i) => (
                  <span
                    key={w}
                    className={`text-[10px] font-bold ${
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
                  const inTrip = start <= dateStr && dateStr <= end;
                  const hasFlight = travel.flights.some((f) =>
                    flightCovers(f, dateStr),
                  );
                  const label = inTrip ? stayLabel(dateStr) : null;
                  const isSelected = dateStr === selected;
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={!inTrip}
                      onClick={() =>
                        setSelected((cur) => (cur === dateStr ? null : dateStr))
                      }
                      className={`flex min-h-12 flex-col items-center rounded-lg border p-1 transition ${
                        inTrip
                          ? "cursor-pointer border-sky-300 bg-sky-50 hover:border-sky-500 hover:bg-sky-100"
                          : "border-slate-100 bg-slate-50 opacity-50"
                      } ${isSelected ? "border-rose-400 bg-rose-50 ring-1 ring-rose-300" : ""}`}
                    >
                      <span
                        className={`text-[11px] font-bold ${
                          inTrip ? "text-slate-700" : "text-slate-400"
                        }`}
                      >
                        {day}
                        {hasFlight && " ✈️"}
                      </span>
                      {label && (
                        <span className="mt-0.5 w-full truncate rounded bg-gradient-to-r from-sky-400 to-blue-400 px-0.5 text-[9px] font-semibold text-white">
                          {label}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <div className="mt-4 rounded-xl border-2 border-rose-200 bg-rose-50/50 p-4">
          <div className="mb-1.5 flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-slate-700">
              📅 {selected.replace(/-/g, "/")}
            </h4>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="rounded-full px-2 py-0.5 text-xs font-bold text-slate-400 transition hover:bg-white hover:text-rose-500"
            >
              ✕ 閉じる
            </button>
          </div>
          {events.length > 0 ? (
            <ul className="space-y-0.5">
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
            <p className="text-sm text-slate-500">
              この日の予定情報はありません(都市ごとの到着日・出発日を入れると表示されます)
            </p>
          )}
        </div>
      )}
    </div>
  );
}
