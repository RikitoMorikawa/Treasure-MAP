"use client";

import dynamic from "next/dynamic";

function MapLoading({ height }: { height: string }) {
  return (
    <div
      className={`flex ${height} w-full items-center justify-center rounded-2xl bg-emerald-50 text-sm text-emerald-400`}
    >
      地図を読み込み中…
    </div>
  );
}

export const ClimbMap = dynamic(() => import("./climb-map"), {
  ssr: false,
  loading: () => <MapLoading height="h-80" />,
});

export const LocationPicker = dynamic(() => import("./location-picker"), {
  ssr: false,
  loading: () => <MapLoading height="h-72" />,
});
