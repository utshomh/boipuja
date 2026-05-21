import { t } from "elysia";

import { UuidString } from "./common";
import { FilePurposeEnum } from "./enums";

export const FileDto = t.Object({
  id: UuidString,
  url: t.String(),
  filename: t.String(),
  contentType: t.String(),
  sizeBytes: t.Nullable(t.Number()),
  purpose: FilePurposeEnum,
});
