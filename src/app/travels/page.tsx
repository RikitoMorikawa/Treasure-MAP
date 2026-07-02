import { desc } from "drizzle-orm";
import { db } from "@/db";
import { travels } from "@/db/schema";
import { addTravel, deleteTravel } from "@/app/actions";
import { TravelCalendar } from "./calendar";

export const dynamic = "force-dynamic";

export default async function TravelsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month: monthParam } = await searchParams;
  const currentMonth = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Tokyo",
  });
  const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(monthParam ?? "")
    ? (monthParam as string)
    : currentMonth.slice(0, 7);

  const rows = await db
    .select()
    .from(travels)
    .orderBy(desc(travels.visitedOn), desc(travels.id));

  const monthTravels = rows.filter((t) => t.visitedOn.startsWith(month));

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-5 text-white shadow-lg shadow-sky-200">
        <h1 className="text-2xl font-extrabold tracking-tight">✈️ 旅行記録</h1>
        <p className="mt-1 text-sm text-sky-100">
          行った場所と思い出を記録します。
        </p>
      </div>

      <form
        action={addTravel}
        className="space-y-4 rounded-2xl border-2 border-sky-200 bg-white p-6 shadow-md"
      >
        <h2 className="border-l-4 border-sky-500 pl-3 font-bold text-slate-800">
          ＋ 新しい記録を追加
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-semibold text-slate-600">
              タイトル <span className="text-rose-400">*</span>
            </span>
            <input
              name="title"
              required
              placeholder="夏の北海道旅行"
              className="w-full rounded-xl border border-sky-200 bg-white px-3 py-2 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 focus:outline-none"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-semibold text-slate-600">
              行き先 <span className="text-rose-400">*</span>
            </span>
            <input
              name="destination"
              required
              placeholder="北海道・札幌"
              className="w-full rounded-xl border border-sky-200 bg-white px-3 py-2 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 focus:outline-none"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-semibold text-slate-600">
              訪問日 <span className="text-rose-400">*</span>
            </span>
            <input
              type="date"
              name="visitedOn"
              required
              className="w-full rounded-xl border border-sky-200 bg-white px-3 py-2 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 focus:outline-none"
            />
          </label>
        </div>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-slate-600">メモ</span>
          <textarea
            name="memo"
            rows={3}
            placeholder="印象に残ったことなど"
            className="w-full rounded-xl border border-sky-200 bg-white px-3 py-2 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 focus:outline-none"
          />
        </label>
        <button
          type="submit"
          className="rounded-full bg-gradient-to-r from-sky-500 to-blue-500 px-6 py-2 text-sm font-bold text-white shadow-md shadow-sky-200 transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          追加する
        </button>
      </form>

      <section className="space-y-3">
        <h2 className="border-l-4 border-sky-500 pl-3 font-bold text-slate-800">
          🗓 カレンダー
        </h2>
        <TravelCalendar month={month} travels={monthTravels} />
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
                    <span className="rounded-full bg-gradient-to-r from-sky-100 to-blue-100 px-2.5 py-0.5 text-xs font-semibold text-sky-700">
                      📍 {t.destination}
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    🗓 {t.visitedOn}
                  </p>
                  {t.memo && (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                      {t.memo}
                    </p>
                  )}
                </div>
                <form action={deleteTravel}>
                  <input type="hidden" name="id" value={t.id} />
                  <button
                    type="submit"
                    className="rounded-full px-2 py-1 text-xs text-slate-500 transition hover:bg-rose-50 hover:text-rose-500"
                  >
                    削除
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
