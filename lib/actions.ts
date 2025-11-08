"use server";

import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import {
  users,
  sessions,
  people,
  programs,
  genres,
  recordings,
  recordingGenres,
  recordingPeople,
  RecordingInsert,
  ProgramInsert,
  PersonInsert,
  UserInsert,
  GenreInsert,
} from "@/db/schema";

// ============================================================================
// types
// ============================================================================

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// ============================================================================
// users
// ============================================================================

export async function createUser(
  data: UserInsert,
): Promise<ActionResult<{ id: string }>> {
  try {
    const [user] = await db.insert(users).values(data).returning();

    revalidatePath("/admin/users");
    return { success: true, data: { id: user.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "failed to create user",
    };
  }
}

export async function updateUser(
  id: string,
  data: UserInsert,
): Promise<ActionResult> {
  try {
    await db.update(users).set(data).where(eq(users.id, id));

    revalidatePath("/admin/users");
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "failed to update user",
    };
  }
}

export async function deleteUser(id: string): Promise<ActionResult> {
  try {
    await db.delete(users).where(eq(users.id, id));

    revalidatePath("/admin/users");
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "failed to delete user",
    };
  }
}

export async function getUsers() {
  try {
    const allUsers = await db.select().from(users);
    return { success: true, data: allUsers };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "failed to fetch users",
    };
  }
}

export async function getUserById(id: string) {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return { success: true, data: user };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "failed to fetch user",
    };
  }
}

// ============================================================================
// sessions
// ============================================================================

export async function createSession(data: {
  sessionToken: string;
  userId: string;
  expires: Date;
}): Promise<ActionResult> {
  try {
    await db.insert(sessions).values(data);
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "failed to create session",
    };
  }
}

export async function deleteSession(
  sessionToken: string,
): Promise<ActionResult> {
  try {
    await db.delete(sessions).where(eq(sessions.sessionToken, sessionToken));
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "failed to delete session",
    };
  }
}

export async function getSessionByToken(sessionToken: string) {
  try {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.sessionToken, sessionToken));
    return { success: true, data: session };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "failed to fetch session",
    };
  }
}

// ============================================================================
// people
// ============================================================================

export async function createPerson(
  data: PersonInsert,
): Promise<ActionResult<{ id: string }>> {
  try {
    const [person] = await db.insert(people).values(data).returning();

    revalidatePath("/admin/people");
    return { success: true, data: { id: person.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "failed to create person",
    };
  }
}

export async function updatePerson(
  id: string,
  data: PersonInsert,
): Promise<ActionResult> {
  try {
    await db.update(people).set(data).where(eq(people.id, id));

    revalidatePath("/admin/people");
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "failed to update person",
    };
  }
}

export async function deletePerson(id: string): Promise<ActionResult> {
  try {
    await db.delete(people).where(eq(people.id, id));

    revalidatePath("/admin/people");
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "failed to delete person",
    };
  }
}

export async function getPeople() {
  try {
    const allPeople = await db.select().from(people);
    return { success: true, data: allPeople };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "failed to fetch people",
    };
  }
}

export async function getPersonById(id: string) {
  try {
    const [person] = await db.select().from(people).where(eq(people.id, id));
    return { success: true, data: person };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "failed to fetch person",
    };
  }
}

// ============================================================================
// programs
// ============================================================================

export async function createProgram(
  data: ProgramInsert,
): Promise<ActionResult<{ id: string }>> {
  try {
    const [program] = await db.insert(programs).values(data).returning();

    revalidatePath("/admin/programs");
    return { success: true, data: { id: program.id } };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "failed to create program",
    };
  }
}

export async function updateProgram(
  id: string,
  data: ProgramInsert,
): Promise<ActionResult> {
  try {
    await db.update(programs).set(data).where(eq(programs.id, id));

    revalidatePath("/admin/programs");
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "failed to update program",
    };
  }
}

export async function deleteProgram(id: string): Promise<ActionResult> {
  try {
    await db.delete(programs).where(eq(programs.id, id));

    revalidatePath("/admin/programs");
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "failed to delete program",
    };
  }
}

export async function getPrograms() {
  try {
    const allPrograms = await db
      .select({
        id: programs.id,
        name: programs.name,
        description: programs.description,
        slug: programs.slug,
        hostId: programs.hostId,
        createdAt: programs.createdAt,
        host: people,
      })
      .from(programs)
      .leftJoin(people, eq(programs.hostId, people.id));
    return { success: true, data: allPrograms };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "failed to fetch programs",
    };
  }
}

