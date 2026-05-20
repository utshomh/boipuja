# Boipuja TODO

## Current Goal

Build the backend foundation for Boipuja: a social book reading platform with library management, reader features, read-along sessions, text chat, and later voice chat.

## Stack

- Bun
- Elysia
- Drizzle
- PostgreSQL
- Docker Postgres for local development
- OpenAPI generated from Elysia schemas
- React + TanStack later
- Cloudinary/ImageKit for early image uploads
- Vercel Blob optional later
- Voice later through LiveKit or similar SFU

---

## Phase 0: Project Setup

- [x] Create monorepo structure
- [x] Add Bun workspaces
- [x] Add root TypeScript config
- [x] Add Docker Postgres
- [x] Add `.env.example`
- [ ] Add DB package
- [ ] Add contracts package
- [ ] Add API app
- [ ] Add OpenAPI docs
- [ ] Confirm `/health` endpoint works
- [ ] Confirm `/openapi` works

---

## Phase 1: Database Foundation

- [ ] Add users table
- [ ] Add books table
- [ ] Add authors table
- [ ] Add book_authors table
- [ ] Add editions table
- [ ] Add user_books table
- [ ] Add shelves table
- [ ] Add shelf_books table
- [ ] Add highlights table
- [ ] Add notes table
- [ ] Add read_sessions table
- [ ] Add read_session_participants table
- [ ] Add read_session_messages table
- [ ] Add follows table
- [ ] Add reviews table
- [ ] Add files table
- [ ] Generate first migration
- [ ] Run first migration
- [ ] Open Drizzle Studio

---

## Phase 2: Auth

- [ ] Replace fake user with real auth
- [ ] Add register endpoint
- [ ] Add login endpoint
- [ ] Add logout endpoint
- [ ] Add get current user endpoint
- [ ] Hash passwords with Argon2 or bcrypt
- [ ] Decide session strategy: cookie session or JWT
- [ ] Add auth middleware
- [ ] Add route protection
- [ ] Add OpenAPI auth docs

---

## Phase 3: Books

- [ ] Create book endpoint
- [ ] Get book by ID endpoint
- [ ] Search books endpoint
- [ ] Add authors properly without duplicates
- [ ] Add ISBN duplicate detection
- [ ] Add cover image support
- [ ] Add edition support
- [ ] Add seed data for public-domain books

---

## Phase 4: Library

- [ ] Add book to library
- [ ] Update reading status
- [ ] Update reading progress
- [ ] Remove book from library
- [ ] List my library
- [ ] Filter by reading status
- [ ] Add shelves
- [ ] Add/remove books from shelves
- [ ] Add privacy settings

---

## Phase 5: Reader

- [ ] Define ReadingLocator format
- [ ] Save reading progress
- [ ] Add bookmarks
- [ ] Add highlights
- [ ] Add notes
- [ ] Add private/public visibility
- [ ] Add endpoint to fetch all reader data for a book

---

## Phase 6: Read-Along Sessions

- [ ] Create read session
- [ ] Join read session
- [ ] Leave read session
- [ ] Start session
- [ ] Pause session
- [ ] End session
- [ ] Store current host locator
- [ ] Add participants table logic
- [ ] Add session permissions

---

## Phase 7: Text Chat

- [ ] Add WebSocket route
- [ ] Define client realtime events
- [ ] Define server realtime events
- [ ] Add session presence
- [ ] Add text messages
- [ ] Persist chat messages
- [ ] Add reconnect behavior
- [ ] Add rate limiting later

---

## Phase 8: Social

- [ ] Follow user
- [ ] Unfollow user
- [ ] Public profile
- [ ] Reviews
- [ ] Activity events
- [ ] Basic feed
- [ ] Blocking
- [ ] Reporting

---

## Phase 9: Uploads

- [ ] Add storage provider interface
- [ ] Add Cloudinary provider
- [ ] Add avatar upload
- [ ] Add cover upload
- [ ] Save file metadata in `files`
- [ ] Validate file size
- [ ] Validate MIME type
- [ ] Add delete file support
- [ ] Add migration path to Vercel Blob/R2/S3 later

---

## Phase 10: Frontend

- [ ] Create web app
- [ ] Add TanStack Router
- [ ] Add TanStack Query
- [ ] Add Eden client
- [ ] Add auth pages
- [ ] Add library page
- [ ] Add book detail page
- [ ] Add reader page
- [ ] Add read-along session page
- [ ] Add chat UI

---

## Phase 11: Voice Later

- [ ] Research LiveKit
- [ ] Add voice room token endpoint
- [ ] Add frontend voice connection
- [ ] Add mute/deafen
- [ ] Add moderation controls
