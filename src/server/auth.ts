import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
  DefaultUser,
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
  loginAttempts,
} from "~/server/db/schema";
import EmailProvider from "next-auth/providers/email";
import { transportConfig } from "~/utils/email";
import FacebookProvider from "next-auth/providers/facebook";
import AzureADProvider from "next-auth/providers/azure-ad";
import DiscordProvider from "next-auth/providers/discord";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import Stripe from 'stripe';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-09-30.acacia',
});

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
      username: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    username: string;
    name: string | null;
    email: string;
    image: string | null;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.id as string,
        username: token.username as string,
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
      async authorize(credentials, req) {
        console.log("Authorizing user with credentials: ", credentials);
        if (!credentials) {
          console.log("No credentials provided, returning null.");
          return null;
        }
        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email),
        });
        console.log("User found: ", user);

        const success =
          user && user.hashedPassword
            ? await bcrypt.compare(credentials.password, user.hashedPassword)
            : false;
        console.log("Login success: ", success);

        // Log login attempt (development only)
        if (env.NODE_ENV === "development") {
          console.log("Logging login attempt...");
          await db.insert(loginAttempts).values({
            email: credentials.email,
            success,
            ipAddress: req.headers
              ? ((req.headers["x-forwarded-for"] as string) ?? "unknown")
              : "unknown",
            userAgent: req.headers
              ? (req.headers["user-agent"] ?? "unknown")
              : "unknown",
          });
          console.log("Login attempt logged.");
        }

        if (success && user) {
          // Return only the necessary User properties
          console.log("Returning user data: ", {
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            image: user.image,
          });
          return {
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            image: user.image,
          };
        }
        console.log("Login failed, returning null.");
        return null;
      },
    }),
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
  ],
  pages: {
    signIn: "/signin",
    signOut: "/signin", // Redirect to signin page after logout
    error: "/signin",
    verifyRequest: "/auth/verify-request",
  },
  session: {
    strategy: "jwt",
  },
  events: {
    signOut: async ({ session, token }) => {
      // You can add any cleanup logic here if needed
    },
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

async function createUser(userData: UserInsert) {
  // ... create user in database ...

  // Create a Stripe customer
  const customer = await stripe.customers.create({
    email: userData.email,
    metadata: {
      userId: user.id,
    },
  });

  // Update user with Stripe customer ID
  await db.update(users)
    .set({ stripeCustomerId: customer.id })
    .where(eq(users.id, user.id));

  // ... rest of the code ...
}