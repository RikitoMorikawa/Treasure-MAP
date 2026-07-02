import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { travels } from "@/db/schema";
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
