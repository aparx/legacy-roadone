import { defaultRole } from '@/modules/schemas/role';
import { prisma } from '@/server/prisma';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session: async ({ session, user }) => {
      const data = await prisma.user.findUnique({
        where: { email: user.email },
        select: { role: true, verified: true },
      });
      return {
        user: {
          ...session.user,
          ...data,
          role: data?.role ?? defaultRole,
          id: user.id,
        },
        expires: session.expires,
      };
    },
  },
  pages: {
    error: '/',
    signIn: '/',
    newUser: '/',
    signOut: '/',
    verifyRequest: '/',
  },
} satisfies NextAuthOptions;

export default NextAuth(authOptions);