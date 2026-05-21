import type { Static } from "elysia";
import { describe, expect, test } from "bun:test";

import {
  AuthUserResponseDto,
  ErrorDto,
  LogoutResponseDto,
  MeDto,
} from "@boipuja/contracts";

import { SESSION_COOKIE_NAME } from "./session";
import {
  apiV1,
  cookieHeaderFromSetCookie,
  expectData,
  expectErrorValue,
  getSetCookie,
} from "../test/eden";

type AuthUserResponse = Static<typeof AuthUserResponseDto>;
type MeResponse = Static<typeof MeDto>;
type LogoutResponse = Static<typeof LogoutResponseDto>;
type ErrorResponse = Static<typeof ErrorDto>;

function uniqueSuffix() {
  return crypto.randomUUID().slice(0, 8);
}

async function registerTestUser() {
  const unique = uniqueSuffix();

  const input = {
    email: `test-${unique}@example.com`,
    username: `test_${unique}`,
    displayName: "Test User",
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

describe("auth", () => {
  test("register creates a user, sets a session cookie, and returns the user", async () => {
    const { input, user, setCookie } = await registerTestUser();

    expect(user.email).toBe(input.email);
    expect(user.username).toBe(input.username);
    expect(user.displayName).toBe(input.displayName);
    expect(user.emailVerified).toBe(false);
    expect("passwordHash" in user).toBe(false);

    expect(setCookie).toContain(SESSION_COOKIE_NAME);
    expect(setCookie.toLowerCase()).toContain("httponly");
  });

  test("duplicate register by email returns 409", async () => {
    const { input } = await registerTestUser();

    const result = await apiV1.auth.register.post({
      email: input.email,
      username: `other_${uniqueSuffix()}`,
      displayName: "Duplicate User",
      password: "password123",
    });

    expect(result.status).toBe(409);

    const error = expectErrorValue<ErrorResponse>(result);

    expect(error).toEqual({
      error: "CONFLICT",
      message: "Email or username is already in use",
      statusCode: 409,
    });
  });

  test("duplicate register by username returns 409", async () => {
    const { input } = await registerTestUser();

    const result = await apiV1.auth.register.post({
      email: `other-${uniqueSuffix()}@example.com`,
      username: input.username,
      displayName: "Duplicate User",
      password: "password123",
    });

    expect(result.status).toBe(409);

    const error = expectErrorValue<ErrorResponse>(result);

    expect(error).toEqual({
      error: "CONFLICT",
      message: "Email or username is already in use",
      statusCode: 409,
    });
  });

  test("login with valid credentials returns the user and sets a session cookie", async () => {
    const { input } = await registerTestUser();

    const result = await apiV1.auth.login.post({
      email: input.email,
      password: input.password,
    });

    expect(result.status).toBe(200);

    const data = expectData<AuthUserResponse>(result);
    const setCookie = getSetCookie(result.response);

    expect(data.user.email).toBe(input.email);
    expect(data.user.username).toBe(input.username);
    expect(data.user.displayName).toBe(input.displayName);
    expect(data.user.emailVerified).toBe(false);
    expect("passwordHash" in data.user).toBe(false);

    expect(setCookie).toBeTruthy();
    expect(setCookie).toContain(SESSION_COOKIE_NAME);
    expect(setCookie!.toLowerCase()).toContain("httponly");
  });

  test("login rejects email with surrounding whitespace", async () => {
    const { input } = await registerTestUser();

    const result = await apiV1.auth.login.post({
      email: `  ${input.email}  `,
      password: input.password,
    });

    expect(result.status).toBe(422);
  });

  test("login normalizes email before lookup", async () => {
    const { input } = await registerTestUser();

    const result = await apiV1.auth.login.post({
      email: `${input.email.toUpperCase()}`,
      password: input.password,
    });

    expect(result.status).toBe(200);

    const data = expectData<AuthUserResponse>(result);

    expect(data.user.email).toBe(input.email);
  });

  test("login with invalid email returns generic 401", async () => {
    const result = await apiV1.auth.login.post({
      email: `missing-${uniqueSuffix()}@example.com`,
      password: "password123",
    });

    expect(result.status).toBe(401);

    const error = expectErrorValue<ErrorResponse>(result);

    expect(error).toEqual({
      error: "UNAUTHORIZED",
      message: "Invalid email or password",
      statusCode: 401,
    });
  });

  test("login with invalid password returns generic 401", async () => {
    const { input } = await registerTestUser();

    const result = await apiV1.auth.login.post({
      email: input.email,
      password: "wrong-password",
    });

    expect(result.status).toBe(401);

    const error = expectErrorValue<ErrorResponse>(result);

    expect(error).toEqual({
      error: "UNAUTHORIZED",
      message: "Invalid email or password",
      statusCode: 401,
    });
  });

  test("/me with a valid session returns the current user", async () => {
    const { input, cookie } = await registerTestUser();

    const result = await apiV1.me.get({
      headers: {
        cookie,
      },
    });

    expect(result.status).toBe(200);

    const data = expectData<MeResponse>(result);

    expect(data.email).toBe(input.email);
    expect(data.username).toBe(input.username);
    expect(data.displayName).toBe(input.displayName);
    expect(data.emailVerified).toBe(false);
    expect("passwordHash" in data).toBe(false);
  });

  test("/me without a session returns 401", async () => {
    const result = await apiV1.me.get();

    expect(result.status).toBe(401);

    const error = expectErrorValue<ErrorResponse>(result);

    expect(error).toEqual({
      error: "UNAUTHORIZED",
      message: "You must be logged in.",
      statusCode: 401,
    });
  });

  test("PATCH /me updates the current user", async () => {
    const { cookie } = await registerTestUser();

    const newUsername = `updated_${uniqueSuffix()}`;

    const result = await apiV1.me.patch(
      {
        username: newUsername,
        displayName: "Updated User",
        avatarUrl: null,
        bio: "Updated bio",
      },
      {
        headers: {
          cookie,
        },
      },
    );

    expect(result.status).toBe(200);

    const data = expectData<MeResponse>(result);

    expect(data.username).toBe(newUsername);
    expect(data.displayName).toBe("Updated User");
    expect(data.avatarUrl).toBeNull();
    expect(data.bio).toBe("Updated bio");
    expect("passwordHash" in data).toBe(false);

    const meResult = await apiV1.me.get({
      headers: {
        cookie,
      },
    });

    expect(meResult.status).toBe(200);

    const meData = expectData<MeResponse>(meResult);

    expect(meData.username).toBe(newUsername);
    expect(meData.displayName).toBe("Updated User");
    expect(meData.avatarUrl).toBeNull();
    expect(meData.bio).toBe("Updated bio");
  });

  test("PATCH /me without a session returns 401", async () => {
    const result = await apiV1.me.patch({
      displayName: "Should Not Update",
    });

    expect(result.status).toBe(401);

    const error = expectErrorValue<ErrorResponse>(result);

    expect(error).toEqual({
      error: "UNAUTHORIZED",
      message: "You must be logged in.",
      statusCode: 401,
    });
  });

  test("PATCH /me rejects duplicate username", async () => {
    const first = await registerTestUser();
    const second = await registerTestUser();

    const result = await apiV1.me.patch(
      {
        username: first.input.username,
      },
      {
        headers: {
          cookie: second.cookie,
        },
      },
    );

    expect(result.status).toBe(409);

    const error = expectErrorValue<ErrorResponse>(result);

    expect(error).toEqual({
      error: "CONFLICT",
      message: "Username is already in use",
      statusCode: 409,
    });
  });

  test("PATCH /me preserves omitted fields", async () => {
    const { cookie } = await registerTestUser();

    const username = `partial_${uniqueSuffix()}`;

    const firstPatch = await apiV1.me.patch(
      {
        username,
        displayName: "Before Partial Update",
        avatarUrl: null,
        bio: "This bio should stay",
      },
      {
        headers: {
          cookie,
        },
      },
    );

    expect(firstPatch.status).toBe(200);

    const secondPatch = await apiV1.me.patch(
      {
        displayName: "After Partial Update",
      },
      {
        headers: {
          cookie,
        },
      },
    );

    expect(secondPatch.status).toBe(200);

    const data = expectData<MeResponse>(secondPatch);

    expect(data.username).toBe(username);
    expect(data.displayName).toBe("After Partial Update");
    expect(data.avatarUrl).toBeNull();
    expect(data.bio).toBe("This bio should stay");
  });

  test("logout revokes the current session and clears the cookie", async () => {
    const { cookie } = await registerTestUser();

    const logoutResult = await apiV1.auth.logout.post(undefined, {
      headers: {
        cookie,
      },
    });

    expect(logoutResult.status).toBe(200);

    const logoutData = expectData<LogoutResponse>(logoutResult);

    expect(logoutData).toEqual({
      ok: true,
    });

    const setCookie = getSetCookie(logoutResult.response);

    expect(setCookie).toBeTruthy();
    expect(setCookie).toContain(SESSION_COOKIE_NAME);

    const meResult = await apiV1.me.get({
      headers: {
        cookie,
      },
    });

    expect(meResult.status).toBe(401);

    const error = expectErrorValue<ErrorResponse>(meResult);

    expect(error).toEqual({
      error: "UNAUTHORIZED",
      message: "You must be logged in.",
      statusCode: 401,
    });
  });

  test("logout without a session still returns ok", async () => {
    const result = await apiV1.auth.logout.post();

    expect(result.status).toBe(200);

    const data = expectData<LogoutResponse>(result);

    expect(data).toEqual({
      ok: true,
    });
  });
});
