"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  cities,
  climbs,
  countries,
  travelDestinations,
  travels,
} from "@/db/schema";

function travelValues(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  let departedOn = String(formData.get("departedOn") ?? "").trim();
  let returnedOn = String(formData.get("returnedOn") ?? "").trim();
  const memo = String(formData.get("memo") ?? "").trim();
  if (!title || !departedOn) return null;
  if (returnedOn && returnedOn < departedOn) {
    [departedOn, returnedOn] = [returnedOn, departedOn];
  }
  return {
    title,
    departedOn,
    returnedOn: returnedOn || null,
    memo: memo || null,
  };
}

// hidden input "destinations" の JSON。1行 = 1行き先(国+都市1つ)。
// 既存マスターは id、新規は name で指定する。lat/lng は新規都市を
// フォーム上の地図で確認した場合のみ入る(入っていれば再ジオコーディングしない)
// [{ countryId?, countryName?, cityId?, cityName?, lat?, lng?, arrivedOn, leftOn }]
function parseDestinations(formData: FormData) {
  const date = (v: unknown) => {
    const s = String(v ?? "").trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
  };
  const num = (v: unknown) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  try {
    const raw = JSON.parse(String(formData.get("destinations") ?? "[]"));
    if (!Array.isArray(raw)) return [];
    return raw
      .map((d) => ({
        countryId: d?.countryId != null ? num(d.countryId) : null,
        countryName: String(d?.countryName ?? "").trim(),
        cityId: d?.cityId != null ? num(d.cityId) : null,
        cityName: String(d?.cityName ?? "").trim(),
        lat: d?.lat != null ? num(d.lat) : null,
        lng: d?.lng != null ? num(d.lng) : null,
        arrivedOn: date(d?.arrivedOn),
        leftOn: date(d?.leftOn),
      }))
      .filter((d) => d.countryId != null || d.countryName);
  } catch {
    return [];
  }
}

// マスターを解決(なければ作成)して travel_destinations 用の行を返す
async function resolveDestinations(
  dests: ReturnType<typeof parseDestinations>,
) {
  const out: {
    countryId: number;
    cityId: number | null;
    arrivedOn: string | null;
    leftOn: string | null;
  }[] = [];

  for (const d of dests) {
    // 国の解決
    let countryId = d.countryId;
    let countryName = d.countryName;
    if (countryId != null) {
      const [row] = await db
        .select()
        .from(countries)
        .where(eq(countries.id, countryId));
      if (!row) continue;
      countryName = row.name;
    } else {
      const [existing] = await db
        .select()
        .from(countries)
        .where(eq(countries.name, countryName));
      if (existing) {
        countryId = existing.id;
      } else {
        const coords = await geocodeDestination(countryName);
        const [row] = await db
          .insert(countries)
          .values({
            name: countryName,
            latitude: coords?.latitude ?? null,
            longitude: coords?.longitude ?? null,
          })
          .returning({ id: countries.id });
        countryId = row.id;
      }
    }

    // 都市の解決(未指定なら国のみの行き先)
    let cityId = d.cityId;
    if (cityId == null && d.cityName) {
      const [existing] = await db
        .select()
        .from(cities)
        .where(
          and(eq(cities.countryId, countryId), eq(cities.name, d.cityName)),
        );
      if (existing) {
        cityId = existing.id;
      } else {
        const coords =
          d.lat != null && d.lng != null
            ? { latitude: d.lat, longitude: d.lng }
            : await geocodeDestination(countryName, d.cityName);
        const [row] = await db
          .insert(cities)
          .values({
            countryId,
            name: d.cityName,
            latitude: coords?.latitude ?? null,
            longitude: coords?.longitude ?? null,
          })
          .returning({ id: cities.id });
        cityId = row.id;
      }
    }

    out.push({
      countryId,
      cityId: cityId ?? null,
      arrivedOn: d.arrivedOn,
      leftOn: d.leftOn,
    });
  }
  return out;
}

// 国・都市名から座標を取得(世界対応のため Nominatim を使用)。
// 単一のクエリ方式では「同名の店舗にマッチ」「日本語名未登録で見つからない」等の
// 取りこぼしがあるため、複数方式を順に試し、結果は必ず
// 「display_name に入力した国名を含む」「店舗等の POI でない」ことを検証する。
type GeoHit = { lat: string; lon: string; display_name: string; class: string };

const POI_CLASSES = new Set([
  "amenity",
  "shop",
  "tourism",
  "leisure",
  "office",
  "craft",
]);

