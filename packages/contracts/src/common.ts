import { t } from "elysia";

export const UuidString = t.String({
  format: "uuid",
});

export const ErrorDto = t.Object({
  error: t.String(),
  message: t.String(),
  statusCode: t.Number(),
});

export const PaginationQuery = t.Object({
  page: t.Optional(t.Numeric()),
  limit: t.Optional(t.Numeric()),
});

export const PaginationMetaDto = t.Object({
  page: t.Number(),
  limit: t.Number(),
  total: t.Number(),
  totalPages: t.Number(),
});

export const ReadingLocatorDto = t.Union([
  t.Object({
    kind: t.Literal("epub-cfi"),
    cfi: t.String(),
    chapterHref: t.Optional(t.String()),
    progress: t.Optional(t.Number({ minimum: 0, maximum: 1 })),
  }),
  t.Object({
    kind: t.Literal("pdf-page"),
    page: t.Number({ minimum: 1 }),
    offsetY: t.Optional(t.Number()),
    progress: t.Optional(t.Number({ minimum: 0, maximum: 1 })),
  }),
]);
