import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'

const PROTECTED_PAGES = ['/today', '/feed', '/write', '/me']
const PROTECTED_API = ['/api/quote', '/api/saved', '/api/posts']

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const { pathname } = nextUrl

      const isProtectedPage = PROTECTED_PAGES.some((p) => pathname.startsWith(p))
      const isProtectedApi = PROTECTED_API.some((p) => pathname.startsWith(p))

      if (isProtectedPage || isProtectedApi) {
        return isLoggedIn
      }
      return true
    },
  },
}
