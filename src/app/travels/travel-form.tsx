import type { Travel } from "@/db/schema";
import {
  DestinationsEditor,
  type DestinationInitial,
  type MasterCountry,
} from "./destinations-editor";

export function TravelForm({
  action,
  travel,
  masters,
  destinations,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  travel?: Travel;
  masters: MasterCountry[];
  destinations?: DestinationInitial[];
  submitLabel: string;
}) {
  return (
    <form
      action={action}
      className="space-y-4 rounded-2xl border-2 border-sky-200 bg-white p-6 shadow-md"
    >
      {travel && <input type="hidden" name="id" value={travel.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-slate-600">
            タイトル <span className="text-rose-400">*</span>
          </span>
          <input
            name="title"
            required
            defaultValue={travel?.title}
            placeholder="夏の北海道旅行"
            className="w-full rounded-xl border border-sky-200 bg-white px-3 py-2 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 focus:outline-none"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-slate-600">
            出国日 <span className="text-rose-400">*</span>
          </span>
          <input
            type="date"
            name="departedOn"
            required
            defaultValue={travel?.departedOn}
            className="w-full rounded-xl border border-sky-200 bg-white px-3 py-2 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 focus:outline-none"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-slate-600">
            帰国日(日帰りなら空欄)
          </span>
          <input
            type="date"
            name="returnedOn"
            defaultValue={travel?.returnedOn ?? ""}
            className="w-full rounded-xl border border-sky-200 bg-white px-3 py-2 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 focus:outline-none"
          />
        </label>
      </div>
      <DestinationsEditor masters={masters} initial={destinations} />
      <label className="block text-sm">
        <span className="mb-1 block font-semibold text-slate-600">メモ</span>
        <textarea
          name="memo"
          rows={3}
          defaultValue={travel?.memo ?? ""}
          placeholder="印象に残ったことなど"
          className="w-full rounded-xl border border-sky-200 bg-white px-3 py-2 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 focus:outline-none"
        />
      </label>
      <button
        type="submit"
        className="rounded-full bg-gradient-to-r from-sky-500 to-blue-500 px-6 py-2 text-sm font-bold text-white shadow-md shadow-sky-200 transition hover:-translate-y-0.5 hover:shadow-lg"
      >
        {submitLabel}
      </button>
    </form>
  );
}
