import { asc } from "drizzle-orm";
import { db } from "@/db";
import { cities, countries } from "@/db/schema";

// フォームのコンボボックス用マスター(国 → 都市)
export async function getMasters() {
  const countryRows = await db
    .select()
    .from(countries)
    .orderBy(asc(countries.name));
  const cityRows = await db.select().from(cities).orderBy(asc(cities.name));
  return countryRows.map((co) => ({
    id: co.id,
    name: co.name,
    cities: cityRows
      .filter((ci) => ci.countryId === co.id)
      .map((ci) => ({ id: ci.id, name: ci.name })),
  }));
}
