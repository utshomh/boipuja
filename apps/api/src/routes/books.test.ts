import type { Static } from "elysia";
import { and, eq } from "drizzle-orm";
import { describe, expect, test } from "bun:test";

import { db } from "@boipuja/db";
import { userBooks } from "@boipuja/db/schema";
import {
  AuthUserResponseDto,
  BookDto,
  BooksSearchResponseDto,
  CreateBookBody,
  ErrorDto,
} from "@boipuja/contracts";

import {
  apiV1,
  cookieHeaderFromSetCookie,
  expectData,
  expectErrorValue,
  getSetCookie,
} from "../test/eden";

type AuthUserResponse = Static<typeof AuthUserResponseDto>;
type BookResponse = Static<typeof BookDto>;
type BooksSearchResponse = Static<typeof BooksSearchResponseDto>;
type CreateBookInput = Static<typeof CreateBookBody>;
type ErrorResponse = Static<typeof ErrorDto>;

function uniqueSuffix() {
  return crypto.randomUUID().slice(0, 8);
}

async function registerTestUser() {
  const unique = uniqueSuffix();

  const input = {
    email: `book-test-${unique}@example.com`,
    username: `book_test_${unique}`,
    displayName: "Book Test User",
    password: "password123",
  };

  const result = await apiV1.auth.register.post(input);

  expect(result.status).toBe(201);

  const data = expectData<AuthUserResponse>(result);
  const setCookie = getSetCookie(result.response);

  expect(setCookie).toBeTruthy();

  return {
    input,
    user: data.user,
    setCookie: setCookie!,
    cookie: cookieHeaderFromSetCookie(setCookie!),
  };
}

async function createTestBook(
  cookie: string,
  overrides: Partial<CreateBookInput> = {},
) {
  const unique = uniqueSuffix();

  const input = {
    title: overrides.title ?? `Test Book ${unique}`,
    subtitle: overrides.subtitle ?? "A test subtitle",
    description: overrides.description ?? "A test description",
    language: overrides.language ?? "en",
    coverUrl: overrides.coverUrl ?? `https://example.com/covers/${unique}.jpg`,
    authors: overrides.authors ?? [`Author ${unique}`, `Co Author ${unique}`],
  } satisfies CreateBookInput;

  const result = await apiV1.books.post(input, {
    headers: {
      cookie,
    },
  });

  expect(result.status).toBe(201);

  const book = expectData<BookResponse>(result);

  return {
    input,
    book,
  };
}

