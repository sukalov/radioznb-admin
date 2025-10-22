import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

// auth tables
export const users = sqliteTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  username: text("username"),
  password: text("password"),
});

export const sessions = sqliteTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
});

// application tables
export const people = sqliteTable("people", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  telegramAccount: text("telegramAccount"),
});

export const programs = sqliteTable("programs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  hostId: text("hostId").references(() => people.id),
  slug: text("slug").notNull(),
});

export const genres = sqliteTable("genres", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
});

export const recordings = sqliteTable("recordings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  programId: text("programId")
    .notNull()
    .references(() => programs.id),
  episodeTitle: text("episodeTitle").notNull(),
  description: text("description"),
  type: text("type", { enum: ["live", "podcast"] }).notNull(),
  releaseDate: integer("releaseDate", { mode: "timestamp" }).notNull(),
  duration: integer("duration"),
  status: text("status", { enum: ["published", "hidden"] }).notNull(),
  keywords: text("keywords"),
  fileUrl: text("fileUrl").notNull(),
});

export const recordingGenres = sqliteTable(
  "recordingGenres",
  {
    recordingId: text("recordingId")
      .notNull()
      .references(() => recordings.id, { onDelete: "cascade" }),
    genreId: text("genreId")
      .notNull()
      .references(() => genres.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.recordingId, table.genreId] }),
  })
);

export const recordingPeople = sqliteTable(
  "recordingPeople",
  {
    recordingId: text("recordingId")
      .notNull()
      .references(() => recordings.id, { onDelete: "cascade" }),
    personId: text("personId")
      .notNull()
      .references(() => people.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["host", "guest"] }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.recordingId, table.personId] }),
  })
);

export type User = InferSelectModel<typeof users>;
export type Session = InferSelectModel<typeof sessions>;
export type Person = InferSelectModel<typeof people>;
export type Program = InferSelectModel<typeof programs>;
export type Genre = InferSelectModel<typeof genres>;
export type Recording = InferSelectModel<typeof recordings>;
export type RecordingGenre = InferSelectModel<typeof recordingGenres>;
export type RecordingPerson = InferSelectModel<typeof recordingPeople>;

export type UserInsert = InferInsertModel<typeof users>;
export type SessionInsert = InferInsertModel<typeof sessions>;
export type PersonInsert = InferInsertModel<typeof people>;
export type ProgramInsert = InferInsertModel<typeof programs>;
export type GenreInsert = InferInsertModel<typeof genres>;
export type RecordingInsert = InferInsertModel<typeof recordings>;
export type RecordingGenreInsert = InferInsertModel<typeof recordingGenres>;
export type RecordingPersonInsert = InferInsertModel<typeof recordingPeople>;
