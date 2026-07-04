"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type RouteStop = {
  id: number;
  country: string;
  cities: string[];
  lat: number;
  lng: number;
  arrivedOn: string | null;
  leftOn: string | null;
  urls: string[];
};

function urlHost(u: string) {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
}

export type TravelRoute = {
  travelId: number;
  title: string;
  stops: RouteStop[];
};

const COLORS = [
  "#0284c7", // sky-600
  "#7c3aed", // violet-600
  "#ea580c", // orange-600
  "#059669", // emerald-600
  "#db2777", // pink-600
  "#ca8a04", // yellow-600
];

// ラベルは "1" だけでなく、同じ場所を複数回訪れた場合の "1・4" にも対応
function numberIcon(label: string, color: string) {
  return L.divIcon({
    html: `<div style="transform:translate(-50%,-50%);display:inline-flex;align-items:center;justify-content:center;min-width:24px;height:24px;padding:0 7px;border-radius:9999px;background:${color};color:#fff;font-size:12px;font-weight:700;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.4);white-space:nowrap">${label}</div>`,
    className: "",
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -14],
  });
}

// 表示中の全ピンがちょうど収まる位置・ズームに合わせる
function FitToStops({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length === 1) {
      map.setView(positions[0], 8);
    } else if (positions.length > 1) {
      map.fitBounds(L.latLngBounds(positions), { padding: [40, 40] });
    }
    // 初期表示時に一度だけ合わせる(手動操作を上書きしない)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);
  return null;
}

export type MapFocus = { seq: number; positions: [number, number][] };

// 国チップのクリック等で指定された範囲へズームする(seq が変わるたびに実行)
function FocusOn({ focus }: { focus: MapFocus | null }) {
  const map = useMap();
  useEffect(() => {
    if (!focus || focus.positions.length === 0) return;
    if (focus.positions.length === 1) {
      map.flyTo(focus.positions[0], 6);
    } else {
      map.flyToBounds(L.latLngBounds(focus.positions), { padding: [40, 40] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus?.seq]);
  return null;
}

export default function TravelRouteMap({
  routes,
  fitToStops = false,
  focus = null,
}: {
  routes: TravelRoute[];
  fitToStops?: boolean;
  focus?: MapFocus | null;
}) {
  const allPositions = routes.flatMap((r) =>
    r.stops.map((s) => [s.lat, s.lng] as [number, number]),
  );
  return (
    <MapContainer
      center={[30, 90]}
      zoom={2}
      scrollWheelZoom
      className="z-0 h-96 w-full rounded-2xl"
    >
      {fitToStops && allPositions.length > 0 && (
        <FitToStops positions={allPositions} />
      )}
      <FocusOn focus={focus} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {routes.map((route, ri) => {
        const color = COLORS[ri % COLORS.length];
        const positions = route.stops.map(
          (s) => [s.lat, s.lng] as [number, number],
        );
        // 同一座標の訪問をまとめて「1・4」のような1つのピンにする
        const grouped = new Map<
          string,
          { stop: RouteStop; order: number }[]
        >();
        route.stops.forEach((s, si) => {
          const key = `${s.lat},${s.lng}`;
          const list = grouped.get(key) ?? [];
          list.push({ stop: s, order: si + 1 });
          grouped.set(key, list);
        });
        return (
          <div key={route.travelId}>
            {positions.length >= 2 && (
              <Polyline
                positions={positions}
                pathOptions={{ color, weight: 3, dashArray: "6 6" }}
              />
            )}
            {[...grouped.values()].map((visits) => {
              const { stop } = visits[0];
              const label = visits.map((v) => v.order).join("・");
              return (
                <Marker
                  key={stop.id}
                  position={[stop.lat, stop.lng]}
                  icon={numberIcon(label, color)}
                >
                  <Popup>
                    <b>✈️ {route.title}</b>
                    {visits.map(({ stop: s, order }) => (
                      <span key={s.id}>
                        <br />
                        {order}. {s.country}
                        {s.cities.length > 0 && `(${s.cities.join("、")})`}
                        {(s.arrivedOn || s.leftOn) && (
                          <>
                            <br />
                            　🛬 {s.arrivedOn ?? "?"} → 🛫 {s.leftOn ?? "?"}
                          </>
                        )}
                        {s.urls.map((u, ui) => (
                          <span key={ui}>
                            <br />
                            　🏨{" "}
                            <a
                              href={u}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {urlHost(u)}
                            </a>
                          </span>
                        ))}
                      </span>
                    ))}
                  </Popup>
                </Marker>
              );
            })}
          </div>
        );
      })}
    </MapContainer>
  );
}
