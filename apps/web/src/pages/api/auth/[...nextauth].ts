import { prisma } from '@/server/prisma';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    error: '/',
    signIn: '/',
    newUser: '/',
    signOut: '/',
    verifyRequest: '/',
  },
} satisfies NextAuthOptions;

export default NextAuth(authOptions);
