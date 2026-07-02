"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type ClimbPin = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  climbedOn: string;
  elevation: number | null;
};

const mountainIcon = L.divIcon({
  html: '<div style="font-size:26px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,.4))">📍</div>',
  className: "",
  iconSize: [26, 26],
  iconAnchor: [13, 26],
  popupAnchor: [0, -24],
});

const JAPAN_CENTER: [number, number] = [37.5, 137.5];

export default function ClimbMap({ pins }: { pins: ClimbPin[] }) {
  return (
    <MapContainer
      center={JAPAN_CENTER}
      zoom={5}
      scrollWheelZoom
      className="z-0 h-80 w-full rounded-2xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pins.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lng]} icon={mountainIcon}>
          <Popup>
            <b>⛰️ {p.name}</b>
            <br />
            🗓 {p.climbedOn}
            {p.elevation != null && (
              <>
                <br />⛰ {p.elevation.toLocaleString()} m
              </>
            )}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
