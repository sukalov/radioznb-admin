'use server'

import { getUser, createUser } from '@/actions/user'
import { redirect } from 'next/navigation'

export async function register(data: {
  username: string
  password: string
  role?: 'admin' | 'user'
}) {
  let user = await getUser(data.username)

  if (user.length > 0) {
    return { message: 'A user with this identifier already exists' }
  } else {
    await createUser(data.username, data.password)
    redirect('/login')
  }
}
