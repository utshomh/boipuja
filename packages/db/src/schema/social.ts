import {
  pgTable,
  timestamp,
  integer,
  uuid,
  text,
  index,
  primaryKey,
  unique,
  varchar,
  jsonb,
} from "drizzle-orm/pg-core";

import { users } from "./users";
import { books } from "./books";
import { visibilityEnum } from "./enums";

export const follows = pgTable(
  "follows",
  {
    followerId: uuid("follower_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    followingId: uuid("following_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.followerId, table.followingId],
    }),
    followerIdIdx: index("follows_follower_id_idx").on(table.followerId),
    followingIdIdx: index("follows_following_id_idx").on(table.followingId),
  }),
);

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),

    rating: integer("rating").notNull(),

    body: text("body"),

    visibility: visibilityEnum("visibility").notNull().default("public"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    uniqueUserBookReview: unique("reviews_user_id_book_id_unique").on(
      table.userId,
      table.bookId,
    ),
    userIdIdx: index("reviews_user_id_idx").on(table.userId),
    bookIdIdx: index("reviews_book_id_idx").on(table.bookId),
  }),
);

export const activityEvents = pgTable(
  "activity_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    type: varchar("type", { length: 63 }).notNull(),

    subjectId: uuid("subject_id"),
    subjectType: varchar("subject_type", { length: 63 }),

    metadata: jsonb("metadata"),

    visibility: visibilityEnum("visibility").notNull().default("public"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdIdx: index("activity_events_user_id_idx").on(table.userId),
    createdAtIdx: index("activity_events_created_at_idx").on(table.createdAt),
    typeIdx: index("activity_events_type_idx").on(table.type),
  }),
);
