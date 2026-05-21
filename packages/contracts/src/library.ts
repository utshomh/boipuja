import { t } from "elysia";

import { BookDto } from "./books";
import { ReadingLocatorDto, UuidString } from "./common";
import { ReadingStatusEnum, VisibilityEnum } from "./enums";

export const LibraryBookDto = t.Object({
  id: UuidString,
  book: BookDto,
  status: ReadingStatusEnum,
  rating: t.Nullable(t.Number()),
  progressPercent: t.Number(),
  currentLocator: t.Nullable(ReadingLocatorDto),
  visibility: VisibilityEnum,
  createdAt: t.String(),
  updatedAt: t.String(),
});

export const AddBookToLibraryBody = t.Object({
  bookId: UuidString,
  status: t.Optional(ReadingStatusEnum),
  visibility: t.Optional(VisibilityEnum),
});

export const UpdateLibraryBookBody = t.Object({
  status: t.Optional(ReadingStatusEnum),
  rating: t.Optional(t.Nullable(t.Number({ minimum: 1, maximum: 5 }))),
  progressPercent: t.Optional(t.Number({ minimum: 0, maximum: 100 })),
  currentLocator: t.Optional(t.Nullable(ReadingLocatorDto)),
  visibility: t.Optional(VisibilityEnum),
});
