import {
  pgTable,
  primaryKey,
  timestamp,
  varchar,
  integer,
  numeric,
  unique,
  index,
  jsonb,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./users";
import { files } from "./files";
import { books } from "./books";
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

    status: readingStatusEnum("status").notNull().default("want_to_read"),

    rating: integer("rating"),

    progressPercent: numeric("progress_percent", {
      precision: 5,
      scale: 2,
    })
      .notNull()
      .default("0"),

    currentLocator: jsonb("current_locator"),

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

export const bookFiles = pgTable(
  "book_files",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),

    fileId: uuid("file_id")
      .notNull()
      .references(() => files.id, { onDelete: "cascade" }),

    uploadedByUserId: uuid("uploaded_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    label: varchar("label", { length: 127 }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    uniqueBookFile: unique("book_files_book_id_file_id_unique").on(
      table.bookId,
      table.fileId,
    ),
    bookIdIdx: index("book_files_book_id_idx").on(table.bookId),
    fileIdIdx: index("book_files_file_id_idx").on(table.fileId),
    uploadedByUserIdIdx: index("book_files_uploaded_by_user_id_idx").on(
      table.uploadedByUserId,
    ),
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
    nameIdx: index("name_idx").on(table.name),
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
