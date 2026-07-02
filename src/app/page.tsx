import Link from "next/link";
import { count } from "drizzle-orm";
import { db } from "@/db";
import { climbs, travels } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [travelCount] = await db.select({ value: count() }).from(travels);
  const [climbCount] = await db.select({ value: count() }).from(climbs);

  return (
    <div className="space-y-8">
      <div className="text-center sm:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight">
          これまでの<span className="bg-gradient-to-r from-sky-500 to-emerald-500 bg-clip-text text-transparent">記録</span>
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          旅行や登山の思い出を残していきましょう。
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Link
          href="/travels"
          className="group rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 p-6 text-white shadow-lg shadow-sky-200 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-300"
        >
          <div className="text-4xl transition group-hover:scale-110">✈️</div>
          <h2 className="mt-3 text-lg font-bold">旅行記録</h2>
          <p className="mt-1 text-4xl font-extrabold">
            {travelCount.value}
            <span className="ml-1 text-sm font-medium text-sky-100">件</span>
          </p>
          <p className="mt-2 text-xs text-sky-100">
            行った場所と思い出を残す →
          </p>
        </Link>
        <Link
          href="/climbs"
          className="group rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 p-6 text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-300"
        >
          <div className="text-4xl transition group-hover:scale-110">⛰️</div>
          <h2 className="mt-3 text-lg font-bold">登山記録</h2>
          <p className="mt-1 text-4xl font-extrabold">
            {climbCount.value}
            <span className="ml-1 text-sm font-medium text-emerald-100">件</span>
          </p>
          <p className="mt-2 text-xs text-emerald-100">
            登った山を記録する →
          </p>
        </Link>
      </div>
    </div>
  );
}
