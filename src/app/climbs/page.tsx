import { desc } from "drizzle-orm";
import { db } from "@/db";
import { climbs } from "@/db/schema";
import { addClimb, deleteClimb } from "@/app/actions";
import { ClimbMap, LocationPicker } from "./client-widgets";

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

const WEATHER_OPTIONS = [
  { value: "晴れ", emoji: "☀️" },
  { value: "晴れ時々曇り", emoji: "🌤️" },
  { value: "曇り", emoji: "☁️" },
  { value: "雨", emoji: "🌧️" },
  { value: "雪", emoji: "❄️" },
  { value: "霧", emoji: "🌫️" },
];

function weatherEmoji(w: string) {
  return WEATHER_OPTIONS.find((o) => o.value === w)?.emoji ?? "🌈";
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
      <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-5 text-white shadow-lg shadow-emerald-200">
        <h1 className="text-2xl font-extrabold tracking-tight">⛰️ 登山記録</h1>
        <p className="mt-1 text-sm text-emerald-100">登った山を記録します。</p>
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

      <form
        action={addClimb}
        className="space-y-4 rounded-2xl border-2 border-emerald-200 bg-white p-6 shadow-md"
      >
        <h2 className="border-l-4 border-emerald-500 pl-3 font-bold text-slate-800">
          ＋ 新しい記録を追加
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-sm">
            <span className="mb-1 block font-semibold text-slate-600">
              山名 <span className="text-rose-400">*</span>
            </span>
            <input
              name="mountainName"
              required
              placeholder="富士山"
              className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-semibold text-slate-600">
              標高(m)
            </span>
            <input
              type="number"
              name="elevation"
              min="0"
              placeholder="3776"
              className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-semibold text-slate-600">
              登頂日 <span className="text-rose-400">*</span>
            </span>
            <input
              type="date"
              name="climbedOn"
              required
              className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-semibold text-slate-600">
              天気
            </span>
            <select
              name="weather"
              defaultValue=""
              className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
            >
              <option value="">未設定</option>
              {WEATHER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.emoji} {o.value}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="block text-sm">
          <span className="mb-1 block font-semibold text-slate-600">
            コース定数(単一なら左だけ、範囲なら両方)
          </span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              name="courseConstantMin"
              min="0"
              step="0.1"
              placeholder="20"
              className="w-28 rounded-xl border border-emerald-200 bg-white px-3 py-2 transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
            />
            <span className="font-bold text-slate-400">〜</span>
            <input
              type="number"
              name="courseConstantMax"
              min="0"
              step="0.1"
              placeholder="25"
              className="w-28 rounded-xl border border-emerald-200 bg-white px-3 py-2 transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
            />
          </div>
        </div>
        <LocationPicker />
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-slate-600">メモ</span>
          <textarea
            name="memo"
            rows={3}
            placeholder="ルート、感想など"
            className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
          />
        </label>
        <button
          type="submit"
          className="rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-2 text-sm font-bold text-white shadow-md shadow-emerald-200 transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          追加する
        </button>
      </form>

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
                  className="flex items-start justify-between gap-4 rounded-2xl border-2 border-emerald-200 bg-white p-5 shadow-md transition hover:border-emerald-400 hover:shadow-lg"
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
                  <form action={deleteClimb}>
                    <input type="hidden" name="id" value={c.id} />
                    <button
                      type="submit"
                      className="rounded-full px-2 py-1 text-xs text-slate-500 transition hover:bg-rose-50 hover:text-rose-500"
                    >
                      削除
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
