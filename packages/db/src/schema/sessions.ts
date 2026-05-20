import {
  pgTable,
  timestamp,
  uuid,
  text,
  varchar,
  index,
  unique,
} from "drizzle-orm/pg-core";

import { users } from "./users";
import { books } from "./books";
import {
  participantRoleEnum,
  sessionStatusEnum,
  sessionSyncModeEnum,
  visibilityEnum,
} from "./enums";

export const readSessions = pgTable(
  "read_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    hostUserId: uuid("host_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),

    title: varchar("title", { length: 255 }).notNull(),

    status: sessionStatusEnum("status").notNull().default("scheduled"),

    syncMode: sessionSyncModeEnum("sync_mode")
      .notNull()
      .default("host_controlled"),

    currentLocator: text("current_locator"),

    visibility: visibilityEnum("visibility").notNull().default("private"),

    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    startedAt: timestamp("started_at", { withTimezone: true }),
    endedAt: timestamp("ended_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    hostUserIdIdx: index("read_sessions_host_user_id_idx").on(table.hostUserId),
    bookIdIdx: index("read_sessions_book_id_idx").on(table.bookId),
    statusIdx: index("read_sessions_status_idx").on(table.status),
    scheduledAtIdx: index("read_sessions_scheduled_at_idx").on(
      table.scheduledAt,
    ),
  }),
);

export const readSessionParticipants = pgTable(
  "read_session_participants",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    sessionId: uuid("session_id")
      .notNull()
      .references(() => readSessions.id, { onDelete: "cascade" }),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    role: participantRoleEnum("role").notNull().default("participant"),

    joinedAt: timestamp("joined_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    leftAt: timestamp("left_at", { withTimezone: true }),
  },
  (table) => ({
    uniqueSessionUser: unique(
      "read_session_participants_session_id_user_id_unique",
    ).on(table.sessionId, table.userId),
    sessionIdIdx: index("read_session_participants_session_id_idx").on(
      table.sessionId,
    ),
    userIdIdx: index("read_session_participants_user_id_idx").on(table.userId),
  }),
);

export const readSessionMessages = pgTable(
  "read_session_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    sessionId: uuid("session_id")
      .notNull()
      .references(() => readSessions.id, { onDelete: "cascade" }),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    body: text("body").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    sessionIdIdx: index("read_session_messages_session_id_idx").on(
      table.sessionId,
    ),
    userIdIdx: index("read_session_messages_user_id_idx").on(table.userId),
    createdAtIdx: index("read_session_messages_created_at_idx").on(
      table.createdAt,
    ),
  }),
);
