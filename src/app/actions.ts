"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { climbs, travels } from "@/db/schema";

function travelValues(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const destination = String(formData.get("destination") ?? "").trim();
  let departedOn = String(formData.get("departedOn") ?? "").trim();
  let returnedOn = String(formData.get("returnedOn") ?? "").trim();
  const memo = String(formData.get("memo") ?? "").trim();
  if (!title || !destination || !departedOn) return null;
  if (returnedOn && returnedOn < departedOn) {
    [departedOn, returnedOn] = [returnedOn, departedOn];
  }
  return {
    title,
    destination,
    departedOn,
    returnedOn: returnedOn || null,
    memo: memo || null,
  };
}

export async function addTravel(formData: FormData) {
  const values = travelValues(formData);
  if (!values) return;
  await db.insert(travels).values(values);
  revalidatePath("/travels");
}

export async function updateTravel(formData: FormData) {
  const id = Number(formData.get("id"));
  const values = travelValues(formData);
  if (!Number.isInteger(id) || !values) return;
  await db.update(travels).set(values).where(eq(travels.id, id));
  revalidatePath("/travels");
  redirect("/travels");
}

export async function deleteTravel(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;
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
