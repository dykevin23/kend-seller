import { pgTable, uuid } from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  profile_id: uuid().primaryKey(),
});
