import Link from "next/link";
import type { Travel } from "@/db/schema";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function travelEnd(t: Travel) {
  return t.returnedOn ?? t.departedOn;
}

export function TravelCalendar({
  month,
  travels,
}: {
  month: string; // "YYYY-MM"
  travels: Travel[];
}) {
  const [year, mon] = month.split("-").map(Number);
  const firstWeekday = new Date(Date.UTC(year, mon - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, mon, 0)).getUTCDate();

  const prev = mon === 1 ? `${year - 1}-12` : `${year}-${pad(mon - 1)}`;
  const next = mon === 12 ? `${year + 1}-01` : `${year}-${pad(mon + 1)}`;

  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Tokyo",
  });

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="rounded-2xl border-2 border-sky-200 bg-white p-5 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href={`/travels?month=${prev}`}
          className="rounded-full px-3 py-1 text-sm font-bold text-sky-500 transition hover:bg-sky-100"
        >
          ← 前月
        </Link>
        <h3 className="text-lg font-extrabold text-slate-700">
          {year}年 {mon}月
        </h3>
        <Link
          href={`/travels?month=${next}`}
          className="rounded-full px-3 py-1 text-sm font-bold text-sky-500 transition hover:bg-sky-100"
        >
          翌月 →
        </Link>
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
          const dayTravels = travels.filter(
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
                const showLabel =
                  dateStr === t.departedOn || day === 1;
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
