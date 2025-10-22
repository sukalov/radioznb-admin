"use server";

import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import {
  recordings,
  recordingGenres,
  recordingPeople,
  type Recording,
} from "@/db/schema";

// ============================================================================
// types
// ============================================================================

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export type RecordingFormData = {
  programId: string;
  episodeTitle: string;
  description?: string;
  type: "live" | "podcast";
  releaseDate: Date;
  duration?: number;
  status: "published" | "hidden";
  keywords?: string;
  genreIds: string[];
  hosts: string[];
  guests: string[];
  fileUrl: string;
};

// ============================================================================
// complex form actions
// ============================================================================

/**
 * creates a new recording with all related genres and people
 */
export async function createRecordingWithRelations(
  formData: RecordingFormData
): Promise<ActionResult<{ id: string }>> {
  try {
    // validate no person is both host and guest
    const allPeople = [...formData.hosts, ...formData.guests];
    const uniquePeople = new Set(allPeople);
    if (allPeople.length !== uniquePeople.size) {
      return {
        success: false,
        error: "человек не может быть одновременно ведущим и гостем",
      };
    };

    // create recording
    const [recording] = await db
      .insert(recordings)
      .values({
        programId: formData.programId,
        episodeTitle: formData.episodeTitle,
        description: formData.description || null,
        type: formData.type,
        releaseDate: formData.releaseDate,
        duration: formData.duration || null,
        status: formData.status,
        keywords: formData.keywords || null,
        fileUrl: formData.fileUrl,
      })
      .returning();

    // add genres
    if (formData.genreIds.length > 0) {
      await db.insert(recordingGenres).values(
        formData.genreIds.map((genreId) => ({
          recordingId: recording.id,
          genreId,
        }))
      );
    }

    // add hosts
    if (formData.hosts.length > 0) {
      await db.insert(recordingPeople).values(
        formData.hosts.map((personId) => ({
          recordingId: recording.id,
          personId,
          role: "host" as const,
        }))
      );
    }

    // add guests
    if (formData.guests.length > 0) {
      await db.insert(recordingPeople).values(
        formData.guests.map((personId) => ({
          recordingId: recording.id,
          personId,
          role: "guest" as const,
        }))
      );
    }

    revalidatePath("/admin/recordings");
    return { success: true, data: { id: recording.id } };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "не удалось создать запись",
    };
  }
}

/**
 * updates an existing recording with all related genres and people
 */
export async function updateRecordingWithRelations(
  id: string,
  formData: RecordingFormData
): Promise<ActionResult> {
  try {
    // validate no person is both host and guest
    const allPeople = [...formData.hosts, ...formData.guests];
    const uniquePeople = new Set(allPeople);
    if (allPeople.length !== uniquePeople.size) {
      return {
        success: false,
        error: "человек не может быть одновременно ведущим и гостем",
      };
    }

    // update recording
    await db
      .update(recordings)
      .set({
        programId: formData.programId,
        episodeTitle: formData.episodeTitle,
        description: formData.description || null,
        type: formData.type,
        releaseDate: formData.releaseDate,
        duration: formData.duration || null,
        status: formData.status,
        keywords: formData.keywords || null,
        fileUrl: formData.fileUrl,
      })
      .where(eq(recordings.id, id));

    // delete all existing genres and people
    await db.delete(recordingGenres).where(eq(recordingGenres.recordingId, id));
    await db.delete(recordingPeople).where(eq(recordingPeople.recordingId, id));

    // add genres
    if (formData.genreIds.length > 0) {
      await db.insert(recordingGenres).values(
        formData.genreIds.map((genreId) => ({
          recordingId: id,
          genreId,
        }))
      );
    }

    // add hosts
    if (formData.hosts.length > 0) {
      await db.insert(recordingPeople).values(
        formData.hosts.map((personId) => ({
          recordingId: id,
          personId,
          role: "host" as const,
        }))
      );
    }

    // add guests
    if (formData.guests.length > 0) {
      await db.insert(recordingPeople).values(
        formData.guests.map((personId) => ({
          recordingId: id,
          personId,
          role: "guest" as const,
        }))
      );
    }

    revalidatePath("/recordings");
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "не удалось обновить запись",
    };
  }
}

/**
 * gets a complete recording with all related data for form editing
 */
export async function getRecordingForForm(id: string): Promise<
  ActionResult<{
    recording: Recording;
    genreIds: string[];
    hosts: string[];
    guests: string[];
  }>
> {
  try {
    const [recording] = await db
      .select()
      .from(recordings)
      .where(eq(recordings.id, id));

    if (!recording) {
      return {
        success: false,
        error: "запись не найдена",
      };
    }

    // get genres
    const genres = await db
      .select({ genreId: recordingGenres.genreId })
      .from(recordingGenres)
      .where(eq(recordingGenres.recordingId, id));

    // get people
    const people = await db
      .select({
        personId: recordingPeople.personId,
        role: recordingPeople.role,
      })
      .from(recordingPeople)
      .where(eq(recordingPeople.recordingId, id));

    const hosts = people
      .filter((p) => p.role === "host")
      .map((p) => p.personId);
    const guests = people
      .filter((p) => p.role === "guest")
      .map((p) => p.personId);

    return {
      success: true,
      data: {
        recording,
        genreIds: genres.map((g) => g.genreId),
        hosts,
        guests,
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "не удалось загрузить запись",
    };
  }
}

/**
 * deletes a recording and all its relations (cascade handled by db)
 */
export async function deleteRecordingWithRelations(
  id: string
): Promise<ActionResult> {
  try {
    await db.delete(recordings).where(eq(recordings.id, id));

    revalidatePath("/recordings");
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "не удалось удалить запись",
    };
  }
}
