import {
  pgTable,
  timestamp,
  varchar,
  integer,
  uuid,
  index,
} from "drizzle-orm/pg-core";

import { users } from "./users";
import { filePurposeEnum, visibilityEnum } from "./enums";

export const files = pgTable(
  "files",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    ownerUserId: uuid("owner_user_id").references(() => users.id, {
      onDelete: "set null",
    }),

    key: varchar("key", { length: 255 }).notNull(),
    url: varchar("url", { length: 512 }).notNull(),

    contentType: varchar("content_type", { length: 127 }).notNull(),
    sizeBytes: integer("size_bytes"),

    purpose: filePurposeEnum("purpose").notNull(),

    visibility: visibilityEnum("visibility").notNull().default("public"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    ownerUserIdIdx: index("files_owner_user_id_idx").on(table.ownerUserId),
    purposeIdx: index("files_purpose_idx").on(table.purpose),
  }),
);
