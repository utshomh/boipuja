import type { Static } from "elysia";

import type { ReadingLocatorDto } from "./common";

export type ReadingLocator = Static<typeof ReadingLocatorDto>;

export type ClientRealtimeEvent =
  | {
      type: "session.join";
      sessionId: string;
    }
  | {
      type: "chat.message.send";
      sessionId: string;
      body: string;
      clientMessageId: string;
    }
  | {
      type: "reader.location.update";
      sessionId: string;
      locator: ReadingLocator;
    };

export type ServerRealtimeEvent =
  | {
      type: "chat.message.created";
      message: {
        id: string;
        sessionId: string;
        userId: string;
        body: string;
        createdAt: string;
      };
    }
  | {
      type: "presence.updated";
      sessionId: string;
      participants: Array<{
        userId: string;
        username: string;
        displayName: string;
      }>;
    }
  | {
      type: "reader.location.changed";
      sessionId: string;
      userId: string;
      locator: ReadingLocator;
    };
