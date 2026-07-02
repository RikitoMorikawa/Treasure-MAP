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
  const mountainName = String(formData.get("mountainName") ?? "").trim();
  const elevationRaw = String(formData.get("elevation") ?? "").trim();
  const climbedOn = String(formData.get("climbedOn") ?? "").trim();
  const memo = String(formData.get("memo") ?? "").trim();

  if (!mountainName || !climbedOn) return;

  const elevation = elevationRaw ? Number(elevationRaw) : null;

  await db.insert(climbs).values({
    mountainName,
    elevation: Number.isFinite(elevation as number) ? elevation : null,
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
