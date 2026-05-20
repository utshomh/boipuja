import {
  pgTable,
  timestamp,
  varchar,
  integer,
  numeric,
  uuid,
  text,
  index,
  primaryKey,
  unique,
} from "drizzle-orm/pg-core";

import { users } from "./users";
import { books, editions } from "./books";
import { readingStatusEnum, visibilityEnum } from "./enums";

export const userBooks = pgTable(
  "user_books",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),

    editionId: uuid("edition_id").references(() => editions.id, {
      onDelete: "set null",
    }),

    status: readingStatusEnum("status").notNull().default("want_to_read"),

    rating: integer("rating"),

    progressPercent: numeric("progress_percent", {
      precision: 5,
      scale: 2,
    })
      .notNull()
      .default("0"),

    currentLocator: text("current_locator"),

    visibility: visibilityEnum("visibility").notNull().default("private"),

    startedAt: timestamp("started_at", { withTimezone: true }),
    finishedAt: timestamp("finished_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    uniqueUserBook: unique("user_books_user_id_book_id_unique").on(
      table.userId,
      table.bookId,
    ),
    userIdIdx: index("user_books_user_id_idx").on(table.userId),
    bookIdIdx: index("user_books_book_id_idx").on(table.bookId),
    statusIdx: index("user_books_status_idx").on(table.status),
  }),
);

export const shelves = pgTable(
  "shelves",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    name: varchar("name", { length: 63 }).notNull(),

    visibility: visibilityEnum("visibility").notNull().default("private"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    uniqueUserShelfName: unique("shelves_user_id_name_unique").on(
      table.userId,
      table.name,
    ),
    userIdIdx: index("shelves_user_id_idx").on(table.userId),
  }),
);

export const shelfBooks = pgTable(
  "shelf_books",
  {
    shelfId: uuid("shelf_id")
      .notNull()
      .references(() => shelves.id, { onDelete: "cascade" }),

    userBookId: uuid("user_book_id")
      .notNull()
      .references(() => userBooks.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.shelfId, table.userBookId],
    }),
    shelfIdIdx: index("shelf_books_shelf_id_idx").on(table.shelfId),
    userBookIdIdx: index("shelf_books_user_book_id_idx").on(table.userBookId),
  }),
);
