import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { users } from "./users";

export const authSessions = pgTable(
  "auth_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    tokenHash: text("token_hash").notNull().unique(),

    expiresAt: timestamp("expires_at", {
      withTimezone: true,
    }).notNull(),

    revokedAt: timestamp("revoked_at", {
      withTimezone: true,
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("auth_sessions_user_id_idx").on(table.userId),
    index("auth_sessions_token_hash_idx").on(table.tokenHash),
    index("auth_sessions_expires_at_idx").on(table.expiresAt),
  ],
);
