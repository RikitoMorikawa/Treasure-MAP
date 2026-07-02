import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { travels } from "@/db/schema";
import { addTravel, deleteTravel } from "@/app/actions";
import { TravelCalendar } from "./calendar";
import { TravelForm } from "./travel-form";

export const dynamic = "force-dynamic";

export default async function TravelsPage() {
  const currentMonth = new Date()
    .toLocaleDateString("en-CA", { timeZone: "Asia/Tokyo" })
    .slice(0, 7);

  const rows = await db
    .select()
    .from(travels)
    .orderBy(desc(travels.departedOn), desc(travels.id));

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-5 text-white shadow-lg shadow-sky-200">
        <h1 className="text-2xl font-extrabold tracking-tight">✈️ 旅行記録</h1>
        <p className="mt-1 text-sm text-sky-100">
          行った場所と思い出を記録します。
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="border-l-4 border-sky-500 pl-3 font-bold text-slate-800">
          ＋ 新しい記録を追加
        </h2>
        <TravelForm action={addTravel} submitLabel="追加する" />
      </section>

      <section className="space-y-3">
        <h2 className="border-l-4 border-sky-500 pl-3 font-bold text-slate-800">
          🗓 カレンダー
        </h2>
        <TravelCalendar initialMonth={currentMonth} travels={rows} />
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
                    🗓 {t.departedOn}
                    {t.returnedOn && t.returnedOn !== t.departedOn
                      ? ` 〜 ${t.returnedOn}`
                      : ""}
                  </p>
                  {t.memo && (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                      {t.memo}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Link
                    href={`/travels/${t.id}/edit`}
                    className="rounded-full px-2 py-1 text-xs font-semibold text-sky-500 transition hover:bg-sky-50"
                  >
                    編集
                  </Link>
                  <form action={deleteTravel}>
                    <input type="hidden" name="id" value={t.id} />
                    <button
                      type="submit"
                      className="rounded-full px-2 py-1 text-xs text-slate-500 transition hover:bg-rose-50 hover:text-rose-500"
                    >
                      削除
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
