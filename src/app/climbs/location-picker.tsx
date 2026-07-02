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

type GeocodeResult = { lat: number; lng: number; label: string };

// 郵便番号 → 住所 (zipcloud)
async function zipToAddress(zip: string): Promise<string | null> {
  const res = await fetch(
    `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zip}`,
  );
  const data = await res.json();
  const r = data?.results?.[0];
  if (!r) return null;
  return `${r.address1}${r.address2}${r.address3}`;
}

// 国土地理院の住所検索(日本の住所・山名に強い)
async function gsiSearch(q: string): Promise<GeocodeResult | null> {
  const res = await fetch(
    `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(q)}`,
  );
  const data: {
    geometry: { coordinates: [number, number] };
    properties: { title: string };
  }[] = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  const [lng, lat] = data[0].geometry.coordinates;
  return { lat, lng, label: data[0].properties.title };
}

// フォールバック: Nominatim(日本国内に限定)
async function nominatimSearch(q: string): Promise<GeocodeResult | null> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=jp&accept-language=ja&q=${encodeURIComponent(q)}`,
  );
  const results: { lat: string; lon: string; display_name: string }[] =
    await res.json();
  if (results.length === 0) return null;
  return {
    lat: Number(results[0].lat),
    lng: Number(results[0].lon),
    label: results[0].display_name,
  };
}

async function geocode(rawQuery: string): Promise<GeocodeResult | null> {
  let query = rawQuery.trim();

  // 郵便番号(123-4567 / 1234567)は先に住所へ変換
  const zipMatch = query.replace(/[^0-9]/g, "");
  if (/^\d{3}-?\d{4}$/.test(query) && zipMatch.length === 7) {
    const addr = await zipToAddress(zipMatch);
    if (addr) query = addr;
  }

  return (await gsiSearch(query)) ?? (await nominatimSearch(query));
}

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

export default function LocationPicker({
  initialLat,
  initialLng,
}: {
  initialLat?: number | null;
  initialLng?: number | null;
}) {
  const hasInitial = initialLat != null && initialLng != null;
  const [query, setQuery] = useState("");
  const [pos, setPos] = useState<[number, number] | null>(
    hasInitial ? [initialLat, initialLng] : null,
  );
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
  const [status, setStatus] = useState<string>("");

  async function search() {
    if (!query.trim()) return;
    setStatus("検索中…");
    try {
      const result = await geocode(query);
      if (!result) {
        setStatus(
          "見つかりませんでした。表記を変えるか、地図をクリックして指定してください。",
        );
        return;
      }
      setPos([result.lat, result.lng]);
      setFlyTarget([result.lat, result.lng]);
      setStatus(`📍 ${result.label}`);
    } catch {
      setStatus("検索に失敗しました。地図をクリックして指定してください。");
    }
  }

  return (
    <div className="space-y-2">
      <span className="block text-sm font-semibold text-slate-600">
        場所(山名・住所・郵便番号で検索、または地図をクリック)
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
          placeholder="例: 高尾山 / 長野県松本市 / 100-0001"
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
          center={hasInitial ? [initialLat, initialLng] : JAPAN_CENTER}
          zoom={hasInitial ? 11 : 5}
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
