import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const travels = sqliteTable("travels", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  destination: text("destination").notNull(),
  departedOn: text("departed_on").notNull(),
  returnedOn: text("returned_on"),
  memo: text("memo"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
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
export type Climb = typeof climbs.$inferSelect;
