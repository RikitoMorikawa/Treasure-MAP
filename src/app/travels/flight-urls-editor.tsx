"use client";

import { useState } from "react";

// 航空券リンクの入力(旅行に紐づく。複数可)
export function FlightUrlsEditor({ initial }: { initial?: string[] }) {
  const [urls, setUrls] = useState<string[]>(initial ?? []);

  const inputCls =
    "rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-sm transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 focus:outline-none";

  return (
    <div className="space-y-2">
      <span className="block text-sm font-semibold text-slate-600">
        ✈️ 航空券リンク
        <span className="ml-2 text-xs font-normal text-slate-400">
          予約確認ページなどの URL(複数可)
        </span>
      </span>
      {urls.map((u, i) => (
        <div key={i} className="flex items-center gap-1">
          <span className="text-xs">✈️</span>
          <input
            type="url"
            value={u}
            onChange={(e) =>
              setUrls((us) => us.map((x, xi) => (xi === i ? e.target.value : x)))
            }
            placeholder="https://(航空券の予約確認 URL など)"
            className={`flex-1 ${inputCls}`}
          />
          <button
            type="button"
            onClick={() => setUrls((us) => us.filter((_, xi) => xi !== i))}
            className="rounded-full px-2 py-1 text-xs font-bold text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
            title="この URL を削除"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setUrls((us) => [...us, ""])}
        className="rounded-full border border-indigo-300 px-3 py-1 text-xs font-bold text-indigo-600 transition hover:bg-indigo-50"
      >
        ✈️ 航空券 URL を追加
      </button>
      <input
        type="hidden"
        name="flightUrls"
        value={JSON.stringify(urls.map((u) => u.trim()).filter(Boolean))}
      />
    </div>
  );
}
