import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const travels = sqliteTable("travels", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  destination: text("destination").notNull(),
  visitedOn: text("visited_on").notNull(),
  memo: text("memo"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const climbs = sqliteTable("climbs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  mountainName: text("mountain_name").notNull(),
  elevation: integer("elevation"),
  courseConstant: real("course_constant"),
  climbedOn: text("climbed_on").notNull(),
  memo: text("memo"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export type Travel = typeof travels.$inferSelect;
export type Climb = typeof climbs.$inferSelect;
