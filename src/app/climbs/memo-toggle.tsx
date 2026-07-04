"use client";

import { useState } from "react";

// 記録一覧のメモ。初期表示は閉じて、矢印クリックで開閉する
export function MemoToggle({ memo }: { memo: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-1.5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-50"
      >
        {open ? "▲ メモを閉じる" : "▼ メモを表示"}
      </button>
      {open && (
        <p className="mt-1 whitespace-pre-wrap rounded-lg bg-emerald-50/60 p-2 text-sm text-slate-600">
          {memo}
        </p>
      )}
    </div>
  );
}
