import { desc } from "drizzle-orm";
import { db } from "@/db";
import { travels } from "@/db/schema";
import { addTravel, deleteTravel } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function TravelsPage() {
  const rows = await db
    .select()
    .from(travels)
    .orderBy(desc(travels.visitedOn), desc(travels.id));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">✈️ 旅行記録</h1>
        <p className="mt-1 text-sm text-stone-500">
          行った場所と思い出を記録します。
        </p>
      </div>

      <form
        action={addTravel}
        className="space-y-4 rounded-xl border border-stone-200 bg-white p-6"
      >
        <h2 className="font-semibold">新しい記録を追加</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-stone-700">
              タイトル <span className="text-red-500">*</span>
            </span>
            <input
              name="title"
              required
              placeholder="夏の北海道旅行"
              className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-sky-500 focus:outline-none"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-stone-700">
              行き先 <span className="text-red-500">*</span>
            </span>
            <input
              name="destination"
              required
              placeholder="北海道・札幌"
              className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-sky-500 focus:outline-none"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-stone-700">
              訪問日 <span className="text-red-500">*</span>
            </span>
            <input
              type="date"
              name="visitedOn"
              required
              className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-sky-500 focus:outline-none"
            />
          </label>
        </div>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-stone-700">メモ</span>
          <textarea
            name="memo"
            rows={3}
            placeholder="印象に残ったことなど"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-sky-500 focus:outline-none"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
        >
          追加する
        </button>
      </form>

      <section className="space-y-3">
        <h2 className="font-semibold text-stone-700">
          記録一覧({rows.length}件)
        </h2>
        {rows.length === 0 ? (
          <p className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500">
            まだ記録がありません。最初の旅行を追加しましょう。
          </p>
        ) : (
          <ul className="space-y-3">
            {rows.map((t) => (
              <li
                key={t.id}
                className="flex items-start justify-between gap-4 rounded-xl border border-stone-200 bg-white p-5"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{t.title}</span>
                    <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">
                      {t.destination}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-stone-500">{t.visitedOn}</p>
                  {t.memo && (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-stone-600">
                      {t.memo}
                    </p>
                  )}
                </div>
                <form action={deleteTravel}>
                  <input type="hidden" name="id" value={t.id} />
                  <button
                    type="submit"
                    className="text-xs text-stone-400 transition hover:text-red-500"
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
