'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
// import { revalidatePath } from 'next/cache';
import { genSaltSync, hashSync } from "bcrypt-ts";


export async function getUser(username: string) {
	return await db.select().from(users).where(eq(users.username, username));
}

export async function createUser(username: string, password: string) {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  return await db.insert(users).values({ username: username, password: hash });
}
