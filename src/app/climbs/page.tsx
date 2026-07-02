import { desc } from "drizzle-orm";
import { db } from "@/db";
import { climbs } from "@/db/schema";
import { addClimb, deleteClimb } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function ClimbsPage() {
  const rows = await db
    .select()
    .from(climbs)
    .orderBy(desc(climbs.climbedOn), desc(climbs.id));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">⛰️ 登山記録</h1>
        <p className="mt-1 text-sm text-stone-500">
          登った山を記録します。
        </p>
      </div>

      <form
        action={addClimb}
        className="space-y-4 rounded-xl border border-stone-200 bg-white p-6"
      >
        <h2 className="font-semibold">新しい記録を追加</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-stone-700">
              山名 <span className="text-red-500">*</span>
            </span>
            <input
              name="mountainName"
              required
              placeholder="富士山"
              className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-stone-700">
              標高(m)
            </span>
            <input
              type="number"
              name="elevation"
              min="0"
              placeholder="3776"
              className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-stone-700">
              登頂日 <span className="text-red-500">*</span>
            </span>
            <input
              type="date"
              name="climbedOn"
              required
              className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
            />
          </label>
        </div>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-stone-700">メモ</span>
          <textarea
            name="memo"
            rows={3}
            placeholder="ルート、天候、感想など"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
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
            まだ記録がありません。最初の登山を追加しましょう。
          </p>
        ) : (
          <ul className="space-y-3">
            {rows.map((c) => (
              <li
                key={c.id}
                className="flex items-start justify-between gap-4 rounded-xl border border-stone-200 bg-white p-5"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{c.mountainName}</span>
                    {c.elevation != null && (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        {c.elevation.toLocaleString()} m
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-stone-500">{c.climbedOn}</p>
                  {c.memo && (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-stone-600">
                      {c.memo}
                    </p>
                  )}
                </div>
                <form action={deleteClimb}>
                  <input type="hidden" name="id" value={c.id} />
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
