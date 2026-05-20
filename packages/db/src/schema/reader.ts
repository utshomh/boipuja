import {
  pgTable,
  timestamp,
  varchar,
  uuid,
  text,
  index,
  jsonb,
} from "drizzle-orm/pg-core";

import { users } from "./users";
import { books } from "./books";
import { visibilityEnum } from "./enums";

export const highlights = pgTable(
  "highlights",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),

    locatorStart: text("locator_start").notNull(),
    locatorEnd: text("locator_end"),

    textExcerpt: text("text_excerpt"),

    color: varchar("color", { length: 31 }).notNull(),

    visibility: visibilityEnum("visibility").notNull().default("private"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdIdx: index("highlights_user_id_idx").on(table.userId),
    bookIdIdx: index("highlights_book_id_idx").on(table.bookId),
  }),
);

export const notes = pgTable(
  "notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),

    highlightId: uuid("highlight_id").references(() => highlights.id, {
      onDelete: "cascade",
    }),

    locator: text("locator"),

    body: text("body").notNull(),

    visibility: visibilityEnum("visibility").notNull().default("private"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdIdx: index("notes_user_id_idx").on(table.userId),
    bookIdIdx: index("notes_book_id_idx").on(table.bookId),
    highlightIdIdx: index("notes_highlight_id_idx").on(table.highlightId),
  }),
);

export const bookmarks = pgTable(
  "bookmarks",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),

    locator: jsonb("locator").notNull(),

    label: varchar("label", { length: 127 }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdIdx: index("bookmarks_user_id_idx").on(table.userId),
    bookIdIdx: index("bookmarks_book_id_idx").on(table.bookId),
  }),
);
