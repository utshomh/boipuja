CREATE TYPE "public"."book_format" AS ENUM('pdf', 'epub', 'other');--> statement-breakpoint
CREATE TYPE "public"."file_purpose" AS ENUM('avatar', 'book_cover', 'book_file', 'attachment');--> statement-breakpoint
CREATE TYPE "public"."participant_role" AS ENUM('host', 'moderator', 'participant');--> statement-breakpoint
CREATE TYPE "public"."reading_status" AS ENUM('want_to_read', 'reading', 'finished', 'dropped');--> statement-breakpoint
CREATE TYPE "public"."session_status" AS ENUM('scheduled', 'live', 'paused', 'ended', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."session_sync_mode" AS ENUM('host_controlled', 'loose_sync');--> statement-breakpoint
CREATE TYPE "public"."visibility" AS ENUM('private', 'public');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(127) NOT NULL,
	"username" varchar(63) NOT NULL,
	"display_name" varchar(127) NOT NULL,
	"avatar_url" varchar(255),
	"password_hash" varchar(255) NOT NULL,
	"bio" text,
	"email_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "authors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(127) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "book_authors" (
	"book_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	CONSTRAINT "book_authors_book_id_author_id_pk" PRIMARY KEY("book_id","author_id")
);
--> statement-breakpoint
CREATE TABLE "books" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"subtitle" varchar(255),
	"description" text,
	"language" varchar(15),
	"canonical_isbn" varchar(31),
	"cover_url" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "books_canonical_isbn_unique" UNIQUE("canonical_isbn")
);
--> statement-breakpoint
CREATE TABLE "editions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"book_id" uuid NOT NULL,
	"isbn_10" varchar(15),
	"isbn_13" varchar(15),
	"publisher" varchar(255),
	"published_year" integer,
	"page_count" integer,
	"format" "book_format" DEFAULT 'other' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "editions_isbn_10_unique" UNIQUE("isbn_10"),
	CONSTRAINT "editions_isbn_13_unique" UNIQUE("isbn_13")
);
--> statement-breakpoint
CREATE TABLE "shelf_books" (
	"shelf_id" uuid NOT NULL,
	"user_book_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shelf_books_shelf_id_user_book_id_pk" PRIMARY KEY("shelf_id","user_book_id")
);
--> statement-breakpoint
CREATE TABLE "shelves" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(63) NOT NULL,
	"visibility" "visibility" DEFAULT 'private' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shelves_user_id_name_unique" UNIQUE("user_id","name")
);
--> statement-breakpoint
CREATE TABLE "user_books" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"book_id" uuid NOT NULL,
	"edition_id" uuid,
	"status" "reading_status" DEFAULT 'want_to_read' NOT NULL,
	"rating" integer,
	"progress_percent" numeric(5, 2) DEFAULT '0' NOT NULL,
	"current_locator" text,
	"visibility" "visibility" DEFAULT 'private' NOT NULL,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_books_user_id_book_id_unique" UNIQUE("user_id","book_id")
);
--> statement-breakpoint
CREATE TABLE "bookmarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"book_id" uuid NOT NULL,
	"locator" jsonb NOT NULL,
	"label" varchar(127),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "highlights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"book_id" uuid NOT NULL,
	"locator_start" text NOT NULL,
	"locator_end" text,
	"text_excerpt" text,
	"color" varchar(31) NOT NULL,
	"visibility" "visibility" DEFAULT 'private' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"book_id" uuid NOT NULL,
	"highlight_id" uuid,
	"locator" text,
	"body" text NOT NULL,
	"visibility" "visibility" DEFAULT 'private' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "read_session_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "read_session_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "participant_role" DEFAULT 'participant' NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"left_at" timestamp with time zone,
	CONSTRAINT "read_session_participants_session_id_user_id_unique" UNIQUE("session_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "read_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"host_user_id" uuid NOT NULL,
	"book_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"status" "session_status" DEFAULT 'scheduled' NOT NULL,
	"sync_mode" "session_sync_mode" DEFAULT 'host_controlled' NOT NULL,
	"current_locator" text,
	"visibility" "visibility" DEFAULT 'private' NOT NULL,
	"scheduled_at" timestamp with time zone,
	"started_at" timestamp with time zone,
	"ended_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(63) NOT NULL,
	"subject_id" uuid,
	"subject_type" varchar(63),
	"metadata" jsonb,
	"visibility" "visibility" DEFAULT 'public' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "follows" (
	"follower_id" uuid NOT NULL,
	"following_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "follows_follower_id_following_id_pk" PRIMARY KEY("follower_id","following_id")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"book_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"body" text,
	"visibility" "visibility" DEFAULT 'public' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reviews_user_id_book_id_unique" UNIQUE("user_id","book_id")
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_user_id" uuid,
	"key" varchar(255) NOT NULL,
	"url" varchar(512) NOT NULL,
	"content_type" varchar(127) NOT NULL,
	"size_bytes" integer,
	"purpose" "file_purpose" NOT NULL,
	"visibility" "visibility" DEFAULT 'public' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "book_authors" ADD CONSTRAINT "book_authors_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_authors" ADD CONSTRAINT "book_authors_author_id_authors_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "editions" ADD CONSTRAINT "editions_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shelf_books" ADD CONSTRAINT "shelf_books_shelf_id_shelves_id_fk" FOREIGN KEY ("shelf_id") REFERENCES "public"."shelves"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shelf_books" ADD CONSTRAINT "shelf_books_user_book_id_user_books_id_fk" FOREIGN KEY ("user_book_id") REFERENCES "public"."user_books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shelves" ADD CONSTRAINT "shelves_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_books" ADD CONSTRAINT "user_books_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_books" ADD CONSTRAINT "user_books_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_books" ADD CONSTRAINT "user_books_edition_id_editions_id_fk" FOREIGN KEY ("edition_id") REFERENCES "public"."editions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "highlights" ADD CONSTRAINT "highlights_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "highlights" ADD CONSTRAINT "highlights_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_highlight_id_highlights_id_fk" FOREIGN KEY ("highlight_id") REFERENCES "public"."highlights"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "read_session_messages" ADD CONSTRAINT "read_session_messages_session_id_read_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."read_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "read_session_messages" ADD CONSTRAINT "read_session_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "read_session_participants" ADD CONSTRAINT "read_session_participants_session_id_read_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."read_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "read_session_participants" ADD CONSTRAINT "read_session_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "read_sessions" ADD CONSTRAINT "read_sessions_host_user_id_users_id_fk" FOREIGN KEY ("host_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "read_sessions" ADD CONSTRAINT "read_sessions_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_following_id_users_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "authors_name_idx" ON "authors" USING btree ("name");--> statement-breakpoint
CREATE INDEX "books_title_idx" ON "books" USING btree ("title");--> statement-breakpoint
CREATE INDEX "books_canonical_isbn_idx" ON "books" USING btree ("canonical_isbn");--> statement-breakpoint
CREATE INDEX "editions_book_id_idx" ON "editions" USING btree ("book_id");--> statement-breakpoint
CREATE INDEX "editions_isbn_10_idx" ON "editions" USING btree ("isbn_10");--> statement-breakpoint
CREATE INDEX "editions_isbn_13_idx" ON "editions" USING btree ("isbn_13");--> statement-breakpoint
CREATE INDEX "shelf_books_shelf_id_idx" ON "shelf_books" USING btree ("shelf_id");--> statement-breakpoint
CREATE INDEX "shelf_books_user_book_id_idx" ON "shelf_books" USING btree ("user_book_id");--> statement-breakpoint
CREATE INDEX "shelves_user_id_idx" ON "shelves" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_books_user_id_idx" ON "user_books" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_books_book_id_idx" ON "user_books" USING btree ("book_id");--> statement-breakpoint
CREATE INDEX "user_books_status_idx" ON "user_books" USING btree ("status");--> statement-breakpoint
CREATE INDEX "bookmarks_user_id_idx" ON "bookmarks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "bookmarks_book_id_idx" ON "bookmarks" USING btree ("book_id");--> statement-breakpoint
CREATE INDEX "highlights_user_id_idx" ON "highlights" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "highlights_book_id_idx" ON "highlights" USING btree ("book_id");--> statement-breakpoint
CREATE INDEX "notes_user_id_idx" ON "notes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notes_book_id_idx" ON "notes" USING btree ("book_id");--> statement-breakpoint
CREATE INDEX "notes_highlight_id_idx" ON "notes" USING btree ("highlight_id");--> statement-breakpoint
CREATE INDEX "read_session_messages_session_id_idx" ON "read_session_messages" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "read_session_messages_user_id_idx" ON "read_session_messages" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "read_session_messages_created_at_idx" ON "read_session_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "read_session_participants_session_id_idx" ON "read_session_participants" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "read_session_participants_user_id_idx" ON "read_session_participants" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "read_sessions_host_user_id_idx" ON "read_sessions" USING btree ("host_user_id");--> statement-breakpoint
CREATE INDEX "read_sessions_book_id_idx" ON "read_sessions" USING btree ("book_id");--> statement-breakpoint
CREATE INDEX "read_sessions_status_idx" ON "read_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "read_sessions_scheduled_at_idx" ON "read_sessions" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX "activity_events_user_id_idx" ON "activity_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "activity_events_created_at_idx" ON "activity_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "activity_events_type_idx" ON "activity_events" USING btree ("type");--> statement-breakpoint
CREATE INDEX "follows_follower_id_idx" ON "follows" USING btree ("follower_id");--> statement-breakpoint
CREATE INDEX "follows_following_id_idx" ON "follows" USING btree ("following_id");--> statement-breakpoint
CREATE INDEX "reviews_user_id_idx" ON "reviews" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "reviews_book_id_idx" ON "reviews" USING btree ("book_id");--> statement-breakpoint
CREATE INDEX "files_owner_user_id_idx" ON "files" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "files_purpose_idx" ON "files" USING btree ("purpose");