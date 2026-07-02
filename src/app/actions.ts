"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { climbs, travels } from "@/db/schema";

export async function addTravel(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const destination = String(formData.get("destination") ?? "").trim();
  const visitedOn = String(formData.get("visitedOn") ?? "").trim();
  const memo = String(formData.get("memo") ?? "").trim();

  if (!title || !destination || !visitedOn) return;

  await db.insert(travels).values({
    title,
    destination,
    visitedOn,
    memo: memo || null,
  });
  revalidatePath("/travels");
}

export async function deleteTravel(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;
  await db.delete(travels).where(eq(travels.id, id));
  revalidatePath("/travels");
}

export async function addClimb(formData: FormData) {
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

  if (!mountainName || !climbedOn) return;

  let ccMin = num("courseConstantMin");
  let ccMax = num("courseConstantMax");
  if (ccMin != null && ccMax != null && ccMax < ccMin) {
    [ccMin, ccMax] = [ccMax, ccMin];
  }

  await db.insert(climbs).values({
    mountainName,
    elevation: num("elevation"),
    courseConstantMin: ccMin,
    courseConstantMax: ccMax,
    weather: weather || null,
    latitude: num("latitude"),
    longitude: num("longitude"),
    climbedOn,
    memo: memo || null,
  });
  revalidatePath("/climbs");
}

export async function deleteClimb(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;
  await db.delete(climbs).where(eq(climbs.id, id));
  revalidatePath("/climbs");
}
