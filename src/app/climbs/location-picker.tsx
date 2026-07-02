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

const JAPAN_CENTER: [number, number] = [37.5, 137.5];

function ClickHandler({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyTo({ pos }: { pos: [number, number] | null }) {
  const map = useMap();
  if (pos) map.flyTo(pos, Math.max(map.getZoom(), 11));
  return null;
}

export default function LocationPicker() {
  const [query, setQuery] = useState("");
  const [pos, setPos] = useState<[number, number] | null>(null);
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
  const [status, setStatus] = useState<string>("");

  async function search() {
    if (!query.trim()) return;
    setStatus("検索中…");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&accept-language=ja&q=${encodeURIComponent(query)}`,
      );
      const results: { lat: string; lon: string; display_name: string }[] =
        await res.json();
      if (results.length === 0) {
        setStatus("見つかりませんでした。地図をクリックして指定もできます。");
        return;
      }
      const lat = Number(results[0].lat);
      const lng = Number(results[0].lon);
      setPos([lat, lng]);
      setFlyTarget([lat, lng]);
      setStatus(`📍 ${results[0].display_name}`);
    } catch {
      setStatus("検索に失敗しました。地図をクリックして指定してください。");
    }
  }

  return (
    <div className="space-y-2">
      <span className="block text-sm font-semibold text-slate-600">
        場所(山名・住所で検索、または地図をクリック)
      </span>
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              search();
            }
          }}
          placeholder="例: 高尾山 / 富士山 / 長野県松本市"
          className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
        />
        <button
          type="button"
          onClick={search}
          className="shrink-0 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-600"
        >
          検索
        </button>
      </div>
      {status && <p className="text-xs text-slate-500">{status}</p>}
      <div className="overflow-hidden rounded-xl border-2 border-emerald-200">
        <MapContainer
          center={JAPAN_CENTER}
          zoom={5}
          scrollWheelZoom
          className="z-0 h-56 w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler
            onPick={(lat, lng) => {
              setPos([lat, lng]);
              setFlyTarget(null);
              setStatus(`📍 ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
            }}
          />
          <FlyTo pos={flyTarget} />
          {pos && <Marker position={pos} icon={pinIcon} />}
        </MapContainer>
      </div>
      <input type="hidden" name="latitude" value={pos ? pos[0] : ""} />
      <input type="hidden" name="longitude" value={pos ? pos[1] : ""} />
    </div>
  );
}
