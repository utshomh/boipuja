import { Static } from "elysia";
import { eq, inArray } from "drizzle-orm";

import { BookDto } from "@boipuja/contracts";
import { authors, bookAuthors, books, db } from "@boipuja/db";

export type BookResponse = Static<typeof BookDto>;
export type BookRow = typeof books.$inferSelect;
export type AuthorRow = typeof authors.$inferSelect;

export function toBookDto(
  book: BookRow,
  authorRows: AuthorRow[],
): BookResponse {
  return {
    id: book.id,
    title: book.title,
    subtitle: book.subtitle,
    description: book.description,
    language: book.language,
    coverUrl: book.coverUrl,
    authors: authorRows.map((author) => ({
      id: author.id,
      name: author.name,
    })),
    files: [],
  } satisfies BookResponse;
}

export async function toBookDtos(bookRows: BookRow[]): Promise<BookResponse[]> {
  if (bookRows.length === 0) {
    return [];
  }

  const bookIds = bookRows.map((book) => book.id);

  const authorRows = await db
    .select({
      bookId: bookAuthors.bookId,
      author: authors,
    })
    .from(bookAuthors)
    .innerJoin(authors, eq(bookAuthors.authorId, authors.id))
    .where(inArray(bookAuthors.bookId, bookIds));

  const authorsByBookId = new Map<string, AuthorRow[]>();

  for (const row of authorRows) {
    const existingAuthors = authorsByBookId.get(row.bookId) ?? [];

    existingAuthors.push(row.author);
    authorsByBookId.set(row.bookId, existingAuthors);
  }

  return bookRows.map((book) =>
    toBookDto(book, authorsByBookId.get(book.id) ?? []),
  );
}
