import Link from "next/link";
import { addTravel } from "@/app/actions";
import { TravelForm } from "../travel-form";
import { getMasters } from "../masters";

export const dynamic = "force-dynamic";

export default async function NewTravelPage() {
  const masters = await getMasters();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-5 text-white shadow-lg shadow-sky-200">
        <h1 className="text-2xl font-extrabold tracking-tight">
          ＋ 新しい旅行記録
        </h1>
        <p className="mt-1 text-sm text-sky-100">
          行き先・期間・思い出を登録します。
        </p>
      </div>
      <TravelForm action={addTravel} masters={masters} submitLabel="追加する" />
      <Link
        href="/travels"
        className="inline-block text-sm font-semibold text-sky-600 hover:underline"
      >
        ← 一覧へ戻る
      </Link>
    </div>
  );
}
