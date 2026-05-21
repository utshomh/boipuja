import { expect } from "bun:test";
import { treaty } from "@elysiajs/eden";

import { app } from "../app";

export const server = treaty(app);

export const apiV1 = server.api.v1;

export function getSetCookie(response: Response) {
  return response.headers.get("set-cookie");
}

export function cookieHeaderFromSetCookie(setCookie: string) {
  return setCookie.split(";")[0];
}

export function expectData<T>(result: { data: unknown; error: unknown }): T {
  expect(result.error).toBeNull();
  expect(result.data).not.toBeNull();

  if (result.data === null) {
    throw new Error("Expected Eden response data.");
  }

  return result.data as T;
}

export function expectErrorValue<T>(result: {
  data: unknown;
  error: unknown;
}): T {
  expect(result.data).toBeNull();
  expect(result.error).not.toBeNull();

  const error = result.error;

  if (typeof error !== "object" || error === null || !("value" in error)) {
    throw new Error("Expected Eden error response.");
  }

  return error.value as T;
}
