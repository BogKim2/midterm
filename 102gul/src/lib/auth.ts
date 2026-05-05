import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.id && user.email) {
        await db
          .insert(users)
          .values({
            id: user.id,
            email: user.email,
            name: user.name ?? null,
            avatarUrl: user.image ?? null,
          })
          .onConflictDoUpdate({
            target: users.id,
            set: {
              name: user.name ?? null,
              avatarUrl: user.image ?? null,
              updatedAt: new Date().toISOString(),
            },
          })
      }
      return true
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === 'google' && profile?.sub) {
        token.sub = profile.sub
      }
      return token
    },
  },
})
