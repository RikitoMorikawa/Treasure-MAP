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
        <h1 className="text-2xl font-extrabold tracking-tight">
          ⛰️ <span className="bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">登山記録</span>
        </h1>
        <p className="mt-1 text-sm text-slate-500">登った山を記録します。</p>
      </div>

      <form
        action={addClimb}
        className="space-y-4 rounded-2xl border border-emerald-100 bg-white/80 p-6 shadow-lg shadow-emerald-100 backdrop-blur"
      >
        <h2 className="font-bold text-emerald-700">＋ 新しい記録を追加</h2>
        <div className="grid gap-4 sm:grid-cols-3">
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
        </div>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-slate-600">メモ</span>
          <textarea
            name="memo"
            rows={3}
            placeholder="ルート、天候、感想など"
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
        <h2 className="font-bold text-slate-600">
          記録一覧
          <span className="ml-2 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
            {rows.length}件
          </span>
        </h2>
        {rows.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-emerald-200 bg-white/50 p-8 text-center text-sm text-slate-400">
            まだ記録がありません。最初の登山を追加しましょう 🏔
          </p>
        ) : (
          <ul className="space-y-3">
            {rows.map((c) => (
              <li
                key={c.id}
                className="flex items-start justify-between gap-4 rounded-2xl border border-emerald-100 bg-white/80 p-5 shadow-sm backdrop-blur transition hover:shadow-md"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold">{c.mountainName}</span>
                    {c.elevation != null && (
                      <span className="rounded-full bg-gradient-to-r from-emerald-100 to-green-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                        ⛰ {c.elevation.toLocaleString()} m
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs font-medium text-slate-400">
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
                    className="rounded-full px-2 py-1 text-xs text-slate-300 transition hover:bg-rose-50 hover:text-rose-500"
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