export async function getProgramById(id: string) {
  try {
    const [program] = await db
      .select()
      .from(programs)
      .where(eq(programs.id, id));
    return { success: true, data: program };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "failed to fetch program",
    };
  }
}

export async function getProgramBySlug(slug: string) {
  try {
    const [program] = await db
      .select()
      .from(programs)
      .where(eq(programs.slug, slug));
    return { success: true, data: program };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "failed to fetch program",
    };
  }
}

// ============================================================================
// genres
// ============================================================================

export async function createGenre(
  data: GenreInsert,
): Promise<ActionResult<{ id: string }>> {
  try {
    const [genre] = await db.insert(genres).values(data).returning();

    revalidatePath("/admin/genres");
    return { success: true, data: { id: genre.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "failed to create genre",
    };
  }
}

export async function updateGenre(
  id: string,
  data: GenreInsert,
): Promise<ActionResult> {
  try {
    await db.update(genres).set(data).where(eq(genres.id, id));

    revalidatePath("/admin/genres");
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "failed to update genre",
    };
  }
}

export async function deleteGenre(id: string): Promise<ActionResult> {
  try {
    await db.delete(genres).where(eq(genres.id, id));

    revalidatePath("/admin/genres");
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "failed to delete genre",
    };
  }
}

export async function getGenres() {
  try {
    const allGenres = await db.select().from(genres);
    return { success: true, data: allGenres };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "failed to fetch genres",
    };
  }
}

export async function getGenreById(id: string) {
  try {
    const [genre] = await db.select().from(genres).where(eq(genres.id, id));
    return { success: true, data: genre };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "failed to fetch genre",
    };
  }
}

// ============================================================================
// recordings
// ============================================================================

export async function createRecording(
  data: RecordingInsert,
): Promise<ActionResult<{ id: string }>> {
  try {
    const [recording] = await db.insert(recordings).values(data).returning();

    revalidatePath("/admin/recordings");
    return { success: true, data: { id: recording.id } };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "failed to create recording",
    };
  }
}

export async function updateRecording(
  id: string,
  data: RecordingInsert,
): Promise<ActionResult> {
  try {
    await db.update(recordings).set(data).where(eq(recordings.id, id));

    revalidatePath("/admin/recordings");
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "failed to update recording",
    };
  }
}

export async function deleteRecording(id: string): Promise<ActionResult> {
  try {
    await db.delete(recordings).where(eq(recordings.id, id));

    revalidatePath("/admin/recordings");
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "failed to delete recording",
    };
  }
}

export async function getRecordings() {
  try {
    const allRecordings = await db
      .select({
        id: recordings.id,
        programId: recordings.programId,
        episodeTitle: recordings.episodeTitle,
        description: recordings.description,
        type: recordings.type,
        releaseDate: recordings.releaseDate,
        duration: recordings.duration,
        status: recordings.status,
        keywords: recordings.keywords,
        fileUrl: recordings.fileUrl,
        addedAt: recordings.addedAt,
        program: programs.name,
      })
      .from(recordings)
      .leftJoin(programs, eq(recordings.programId, programs.id));

    // Get people and genres for each recording
    const recordingsWithRelations = await Promise.all(
      allRecordings.map(async (recording) => {
        // Get people
        const peopleList = await db
          .select({
            personName: people.name,
            role: recordingPeople.role,
          })
          .from(recordingPeople)
          .innerJoin(people, eq(recordingPeople.personId, people.id))
          .where(eq(recordingPeople.recordingId, recording.id));

        const peopleNames = peopleList.map((p) => p.personName).join(", ");

        // Get genres
        const genresList = await db
          .select({
            genreId: genres.id,
            genreName: genres.name,
          })
          .from(recordingGenres)
          .innerJoin(genres, eq(recordingGenres.genreId, genres.id))
          .where(eq(recordingGenres.recordingId, recording.id));

        const genreIds = genresList.map((g) => g.genreId);

        return {
          ...recording,
          peopleNames,
          genreIds,
        };
      })
    );

    return { success: true, data: recordingsWithRelations };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "failed to fetch recordings",
    };
  }
}

export async function getRecordingById(id: string) {
  try {
    const [recording] = await db
      .select()
      .from(recordings)
      .where(eq(recordings.id, id));
    return { success: true, data: recording };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "failed to fetch recording",
    };
  }
}

export async function getRecordingsByProgramId(programId: string) {
  try {
    const programRecordings = await db
      .select()
      .from(recordings)
      .where(eq(recordings.programId, programId));
    return { success: true, data: programRecordings };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "failed to fetch recordings",
    };
  }
}

