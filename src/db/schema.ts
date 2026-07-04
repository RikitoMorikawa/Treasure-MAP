import {
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
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

// 航空券のリンク(旅行に紐づく)。flown_on は搭乗日(移動日)
export const flights = sqliteTable("flights", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  travelId: integer("travel_id")
    .notNull()
    .references(() => travels.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  flownOn: text("flown_on"),
  // 到着日(深夜便など日をまたぐ場合。同日なら null)
  flownUntil: text("flown_until"),
  sortOrder: integer("sort_order").notNull().default(0),
});

// 国マスター。座標は国の代表点(都市未指定の行き先のピンに使う)
export const countries = sqliteTable("countries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  latitude: real("latitude"),
  longitude: real("longitude"),
});

// 都市マスター。一度確定した座標を使い回すことでジオコーディングのブレを防ぐ
export const cities = sqliteTable(
  "cities",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    countryId: integer("country_id")
      .notNull()
      .references(() => countries.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    latitude: real("latitude"),
    longitude: real("longitude"),
  },
  (t) => [uniqueIndex("cities_country_name").on(t.countryId, t.name)],
);

// 旅行 1件 : 行き先 n件(1行 = 1都市。都市未指定なら国のみ)
export const travelDestinations = sqliteTable("travel_destinations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  travelId: integer("travel_id")
    .notNull()
    .references(() => travels.id, { onDelete: "cascade" }),
  countryId: integer("country_id")
    .notNull()
    .references(() => countries.id),
  cityId: integer("city_id").references(() => cities.id),
  sortOrder: integer("sort_order").notNull().default(0),
  arrivedOn: text("arrived_on"),
  leftOn: text("left_on"),
});

// 宿泊ホテルなどのリンク(行き先に紐づく)。宿泊期間付き
export const hotels = sqliteTable("hotels", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  destinationId: integer("destination_id")
    .notNull()
    .references(() => travelDestinations.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  checkinOn: text("checkin_on"),
  checkoutOn: text("checkout_on"),
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
export type Country = typeof countries.$inferSelect;
export type City = typeof cities.$inferSelect;
export type Flight = typeof flights.$inferSelect;
export type Hotel = typeof hotels.$inferSelect;
export type Climb = typeof climbs.$inferSelect;
