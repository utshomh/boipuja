import type { Static } from "elysia";

import { ErrorDto } from "@boipuja/contracts";

export type ErrorResponse = Static<typeof ErrorDto>;

export function errorResponse(
  statusCode: number,
  error: string,
  message: string,
): ErrorResponse {
  return {
    error,
    message,
    statusCode,
  } satisfies ErrorResponse;
}

export function unauthorized(message = "You must be logged in.") {
  return errorResponse(401, "UNAUTHORIZED", message);
}

export function forbidden(message = "You do not have permission to do this.") {
  return errorResponse(403, "FORBIDDEN", message);
}

export function notFound(message = "Resource not found.") {
  return errorResponse(404, "NOT_FOUND", message);
}

export function conflict(message = "Resource already exists.") {
  return errorResponse(409, "CONFLICT", message);
}

export function internalServerError(message = "Something went wrong.") {
  return errorResponse(500, "INTERNAL_SERVER_ERROR", message);
}