async function nominatimSearch(params: string): Promise<GeoHit[]> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=5&accept-language=ja&${params}`,
      { headers: { "User-Agent": "treasure-map-personal-app" } },
    );
    const json = await res.json();
    return Array.isArray(json) ? json : [];
  } catch {
    return [];
  }
}

// checkCountry: フリーテキスト検索では「同名の別国の場所」を弾くために
// display_name に入力国名が含まれるか検証する。構造化クエリ(city=&country=)は
// Nominatim 側で国が絞られる上、正式国名(例: 韓国→大韓民国)と表記が
// 一致しないことがあるので検証しない。
function pickHit(results: GeoHit[], country: string, checkCountry: boolean) {
  const hit = results.find(
    (h) =>
      (!checkCountry || h.display_name.includes(country)) &&
      !POI_CLASSES.has(h.class),
  );
  return hit ? { latitude: Number(hit.lat), longitude: Number(hit.lon) } : null;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchJson(url: string) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "treasure-map-personal-app" },
    });
    return await res.json();
  } catch {
    return null;
  }
}

const WIKIDATA_API = "https://www.wikidata.org/w/api.php";

async function wikidataEntityId(name: string): Promise<string | null> {
  const json = await fetchJson(
    `${WIKIDATA_API}?action=wbsearchentities&format=json&language=ja&limit=1&search=${encodeURIComponent(name)}`,
  );
  return json?.search?.[0]?.id ?? null;
}

// OSM に日本語名が未登録の都市向けフォールバック。
// 同名の別国の場所(例: フロリダ→ウルグアイの都市)を避けるため、
// エンティティの国(P17)が入力国と一致するかを照合する。
async function wikidataCity(
  city: string,
  country: string,
): Promise<{ latitude: number; longitude: number } | null> {
  const cityId = await wikidataEntityId(city);
  if (!cityId) return null;
  await sleep(500);
  const entJson = await fetchJson(
    `${WIKIDATA_API}?action=wbgetentities&format=json&props=claims&ids=${cityId}`,
  );
  const claims = entJson?.entities?.[cityId]?.claims;
  const coord = claims?.P625?.[0]?.mainsnak?.datavalue?.value;
  if (!coord) return null;
  const cityCountryId = claims?.P17?.[0]?.mainsnak?.datavalue?.value?.id;
  await sleep(500);
  const countryId = await wikidataEntityId(country);
  if (cityCountryId && countryId && cityCountryId !== countryId) return null;
  return { latitude: coord.latitude, longitude: coord.longitude };
}

async function geocodeDestination(
  country: string,
  city?: string,
): Promise<{ latitude: number; longitude: number } | null> {
  const enc = encodeURIComponent;
  const attempts = city
    ? [
        { params: `layer=address&q=${enc(`${city}, ${country}`)}`, check: true },
        { params: `layer=address&q=${enc(city)}`, check: true },
        { params: `city=${enc(city)}&country=${enc(country)}`, check: false },
      ]
    : [
        { params: `layer=address&q=${enc(country)}`, check: true },
        { params: `country=${enc(country)}`, check: false },
      ];

  for (let i = 0; i < attempts.length; i++) {
    if (i > 0) await sleep(1000); // Nominatim のレート制限(1req/秒)を守る
    const hit = pickHit(
      await nominatimSearch(attempts[i].params),
      country,
      attempts[i].check,
    );
    if (hit) return hit;
  }

  if (city) {
    // Nominatim で見つからない都市は Wikidata で解決を試みる
    const wd = await wikidataCity(city, country);
    if (wd) return wd;
    // それでも駄目なら国の座標にフォールバック
    await sleep(1000);
    return geocodeDestination(country);
  }
  return null;
}

export async function addTravel(formData: FormData) {
  const values = travelValues(formData);
  const dests = parseDestinations(formData);
  if (!values || dests.length === 0) return;
  const resolved = await resolveDestinations(dests);
  if (resolved.length === 0) return;
  const [row] = await db
    .insert(travels)
    .values(values)
    .returning({ id: travels.id });
  await db
    .insert(travelDestinations)
    .values(resolved.map((d) => ({ ...d, travelId: row.id })));
  revalidatePath("/travels");
}

export async function updateTravel(formData: FormData) {
  const id = Number(formData.get("id"));
  const values = travelValues(formData);
  const dests = parseDestinations(formData);
  if (!Number.isInteger(id) || !values || dests.length === 0) return;
  const resolved = await resolveDestinations(dests);
  if (resolved.length === 0) return;
  await db.update(travels).set(values).where(eq(travels.id, id));
  await db
    .delete(travelDestinations)
    .where(eq(travelDestinations.travelId, id));
  await db
    .insert(travelDestinations)
    .values(resolved.map((d) => ({ ...d, travelId: id })));
  revalidatePath("/travels");
  redirect("/travels");
}

export async function deleteTravel(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;
  await db
    .delete(travelDestinations)
    .where(eq(travelDestinations.travelId, id));
  await db.delete(travels).where(eq(travels.id, id));
  revalidatePath("/travels");
}

function climbValues(formData: FormData) {
  const num = (name: string) => {
    const raw = String(formData.get(name) ?? "").trim();
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  };

  const mountainName = String(formData.get("mountainName") ?? "").trim();
  const climbedOn = String(formData.get("climbedOn") ?? "").trim();
  const weather = String(formData.get("weather") ?? "").trim();
  const memo = String(formData.get("memo") ?? "").trim();

  if (!mountainName || !climbedOn) return null;

  let ccMin = num("courseConstantMin");
  let ccMax = num("courseConstantMax");
  if (ccMin != null && ccMax != null && ccMax < ccMin) {
    [ccMin, ccMax] = [ccMax, ccMin];
  }

  return {
    mountainName,
    elevation: num("elevation"),
    courseConstantMin: ccMin,
    courseConstantMax: ccMax,
    weather: weather || null,
    latitude: num("latitude"),
    longitude: num("longitude"),
    climbedOn,
    memo: memo || null,
  };
}

export async function addClimb(formData: FormData) {
  const values = climbValues(formData);
  if (!values) return;
  await db.insert(climbs).values(values);
  revalidatePath("/climbs");
}

export async function updateClimb(formData: FormData) {
  const id = Number(formData.get("id"));
  const values = climbValues(formData);
  if (!Number.isInteger(id) || !values) return;
  await db.update(climbs).set(values).where(eq(climbs.id, id));
  revalidatePath("/climbs");
  redirect("/climbs");
}

export async function deleteClimb(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;
  await db.delete(climbs).where(eq(climbs.id, id));
  revalidatePath("/climbs");
}
