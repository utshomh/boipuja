import { t } from "elysia";

import { MeDto } from "./users";

export const RegisterBody = t.Object({
  email: t.String({
    format: "email",
  }),
  username: t.String({
    minLength: 3,
    maxLength: 32,
  }),
  displayName: t.String({
    minLength: 1,
    maxLength: 80,
  }),
  password: t.String({
    minLength: 8,
    maxLength: 128,
  }),
});

export const LoginBody = t.Object({
  email: t.String({
    format: "email",
  }),
  password: t.String({
    minLength: 1,
    maxLength: 128,
  }),
});

export const AuthUserResponseDto = t.Object({
  user: MeDto,
});

export const LogoutResponseDto = t.Object({
  ok: t.Boolean(),
});