describe("books", () => {
  test("POST /books creates a book with authors", async () => {
    const { cookie } = await registerTestUser();

    const { input, book } = await createTestBook(cookie);

    expect(book.id).toBeTruthy();
    expect(book.title).toBe(input.title);
    expect(book.subtitle).toBe(input.subtitle);
    expect(book.description).toBe(input.description);
    expect(book.language).toBe(input.language);
    expect(book.coverUrl).toBe(input.coverUrl);
    expect(book.files).toEqual([]);

    expect(book.authors).toHaveLength(2);
    expect(book.authors.map((author) => author.name)).toEqual(input.authors);
  });

  test("POST /books adds the book to the current user's library", async () => {
    const { cookie, user } = await registerTestUser();

    const { book } = await createTestBook(cookie);

    const [libraryBook] = await db
      .select()
      .from(userBooks)
      .where(and(eq(userBooks.userId, user.id), eq(userBooks.bookId, book.id)))
      .limit(1);

    expect(libraryBook).toBeTruthy();
    expect(libraryBook.userId).toBe(user.id);
    expect(libraryBook.bookId).toBe(book.id);
    expect(libraryBook.status).toBe("want_to_read");
  });

  test("POST /books allows optional fields to be omitted", async () => {
    const { cookie } = await registerTestUser();
    const unique = uniqueSuffix();

    const result = await apiV1.books.post(
      {
        title: `Minimal Book ${unique}`,
        language: "en",
        authors: [`Minimal Author ${unique}`],
      },
      {
        headers: {
          cookie,
        },
      },
    );

    expect(result.status).toBe(201);

    const book = expectData<BookResponse>(result);

    expect(book.id).toBeTruthy();
    expect(book.title).toBe(`Minimal Book ${unique}`);
    expect(book.subtitle).toBeNull();
    expect(book.description).toBeNull();
    expect(book.language).toBe("en");
    expect(book.coverUrl).toBeNull();
    expect(book.files).toEqual([]);

    expect(book.authors).toHaveLength(1);
    expect(book.authors[0]?.name).toBe(`Minimal Author ${unique}`);
  });

  test("POST /books normalizes and deduplicates authors", async () => {
    const { cookie } = await registerTestUser();
    const unique = uniqueSuffix();

    const authorName = `Repeated Author ${unique}`;

    const result = await apiV1.books.post(
      {
        title: `Deduplicated Author Book ${unique}`,
        language: "en",
        authors: [` ${authorName} `, authorName],
      },
      {
        headers: {
          cookie,
        },
      },
    );

    expect(result.status).toBe(201);

    const book = expectData<BookResponse>(result);

    expect(book.authors).toHaveLength(1);
    expect(book.authors[0]?.name).toBe(authorName);
  });

  test("POST /books without a session returns 401", async () => {
    const result = await apiV1.books.post({
      title: `Unauthenticated Book ${uniqueSuffix()}`,
      subtitle: "Should fail",
      description: "Should fail",
      language: "en",
      coverUrl: "https://example.com/cover.jpg",
      authors: ["Unauthenticated Author"],
    });

    expect(result.status).toBe(401);

    const error = expectErrorValue<ErrorResponse>(result);

    expect(error).toEqual({
      error: "UNAUTHORIZED",
      message: "You must be logged in.",
      statusCode: 401,
    });
  });

  test("POST /books rejects an empty authors array", async () => {
    const { cookie } = await registerTestUser();

    const result = await apiV1.books.post(
      {
        title: `Invalid Book ${uniqueSuffix()}`,
        language: "en",
        authors: [],
      },
      {
        headers: {
          cookie,
        },
      },
    );

    expect(result.status).toBe(422);
  });

  test("POST /books rejects an empty title", async () => {
    const { cookie } = await registerTestUser();

    const result = await apiV1.books.post(
      {
        title: "",
        language: "en",
        authors: [`Author ${uniqueSuffix()}`],
      },
      {
        headers: {
          cookie,
        },
      },
    );

    expect(result.status).toBe(422);
  });

  test("POST /books rejects a whitespace-only title", async () => {
    const { cookie } = await registerTestUser();

    const result = await apiV1.books.post(
      {
        title: "   ",
        language: "en",
        authors: [`Author ${uniqueSuffix()}`],
      },
      {
        headers: {
          cookie,
        },
      },
    );

    expect(result.status).toBe(422);
  });

  test("POST /books rejects a whitespace-only author", async () => {
    const { cookie } = await registerTestUser();

    const result = await apiV1.books.post(
      {
        title: `Invalid Author Book ${uniqueSuffix()}`,
        language: "en",
        authors: ["   "],
      },
      {
        headers: {
          cookie,
        },
      },
    );

    expect(result.status).toBe(422);
  });

  test("POST /books normalizes blank optional fields to null", async () => {
    const { cookie } = await registerTestUser();
    const unique = uniqueSuffix();

    const result = await apiV1.books.post(
      {
        title: `Blank Optional Fields Book ${unique}`,
        subtitle: "   ",
        description: "\t  ",
        language: "en",
        coverUrl: "   ",
        authors: [`Blank Optional Fields Author ${unique}`],
      },
      {
        headers: {
          cookie,
        },
      },
    );

    expect(result.status).toBe(201);

    const book = expectData<BookResponse>(result);

    expect(book.subtitle).toBeNull();
    expect(book.description).toBeNull();
    expect(book.coverUrl).toBeNull();
  });

  test("GET /books lists books", async () => {
    const { cookie } = await registerTestUser();
    const { book } = await createTestBook(cookie);

    const result = await apiV1.books.get();

    expect(result.status).toBe(200);

    const books = expectData<BookResponse[]>(result);

    expect(books.some((listedBook) => listedBook.id === book.id)).toBe(true);
  });

  test("GET /books returns books with authors and empty files array", async () => {
    const { cookie } = await registerTestUser();
    const { book } = await createTestBook(cookie);

    const result = await apiV1.books.get();

    expect(result.status).toBe(200);

    const books = expectData<BookResponse[]>(result);
    const listedBook = books.find((item) => item.id === book.id);

    expect(listedBook).toBeTruthy();
    expect(listedBook?.authors).toHaveLength(2);
    expect(listedBook?.files).toEqual([]);
  });

  test("GET /books/search searches by title", async () => {
    const { cookie } = await registerTestUser();
    const unique = uniqueSuffix();
    const titleNeedle = `Rare Title Needle ${unique}`;

    const { book } = await createTestBook(cookie, {
      title: titleNeedle,
      authors: [`Title Search Author ${unique}`],
    });

    await createTestBook(cookie, {
      title: `Unrelated Title ${unique}`,
      authors: [`Unrelated Author ${unique}`],
    });

    const result = await apiV1.books.search.get({
      query: {
        query: titleNeedle,
      },
    });

    expect(result.status).toBe(200);

    const search = expectData<BooksSearchResponse>(result);

    expect(search.items.map((item) => item.id)).toContain(book.id);
    expect(search.items.every((item) => item.title.includes(titleNeedle))).toBe(
      true,
    );

    expect(search.meta).toEqual({
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    });
  });

  test("GET /books/search searches by author name", async () => {
    const { cookie } = await registerTestUser();
    const unique = uniqueSuffix();
    const authorNeedle = `Rare Author Needle ${unique}`;

    const { book } = await createTestBook(cookie, {
      title: `Author Search Target Book ${unique}`,
      authors: [authorNeedle],
    });

    await createTestBook(cookie, {
      title: `Author Search Decoy Book ${unique}`,
      authors: [`Different Author ${unique}`],
    });

    const result = await apiV1.books.search.get({
      query: {
        query: authorNeedle,
      },
    });

    expect(result.status).toBe(200);

    const search = expectData<BooksSearchResponse>(result);

    expect(search.items.map((item) => item.id)).toContain(book.id);
    expect(
      search.items.every((item) =>
        item.authors.some((author) => author.name === authorNeedle),
      ),
    ).toBe(true);

    expect(search.meta).toEqual({
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    });
  });

  test("GET /books/search filters by language", async () => {
    const { cookie } = await registerTestUser();
    const unique = uniqueSuffix();
    const queryNeedle = `Language Filter Needle ${unique}`;

    const { book: banglaBook } = await createTestBook(cookie, {
      title: `${queryNeedle} Bangla`,
      language: "bn",
      authors: [`Bangla Author ${unique}`],
    });

    await createTestBook(cookie, {
      title: `${queryNeedle} English`,
      language: "en",
      authors: [`English Author ${unique}`],
    });

    const result = await apiV1.books.search.get({
      query: {
        query: queryNeedle,
        language: "bn",
      },
    });

    expect(result.status).toBe(200);

    const search = expectData<BooksSearchResponse>(result);

    expect(search.items.map((item) => item.id)).toEqual([banglaBook.id]);
    expect(search.items.every((item) => item.language === "bn")).toBe(true);

    expect(search.meta).toEqual({
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    });
  });

  test("GET /books/search paginates scoped results", async () => {
    const { cookie } = await registerTestUser();
    const unique = uniqueSuffix();
    const queryNeedle = `Pagination Needle ${unique}`;

    const createdBooks: BookResponse[] = [];

    for (const index of [1, 2, 3]) {
      const { book } = await createTestBook(cookie, {
        title: `${queryNeedle} ${index}`,
        authors: [`Pagination Author ${unique} ${index}`],
      });

      createdBooks.push(book);
    }

    await createTestBook(cookie, {
      title: `Pagination Decoy ${unique}`,
      authors: [`Pagination Decoy Author ${unique}`],
    });

    const firstPageResult = await apiV1.books.search.get({
      query: {
        query: queryNeedle,
        page: 1,
        limit: 2,
      },
    });

    expect(firstPageResult.status).toBe(200);

    const firstPage = expectData<BooksSearchResponse>(firstPageResult);

    expect(firstPage.items).toHaveLength(2);
    expect(firstPage.meta).toEqual({
      page: 1,
      limit: 2,
      total: 3,
      totalPages: 2,
    });

    const secondPageResult = await apiV1.books.search.get({
      query: {
        query: queryNeedle,
        page: 2,
        limit: 2,
      },
    });

    expect(secondPageResult.status).toBe(200);

    const secondPage = expectData<BooksSearchResponse>(secondPageResult);

    expect(secondPage.items).toHaveLength(1);
    expect(secondPage.meta).toEqual({
      page: 2,
      limit: 2,
      total: 3,
      totalPages: 2,
    });

    const returnedIds = [
      ...firstPage.items.map((item) => item.id),
      ...secondPage.items.map((item) => item.id),
    ];

    const createdIds = createdBooks.map((book) => book.id);

    expect(new Set(returnedIds).size).toBe(3);
    expect(returnedIds.sort()).toEqual(createdIds.sort());
  });

  test("GET /books/search rejects invalid pagination", async () => {
    const pageResult = await apiV1.books.search.get({
      query: {
        page: 0,
      },
    });

    expect(pageResult.status).toBe(422);

    const limitResult = await apiV1.books.search.get({
      query: {
        limit: 101,
      },
    });

    expect(limitResult.status).toBe(422);
  });

  test("GET /books/:id returns one book", async () => {
    const { cookie } = await registerTestUser();
    const { input, book } = await createTestBook(cookie);

    const result = await apiV1.books({ id: book.id }).get();

    expect(result.status).toBe(200);

    const data = expectData<BookResponse>(result);

    expect(data.id).toBe(book.id);
    expect(data.title).toBe(input.title);
    expect(data.subtitle).toBe(input.subtitle);
    expect(data.description).toBe(input.description);
    expect(data.language).toBe(input.language);
    expect(data.coverUrl).toBe(input.coverUrl);
    expect(data.authors.map((author) => author.name)).toEqual(
      expect.arrayContaining(input.authors),
    );
    expect(data.authors).toHaveLength(input.authors.length);
    expect(data.files).toEqual([]);
  });

  test("GET /books/:id returns 404 for missing book", async () => {
    const result = await apiV1
      .books({
        id: crypto.randomUUID(),
      })
      .get();

    expect(result.status).toBe(404);

    const error = expectErrorValue<ErrorResponse>(result);

    expect(error).toEqual({
      error: "NOT_FOUND",
      message: "Book not found.",
      statusCode: 404,
    });
  });

  test("GET /books/:id rejects an invalid UUID", async () => {
    const result = await apiV1
      .books({
        id: "not-a-uuid",
      })
      .get();

    expect(result.status).toBe(422);
  });
});
