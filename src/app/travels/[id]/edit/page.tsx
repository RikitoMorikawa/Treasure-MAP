import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { cities, countries, travelDestinations, travels } from "@/db/schema";
import { updateTravel } from "@/app/actions";
import { TravelForm } from "../../travel-form";

export const dynamic = "force-dynamic";

export default async function EditTravelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isInteger(numId)) notFound();

  const [travel] = await db
    .select()
    .from(travels)
    .where(eq(travels.id, numId));
  if (!travel) notFound();

  const dests = await db
    .select()
    .from(travelDestinations)
    .where(eq(travelDestinations.travelId, numId))
    .orderBy(asc(travelDestinations.id));

  const countryRows = await db
    .select()
    .from(countries)
    .orderBy(asc(countries.name));
  const cityRows = await db.select().from(cities).orderBy(asc(cities.name));
  const masters = countryRows.map((co) => ({
    id: co.id,
    name: co.name,
    cities: cityRows
      .filter((ci) => ci.countryId === co.id)
      .map((ci) => ({ id: ci.id, name: ci.name })),
  }));

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-5 text-white shadow-lg shadow-sky-200">
        <h1 className="text-2xl font-extrabold tracking-tight">
          ✏️ 旅行記録を編集
        </h1>
        <p className="mt-1 text-sm text-sky-100">{travel.title}</p>
      </div>
      <TravelForm
        action={updateTravel}
        travel={travel}
        masters={masters}
        destinations={dests.map((d) => ({
          countryId: d.countryId,
          cityId: d.cityId,
          arrivedOn: d.arrivedOn,
          leftOn: d.leftOn,
        }))}
        submitLabel="更新する"
      />
      <Link
        href="/travels"
        className="inline-block text-sm font-semibold text-sky-600 hover:underline"
      >
        ← 一覧へ戻る
      </Link>
    </div>
  );
}