export async function getRecordingsByStatus(status: "published" | "hidden") {
  try {
    const statusRecordings = await db
      .select()
      .from(recordings)
      .where(eq(recordings.status, status));
    return { success: true, data: statusRecordings };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "failed to fetch recordings",
    };
  }
}

// ============================================================================
// recording genres (junction table)
// ============================================================================

export async function addGenreToRecording(
  recordingId: string,
  genreId: string,
): Promise<ActionResult> {
  try {
    await db.insert(recordingGenres).values({
      recordingId,
      genreId,
    });

    revalidatePath("/admin/recordings");
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "failed to add genre to recording",
    };
  }
}

export async function removeGenreFromRecording(
  recordingId: string,
  genreId: string,
): Promise<ActionResult> {
  try {
    await db
      .delete(recordingGenres)
      .where(
        and(
          eq(recordingGenres.recordingId, recordingId),
          eq(recordingGenres.genreId, genreId),
        ),
      );

    revalidatePath("/admin/recordings");
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "failed to remove genre from recording",
    };
  }
}

export async function getGenresForRecording(recordingId: string) {
  try {
    const recordingGenresList = await db
      .select({
        genreId: recordingGenres.genreId,
        genreName: genres.name,
      })
      .from(recordingGenres)
      .innerJoin(genres, eq(recordingGenres.genreId, genres.id))
      .where(eq(recordingGenres.recordingId, recordingId));

    return { success: true, data: recordingGenresList };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "failed to fetch genres",
    };
  }
}

export async function getRecordingsForGenre(genreId: string) {
  try {
    const genreRecordings = await db
      .select({
        recordingId: recordingGenres.recordingId,
        episodeTitle: recordings.episodeTitle,
        airDate: recordings.releaseDate,
        status: recordings.status,
      })
      .from(recordingGenres)
      .innerJoin(recordings, eq(recordingGenres.recordingId, recordings.id))
      .where(eq(recordingGenres.genreId, genreId));

    return { success: true, data: genreRecordings };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "failed to fetch recordings",
    };
  }
}

// ============================================================================
// recording people (junction table)
// ============================================================================

export async function addPersonToRecording(
  recordingId: string,
  personId: string,
  role: "host" | "guest",
): Promise<ActionResult> {
  try {
    await db.insert(recordingPeople).values({
      recordingId,
      personId,
      role,
    });

    revalidatePath("/admin/recordings");
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "failed to add person to recording",
    };
  }
}

export async function removePersonFromRecording(
  recordingId: string,
  personId: string,
): Promise<ActionResult> {
  try {
    await db
      .delete(recordingPeople)
      .where(
        and(
          eq(recordingPeople.recordingId, recordingId),
          eq(recordingPeople.personId, personId),
        ),
      );

    revalidatePath("/admin/recordings");
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "failed to remove person from recording",
    };
  }
}

export async function updatePersonRoleInRecording(
  recordingId: string,
  personId: string,
  role: "host" | "guest",
): Promise<ActionResult> {
  try {
    await db
      .update(recordingPeople)
      .set({ role })
      .where(
        and(
          eq(recordingPeople.recordingId, recordingId),
          eq(recordingPeople.personId, personId),
        ),
      );

    revalidatePath("/admin/recordings");
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "failed to update role",
    };
  }
}

export async function getPeopleForRecording(recordingId: string) {
  try {
    const recordingPeopleList = await db
      .select({
        personId: recordingPeople.personId,
        personName: people.name,
        telegramAccount: people.telegramAccount,
        role: recordingPeople.role,
      })
      .from(recordingPeople)
      .innerJoin(people, eq(recordingPeople.personId, people.id))
      .where(eq(recordingPeople.recordingId, recordingId));

    return { success: true, data: recordingPeopleList };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "failed to fetch people",
    };
  }
}

export async function getRecordingsForPerson(personId: string) {
  try {
    const personRecordings = await db
      .select({
        recordingId: recordingPeople.recordingId,
        episodeTitle: recordings.episodeTitle,
        airDate: recordings.releaseDate,
        status: recordings.status,
        role: recordingPeople.role,
      })
      .from(recordingPeople)
      .innerJoin(recordings, eq(recordingPeople.recordingId, recordings.id))
      .where(eq(recordingPeople.personId, personId));

    return { success: true, data: personRecordings };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "failed to fetch recordings",
    };
  }
}
