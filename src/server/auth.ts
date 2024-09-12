import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { env } from "~/env";
import { db } from "~/server/db";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from "~/server/db/schema";
import EmailProvider from "next-auth/providers/email";
import { transportConfig } from "~/utils/email";
import FacebookProvider from "next-auth/providers/facebook";
import AzureADProvider from "next-auth/providers/azure-ad";
import DiscordProvider from "next-auth/providers/discord";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }) as Adapter,
  providers: [
    EmailProvider({
      server: transportConfig,
      from: env.EMAIL_FROM,
      generateVerificationToken: () => {
        return crypto.randomBytes(32).toString("hex");
      },
      maxAge: 60 * 60 * 24, // 1 day
      secret: env.NEXTAUTH_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(
        credentials: { email: string; password: string } | undefined,
      ) {
        if (!credentials) {
          return null;
        }
        const results = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email));
        if (results.length === 0) {
          return null;
        }
        const user = results[0]!;
        if (user.hashedPassword) {
          const passwordMatch = await bcrypt.compare(
            credentials!.password,
            user.hashedPassword,
          );
          if (passwordMatch) {
            return user;
          }
        }
        return null;
      },
      ...(env.AZURE_AD_CLIENT_ID &&
      env.AZURE_AD_CLIENT_SECRET &&
      env.AZURE_AD_TENANT_ID
        ? [
            AzureADProvider({
              clientId: env.AZURE_AD_CLIENT_ID,
              clientSecret: env.AZURE_AD_CLIENT_SECRET,
              tenantId: env.AZURE_AD_TENANT_ID,
            }),
          ]
        : []),
      ...(env.DISCORD_CLIENT_ID && env.DISCORD_CLIENT_SECRET
        ? [
            DiscordProvider({
              clientId: env.DISCORD_CLIENT_ID,
              clientSecret: env.DISCORD_CLIENT_SECRET,
            }),
          ]
        : []),
      ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
        ? [
            GoogleProvider({
              clientId: env.GOOGLE_CLIENT_ID,
              clientSecret: env.GOOGLE_CLIENT_SECRET,
            }),
          ]
        : []),
      ...(env.APPLE_ID && env.APPLE_CLIENT_SECRET
        ? [
            AppleProvider({
              clientId: env.APPLE_ID,
              clientSecret: env.APPLE_CLIENT_SECRET,
            }),
          ]
        : []),
      ...(env.FACEBOOK_CLIENT_ID && env.FACEBOOK_CLIENT_SECRET
        ? [
            FacebookProvider({
              clientId: env.FACEBOOK_CLIENT_ID,
              clientSecret: env.FACEBOOK_CLIENT_SECRET,
            }),
          ]
        : []),
    }),
  ],
  pages: {
    signIn: "/signin",
  },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};

export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Add this helper function for hashing passwords
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};
