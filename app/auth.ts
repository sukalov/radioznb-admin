// auth.ts
import NextAuth, { CredentialsSignin, User } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

import { compare } from 'bcrypt-ts'

import { getUser } from '@/actions/user'
import { authConfig } from 'app/auth.config'

class InvalidLoginError extends CredentialsSignin {
  code = 'Invalid identifier or password'
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        username: {},
        password: {},
      },

      async authorize({ username, password }: any) {
        const user = await getUser(username)
        if (user.length === 0 || !user[0].password)
          throw new InvalidLoginError()
        const passwordsMatch = await compare(password, user[0].password!)
        if (passwordsMatch) {
          return {
            id: user[0].id,
            role: user[0].role,
          } as User
        }
        throw new InvalidLoginError()
      },
    }),
  ],
})

export const { GET, POST } = handlers
