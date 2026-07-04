import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { climbs } from "@/db/schema";
import { deleteClimb } from "@/app/actions";
import { ClimbMap } from "./client-widgets";
import { weatherEmoji } from "./constants";

export const dynamic = "force-dynamic";

// コース定数の目安(山本正嘉「登山の運動生理学とトレーニング学」に基づく体力度のラフな区分)
function courseLevel(cc: number): { label: string; className: string } {
  if (cc < 15) return { label: "初級", className: "bg-lime-100 text-lime-700" };
  if (cc < 25)
    return { label: "中級", className: "bg-amber-100 text-amber-700" };
  if (cc < 35)
    return { label: "中〜上級", className: "bg-orange-100 text-orange-700" };
  return { label: "上級", className: "bg-rose-100 text-rose-700" };
}

function courseConstantText(min: number | null, max: number | null) {
  if (min == null && max == null) return null;
  if (min != null && max != null && min !== max) return `${min}〜${max}`;
  return String(min ?? max);
}

export default async function ClimbsPage() {
  const rows = await db
    .select()
    .from(climbs)
    .orderBy(desc(climbs.climbedOn), desc(climbs.id));

  const pins = rows
    .filter((c) => c.latitude != null && c.longitude != null)
    .map((c) => ({
      id: c.id,
      name: c.mountainName,
      lat: c.latitude as number,
      lng: c.longitude as number,
      climbedOn: c.climbedOn,
      elevation: c.elevation,
    }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 px-5 py-4 text-white shadow-lg shadow-emerald-200 sm:gap-4 sm:px-6 sm:py-5">
        <div className="min-w-0">
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
            ⛰️ 登山記録
          </h1>
          <p className="mt-1 text-xs text-emerald-100 sm:text-sm">
            登った山を記録します。
          </p>
        </div>
        <Link
          href="/climbs/new"
          className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-emerald-600 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg sm:px-4 sm:py-2 sm:text-sm"
        >
          ＋ 記録を追加
        </Link>
      </div>

      <section className="space-y-3">
        <h2 className="border-l-4 border-emerald-500 pl-3 font-bold text-slate-800">
          🗺 登った山マップ
          <span className="ml-2 rounded-full bg-emerald-500 px-2.5 py-0.5 text-xs font-bold text-white">
            {pins.length}座
          </span>
        </h2>
        <div className="overflow-hidden rounded-2xl border-2 border-emerald-200 shadow-md">
          <ClimbMap pins={pins} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="border-l-4 border-emerald-500 pl-3 font-bold text-slate-800">
          記録一覧
          <span className="ml-2 rounded-full bg-emerald-500 px-2.5 py-0.5 text-xs font-bold text-white">
            {rows.length}件
          </span>
        </h2>
        {rows.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-emerald-300 bg-white p-8 text-center text-sm text-slate-500">
            まだ記録がありません。最初の登山を追加しましょう 🏔
          </p>
        ) : (
          <ul className="space-y-3">
            {rows.map((c) => {
              const cc = courseConstantText(
                c.courseConstantMin,
                c.courseConstantMax,
              );
              const levelBase =
                c.courseConstantMin != null && c.courseConstantMax != null
                  ? (c.courseConstantMin + c.courseConstantMax) / 2
                  : (c.courseConstantMin ?? c.courseConstantMax);
              return (
                <li
                  key={c.id}
                  className="flex flex-col gap-2 rounded-2xl border-2 border-emerald-200 bg-white p-4 shadow-md transition hover:border-emerald-400 hover:shadow-lg sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:p-5"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold">{c.mountainName}</span>
                      {c.elevation != null && (
                        <span className="rounded-full bg-gradient-to-r from-emerald-100 to-green-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                          ⛰ {c.elevation.toLocaleString()} m
                        </span>
                      )}
                      {cc != null && levelBase != null && (
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${courseLevel(levelBase).className}`}
                        >
                          💪 コース定数 {cc}({courseLevel(levelBase).label})
                        </span>
                      )}
                      {c.weather && (
                        <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-700">
                          {weatherEmoji(c.weather)} {c.weather}
                        </span>
                      )}
                      {c.latitude != null && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
                          📍 マップ登録済み
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      🗓 {c.climbedOn}
                    </p>
                    {c.memo && (
                      <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                        {c.memo}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1 self-end sm:self-auto">
                    <Link
                      href={`/climbs/${c.id}/edit`}
                      className="rounded-full px-2 py-1 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-50"
                    >
                      編集
                    </Link>
                    <form action={deleteClimb}>
                      <input type="hidden" name="id" value={c.id} />
                      <button
                        type="submit"
                        className="rounded-full px-2 py-1 text-xs text-slate-500 transition hover:bg-rose-50 hover:text-rose-500"
                      >
                        削除
                      </button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
