import { Elysia, t, type Static } from "elysia";
import {
  and,
  countDistinct,
  desc,
  eq,
  ilike,
  inArray,
  or,
  type SQL,
} from "drizzle-orm";

import { db, userBooks } from "@boipuja/db";
import { authors, bookAuthors, books } from "@boipuja/db/schema";
import {
  BookDto,
  BooksSearchResponseDto,
  CreateBookBody,
  ErrorDto,
  SearchBooksQuery,
  UuidString,
} from "@boipuja/contracts";

import { notFound } from "../http";
import { authPlugin } from "../auth/plugin";
import {
  normalizeBookText,
  normalizeOptionalBookText,
} from "../utils/normalizers";
import {
  AuthorRow,
  BookResponse,
  toBookDto,
  toBookDtos,
} from "../mappers/books";

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

async function searchBooks(input: Static<typeof SearchBooksQuery>) {
  const page = input.page ?? 1;
  const limit = input.limit ?? 10;
  const offset = (page - 1) * limit;

  const filters: SQL[] = [];

  const normalizedQuery = normalizeOptionalBookText(input.query);
  const normalizedLanguage = normalizeOptionalBookText(input.language);

  if (normalizedQuery) {
    const pattern = `%${normalizedQuery}%`;

    const searchFilter = or(
      ilike(books.title, pattern),
      ilike(books.subtitle, pattern),
      ilike(authors.name, pattern),
    );

    if (searchFilter) {
      filters.push(searchFilter);
    }
  }

  if (normalizedLanguage) {
    filters.push(eq(books.language, normalizedLanguage));
  }

  const where = filters.length > 0 ? and(...filters) : undefined;

  const [countRow] = await db
    .select({
      total: countDistinct(books.id),
    })
    .from(books)
    .leftJoin(bookAuthors, eq(bookAuthors.bookId, books.id))
    .leftJoin(authors, eq(authors.id, bookAuthors.authorId))
    .where(where);

  const rows = await db
    .selectDistinct({
      book: books,
    })
    .from(books)
    .leftJoin(bookAuthors, eq(bookAuthors.bookId, books.id))
    .leftJoin(authors, eq(authors.id, bookAuthors.authorId))
    .where(where)
    .orderBy(desc(books.createdAt))
    .limit(limit)
    .offset(offset);

  const total = Number(countRow?.total ?? 0);
  const bookRows = rows.map((row) => row.book);
  const items = await toBookDtos(bookRows);

  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
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
        const [createdBook] = await tx
          .insert(books)
          .values({
            title,
            subtitle: normalizeOptionalBookText(body.subtitle),
            description: normalizeOptionalBookText(body.description),
            language: normalizeBookText(body.language),
            coverUrl: normalizeOptionalBookText(body.coverUrl),
          })
          .returning();

        const authorRows = await Promise.all(
          authorNames.map(async (authorName) => {
            const [createdAuthor] = await tx
              .insert(authors)
              .values({
                name: authorName,
              })
              .onConflictDoNothing()
              .returning();

            if (createdAuthor) return createdAuthor;

            const [existingAuthor] = await tx
              .select()
              .from(authors)
              .where(eq(authors.name, authorName))
              .limit(1);

            if (!existingAuthor)
              throw new Error(
                `Author could not be created or found: ${authorName}`,
              );

            return existingAuthor;
          }),
        );

        await tx.insert(bookAuthors).values(
          authorRows.map((author) => ({
            bookId: createdBook.id,
            authorId: author.id,
          })),
        );

        await tx.insert(userBooks).values({
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
    "/search",
    async ({ query }) => {
      return searchBooks({
        query: query.query,
        language: query.language,
        page: query.page,
        limit: query.limit,
      });
    },
    {
      query: SearchBooksQuery,
      response: {
        200: BooksSearchResponseDto,
      },
      detail: {
        tags: ["Books"],
        summary: "Search books",
        description:
          "Searches books by title, subtitle, author name, and language.",
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
