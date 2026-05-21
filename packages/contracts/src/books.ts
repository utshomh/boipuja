import { t } from "elysia";

import { FileDto } from "./files";
import { UuidString } from "./common";

export const AuthorDto = t.Object({
  id: UuidString,
  name: t.String(),
});

export const BookFileDto = t.Object({
  id: UuidString,
  label: t.Nullable(t.String()),
  file: FileDto,
  uploadedByUserId: UuidString,
  createdAt: t.String(),
});

export const BookDto = t.Object({
  id: UuidString,
  title: t.String(),
  subtitle: t.Nullable(t.String()),
  description: t.Nullable(t.String()),
  language: t.String(),
  coverUrl: t.Nullable(t.String()),
  authors: t.Array(AuthorDto),
  files: t.Array(BookFileDto),
});

export const CreateBookBody = t.Object({
  title: t.String({ minLength: 1 }),
  subtitle: t.Optional(t.String()),
  description: t.Optional(t.String()),
  language: t.String({ minLength: 1 }),
  coverUrl: t.Optional(t.String()),
  authors: t.Array(t.String({ minLength: 1 }), {
    minItems: 1,
  }),
});
