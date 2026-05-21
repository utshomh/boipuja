import {
  pgTable,
  primaryKey,
  timestamp,
  varchar,
  index,
  uuid,
  text,
} from "drizzle-orm/pg-core";

export const books = pgTable(
  "books",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    title: varchar("title", { length: 255 }).notNull(),
    subtitle: varchar("subtitle", { length: 255 }),
    description: text("description"),

    language: varchar("language", { length: 15 }).notNull(),

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
    languageIdx: index("books_language_idx").on(table.language),
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
