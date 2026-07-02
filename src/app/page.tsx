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
      <div>
        <h1 className="text-2xl font-bold">これまでの記録</h1>
        <p className="mt-1 text-sm text-stone-500">
          旅行や登山の思い出を残していきましょう。
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/travels"
          className="rounded-xl border border-stone-200 bg-white p-6 transition hover:shadow-md"
        >
          <div className="text-3xl">✈️</div>
          <h2 className="mt-2 text-lg font-semibold">旅行記録</h2>
          <p className="mt-1 text-3xl font-bold text-sky-600">
            {travelCount.value}
            <span className="ml-1 text-sm font-normal text-stone-500">件</span>
          </p>
        </Link>
        <Link
          href="/climbs"
          className="rounded-xl border border-stone-200 bg-white p-6 transition hover:shadow-md"
        >
          <div className="text-3xl">⛰️</div>
          <h2 className="mt-2 text-lg font-semibold">登山記録</h2>
          <p className="mt-1 text-3xl font-bold text-emerald-600">
            {climbCount.value}
            <span className="ml-1 text-sm font-normal text-stone-500">件</span>
          </p>
        </Link>
      </div>
    </div>
  );
}
