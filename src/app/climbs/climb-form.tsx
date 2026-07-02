import type { Climb } from "@/db/schema";
import { WEATHER_OPTIONS } from "./constants";
import { LocationPicker } from "./client-widgets";

export function ClimbForm({
  action,
  climb,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  climb?: Climb;
  submitLabel: string;
}) {
  return (
    <form
      action={action}
      className="space-y-4 rounded-2xl border-2 border-emerald-200 bg-white p-6 shadow-md"
    >
      {climb && <input type="hidden" name="id" value={climb.id} />}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-slate-600">
            山名 <span className="text-rose-400">*</span>
          </span>
          <input
            name="mountainName"
            required
            defaultValue={climb?.mountainName}
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
            defaultValue={climb?.elevation ?? ""}
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
            defaultValue={climb?.climbedOn}
            className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-slate-600">天気</span>
          <select
            name="weather"
            defaultValue={climb?.weather ?? ""}
            className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
          >
            <option value="">未設定</option>
            {WEATHER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.emoji} {o.value}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="block text-sm">
        <span className="mb-1 block font-semibold text-slate-600">
          コース定数(単一なら左だけ、範囲なら両方)
        </span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            name="courseConstantMin"
            min="0"
            step="0.1"
            defaultValue={climb?.courseConstantMin ?? ""}
            placeholder="20"
            className="w-28 rounded-xl border border-emerald-200 bg-white px-3 py-2 transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
          />
          <span className="font-bold text-slate-400">〜</span>
          <input
            type="number"
            name="courseConstantMax"
            min="0"
            step="0.1"
            defaultValue={climb?.courseConstantMax ?? ""}
            placeholder="25"
            className="w-28 rounded-xl border border-emerald-200 bg-white px-3 py-2 transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
          />
        </div>
      </div>
      <LocationPicker initialLat={climb?.latitude} initialLng={climb?.longitude} />
      <label className="block text-sm">
        <span className="mb-1 block font-semibold text-slate-600">メモ</span>
        <textarea
          name="memo"
          rows={3}
          defaultValue={climb?.memo ?? ""}
          placeholder="ルート、感想など"
          className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
        />
      </label>
      <button
        type="submit"
        className="rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-2 text-sm font-bold text-white shadow-md shadow-emerald-200 transition hover:-translate-y-0.5 hover:shadow-lg"
      >
        {submitLabel}
      </button>
    </form>
  );
}
