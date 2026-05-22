import { Elysia, t, type Static } from "elysia";
import { desc, eq, inArray } from "drizzle-orm";

import { db, userBooks } from "@boipuja/db";
import { authors, bookAuthors, books } from "@boipuja/db/schema";
import {
  BookDto,
  CreateBookBody,
  ErrorDto,
  UuidString,
} from "@boipuja/contracts";

import { notFound } from "../http";
import { authPlugin } from "../auth/plugin";
import { AuthorRow, BookResponse, toBookDto } from "../mappers/books";
import {
  normalizeBookText,
  normalizeOptionalBookText,
} from "../utils/normalizers";

async function getOrCreateAuthor(name: string) {
  const normalizedName = normalizeBookText(name);

  const [existingAuthor] = await db
    .select()
    .from(authors)
    .where(eq(authors.name, normalizedName))
    .limit(1);

  if (existingAuthor) {
    return existingAuthor;
  }

  const [createdAuthor] = await db
    .insert(authors)
    .values({
      name: normalizedName,
    })
    .returning();

  return createdAuthor;
}

async function getAuthorsForBook(bookId: string) {
  const rows = await db
    .select({
      author: authors,
    })
    .from(bookAuthors)
    .innerJoin(authors, eq(bookAuthors.authorId, authors.id))
    .where(eq(bookAuthors.bookId, bookId));

  return rows.map((row) => row.author);
}

async function getBookById(bookId: string): Promise<BookResponse | null> {
  const [book] = await db
    .select()
    .from(books)
    .where(eq(books.id, bookId))
    .limit(1);

  if (!book) {
    return null;
  }

  const authorRows = await getAuthorsForBook(book.id);

  return toBookDto(book, authorRows);
}

async function listBooks(): Promise<BookResponse[]> {
  const bookRows = await db.select().from(books).orderBy(desc(books.createdAt));

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

export const booksRoutes = new Elysia({ prefix: "/books" })
  .use(authPlugin)
  .post(
    "/",
    async ({ body, user, status }) => {
      const title = normalizeBookText(body.title);
      const authorNames = [
        ...new Set(
          body.authors.map((authorName) => normalizeBookText(authorName)),
        ),
      ];

      return await db.transaction(async (tx) => {
        const [createdBook] = await db
          .insert(books)
          .values({
            title,
            subtitle: normalizeOptionalBookText(body.subtitle),
            description: normalizeOptionalBookText(body.description),
            language: normalizeBookText(body.language),
            coverUrl: body.coverUrl ?? null,
          })
          .returning();

        const authorRows = await Promise.all(
          authorNames.map((authorName) => getOrCreateAuthor(authorName)),
        );

        await db.insert(bookAuthors).values(
          authorRows.map((author) => ({
            bookId: createdBook.id,
            authorId: author.id,
          })),
        );

        await db.insert(userBooks).values({
          userId: user.id,
          bookId: createdBook.id,
        });

        const response = toBookDto(createdBook, authorRows);

        return status(201, response);
      });
    },
    {
      requireAuth: true,
      body: CreateBookBody,
      response: {
        201: BookDto,
        401: ErrorDto,
      },
      detail: {
        tags: ["Books"],
        summary: "Create book",
        description: "Creates a book record and attaches one or more authors.",
      },
    },
  )
  .get(
    "/",
    async () => {
      return listBooks();
    },
    {
      response: {
        200: t.Array(BookDto),
      },
      detail: {
        tags: ["Books"],
        summary: "List books",
        description: "Returns all books with their authors.",
      },
    },
  )
  .get(
    "/:id",
    async ({ params, status }) => {
      const book = await getBookById(params.id);

      if (!book) {
        return status(404, notFound("Book not found."));
      }

      return book;
    },
    {
      params: t.Object({
        id: UuidString,
      }),
      response: {
        200: BookDto,
        404: ErrorDto,
      },
      detail: {
        tags: ["Books"],
        summary: "Get book",
        description: "Returns one book by ID.",
      },
    },
  );
