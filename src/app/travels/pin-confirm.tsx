"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const pinIcon = L.divIcon({
  html: '<div style="font-size:26px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,.4))">📍</div>',
  className: "",
  iconSize: [26, 26],
  iconAnchor: [13, 26],
});

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyTo({ pos }: { pos: [number, number] | null }) {
  const map = useMap();
  if (pos) map.flyTo(pos, Math.max(map.getZoom(), 9));
  return null;
}

// 新規都市の位置をフォーム上で確認・微調整するミニ地図
export default function PinConfirm({
  query,
  lat,
  lng,
  onPick,
}: {
  query: string;
  lat: number | null;
  lng: number | null;
  onPick: (lat: number, lng: number) => void;
}) {
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
  const [status, setStatus] = useState("");
  const pos: [number, number] | null = lat != null && lng != null ? [lat, lng] : null;

  async function search() {
    if (!query.trim()) return;
    setStatus("検索中…");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&accept-language=ja&layer=address&q=${encodeURIComponent(query)}`,
      );
      const results: { lat: string; lon: string; display_name: string }[] =
        await res.json();
      if (results.length === 0) {
        setStatus("見つかりませんでした。地図をクリックして指定してください。");
        return;
      }
      const la = Number(results[0].lat);
      const ln = Number(results[0].lon);
      onPick(la, ln);
      setFlyTarget([la, ln]);
      setStatus(`📍 ${results[0].display_name}`);
    } catch {
      setStatus("検索に失敗しました。地図をクリックして指定してください。");
    }
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={search}
          className="rounded-full bg-sky-500 px-3 py-1 text-xs font-bold text-white transition hover:bg-sky-600"
        >
          🔍 この名前で位置を検索
        </button>
        <span className="text-xs text-slate-400">
          {pos ? `${pos[0].toFixed(4)}, ${pos[1].toFixed(4)}` : "未設定(保存時に自動取得)"}
        </span>
      </div>
      {status && <p className="text-xs text-slate-500">{status}</p>}
      <div className="overflow-hidden rounded-lg border border-sky-200">
        <MapContainer
          center={pos ?? [20, 100]}
          zoom={pos ? 9 : 2}
          scrollWheelZoom
          className="z-0 h-44 w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPick={onPick} />
          <FlyTo pos={flyTarget} />
          {pos && <Marker position={pos} icon={pinIcon} />}
        </MapContainer>
      </div>
    </div>
  );
}
