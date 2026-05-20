import {
  pgTable,
  timestamp,
  boolean,
  varchar,
  uuid,
  text,
  index,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    email: varchar("email", { length: 127 }).notNull().unique(),
    username: varchar("username", { length: 63 }).notNull().unique(),

    displayName: varchar("display_name", { length: 127 }).notNull(),
    avatarUrl: varchar("avatar_url", { length: 255 }),

    passwordHash: varchar("password_hash", { length: 255 }).notNull(),

    bio: text("bio"),

    emailVerified: boolean("email_verified").notNull().default(false),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    emailIdx: index("users_email_idx").on(table.email),
    usernameIdx: index("users_username_idx").on(table.username),
  }),
);
