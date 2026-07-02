"use client";

import dynamic from "next/dynamic";

export const TravelRouteMap = dynamic(() => import("./travel-route-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-96 w-full items-center justify-center rounded-2xl bg-sky-50 text-sm text-sky-400">
      地図を読み込み中…
    </div>
  ),
});
