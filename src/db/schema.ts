import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const travels = sqliteTable("travels", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  departedOn: text("departed_on").notNull(),
  returnedOn: text("returned_on"),
  memo: text("memo"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

// 旅行 1件 : 国 n件。都市はさらに国ごとに n 件(JSON 配列で保持)
export const travelDestinations = sqliteTable("travel_destinations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  travelId: integer("travel_id")
    .notNull()
    .references(() => travels.id, { onDelete: "cascade" }),
  country: text("country").notNull(),
  cities: text("cities", { mode: "json" }).$type<string[]>().notNull(),
});

export const climbs = sqliteTable("climbs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  mountainName: text("mountain_name").notNull(),
  elevation: integer("elevation"),
  courseConstantMin: real("course_constant_min"),
  courseConstantMax: real("course_constant_max"),
  weather: text("weather"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  climbedOn: text("climbed_on").notNull(),
  memo: text("memo"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export type Travel = typeof travels.$inferSelect;
export type TravelDestination = typeof travelDestinations.$inferSelect;
export type Climb = typeof climbs.$inferSelect;
