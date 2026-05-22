import { Static } from "elysia";

import { BookDto } from "@boipuja/contracts";
import { authors, books } from "@boipuja/db";

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
