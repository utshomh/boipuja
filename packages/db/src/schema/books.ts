import {
  pgTable,
  timestamp,
  varchar,
  integer,
  uuid,
  text,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";

import { bookFormatEnum } from "./enums";

export const books = pgTable(
  "books",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    title: varchar("title", { length: 255 }).notNull(),
    subtitle: varchar("subtitle", { length: 255 }),
    description: text("description"),

    language: varchar("language", { length: 15 }),
    canonicalIsbn: varchar("canonical_isbn", { length: 31 }).unique(),

    coverUrl: varchar("cover_url", { length: 255 }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    titleIdx: index("books_title_idx").on(table.title),
    canonicalIsbnIdx: index("books_canonical_isbn_idx").on(table.canonicalIsbn),
  }),
);

export const authors = pgTable(
  "authors",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    name: varchar("name", { length: 127 }).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    nameIdx: index("authors_name_idx").on(table.name),
  }),
);

export const bookAuthors = pgTable(
  "book_authors",
  {
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),

    authorId: uuid("author_id")
      .notNull()
      .references(() => authors.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.bookId, table.authorId],
    }),
  }),
);

export const editions = pgTable(
  "editions",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),

    isbn10: varchar("isbn_10", { length: 15 }).unique(),
    isbn13: varchar("isbn_13", { length: 15 }).unique(),

    publisher: varchar("publisher", { length: 255 }),
    publishedYear: integer("published_year"),

    pageCount: integer("page_count"),

    format: bookFormatEnum("format").notNull().default("other"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    bookIdIdx: index("editions_book_id_idx").on(table.bookId),
    isbn10Idx: index("editions_isbn_10_idx").on(table.isbn10),
    isbn13Idx: index("editions_isbn_13_idx").on(table.isbn13),
  }),
);
