import { NextAuthOptions } from 'next-auth';
import type { User } from 'next-auth';
import type { AdapterUser } from 'next-auth/adapters';
import type { JWT } from 'next-auth/jwt';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '../mongodb';
import { verifyPassword } from './hash';
import { getUserByEmail } from '@/services/user.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const process: any;

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await getUserByEmail(credentials.email);
        if (!user || !user.hashedPassword) {
          return null;
        }

        const isValid = await verifyPassword(credentials.password, user.hashedPassword);
        if (!isValid) {
          return null;
        }

          return {
            id: user._id!.toString(),
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            role: user.role,
            phone: user.phone,
          };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
  async jwt({ token, user }: { token: JWT; user?: User | AdapterUser }) {
      if (user) {
        if ('id' in user) token.id = user.id;
        if ('name' in user) token.name = user.name;
        if ('avatar' in user) token.avatar = user.avatar;
        if ('role' in user) token.role = user.role;
        if ('phone' in user) token.phone = user.phone;
        if ('email' in user) token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).id = token.id as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).avatar = token.avatar as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).role = token.role as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).phone = token.phone as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};