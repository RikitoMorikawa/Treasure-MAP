import Link from "next/link";
import { addClimb } from "@/app/actions";
import { ClimbForm } from "../climb-form";

export const dynamic = "force-dynamic";

export default function NewClimbPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-5 text-white shadow-lg shadow-emerald-200">
        <h1 className="text-2xl font-extrabold tracking-tight">
          ＋ 新しい登山記録
        </h1>
        <p className="mt-1 text-sm text-emerald-100">
          登った山を登録します。
        </p>
      </div>
      <ClimbForm action={addClimb} submitLabel="追加する" />
      <Link
        href="/climbs"
        className="inline-block text-sm font-semibold text-emerald-600 hover:underline"
      >
        ← 一覧へ戻る
      </Link>
    </div>
  );
}
