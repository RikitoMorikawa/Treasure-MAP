import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { climbs } from "@/db/schema";
import { updateClimb } from "@/app/actions";
import { ClimbForm } from "../../climb-form";

export const dynamic = "force-dynamic";

export default async function EditClimbPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isInteger(numId)) notFound();

  const [climb] = await db.select().from(climbs).where(eq(climbs.id, numId));
  if (!climb) notFound();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-5 text-white shadow-lg shadow-emerald-200">
        <h1 className="text-2xl font-extrabold tracking-tight">
          ✏️ 登山記録を編集
        </h1>
        <p className="mt-1 text-sm text-emerald-100">{climb.mountainName}</p>
      </div>
      <ClimbForm action={updateClimb} climb={climb} submitLabel="更新する" />
      <Link
        href="/climbs"
        className="inline-block text-sm font-semibold text-emerald-600 hover:underline"
      >
        ← 一覧へ戻る
      </Link>
    </div>
  );
}
