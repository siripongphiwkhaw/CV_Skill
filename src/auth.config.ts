import type { NextAuthConfig } from 'next-auth';

/**
 * Edge-safe subset of the auth config. Loaded by middleware (which runs on the
 * Edge runtime and cannot use bcrypt/Prisma), so it must stay free of the
 * Credentials provider's `authorize` logic — that lives in `auth.ts` instead.
 */
export const authConfig = {
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);
      const isPublicPage = nextUrl.pathname === '/login' || nextUrl.pathname === '/register';
      if (isPublicPage) return isLoggedIn ? Response.redirect(new URL('/', nextUrl)) : true;
      return isLoggedIn;
    },
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
} satisfies NextAuthConfig;
