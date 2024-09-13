import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import { users, posts, votes, tips } from "~/server/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { hashPassword } from "~/server/auth";
import bcrypt from "bcrypt";
import { follows } from "~/server/db/schema";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  getUser: protectedProcedure.query(async ({ ctx }) => {
    const user = await db.query.users.findFirst({
      where: eq(users.id, ctx.session.user.id),
    });
    return user;
  }),

  updateUser: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(users)
        .set({ name: input.name })
        .where(eq(users.id, ctx.session.user.id));
      return { success: true };
    }),

  updateEmail: protectedProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(users)
        .set({ email: input.email, emailVerified: null })
        .where(eq(users.id, ctx.session.user.id));
      // TODO: Send email verification
      return { success: true };
    }),

  updatePassword: protectedProcedure
    .input(z.object({ currentPassword: z.string(), newPassword: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.session.user.id),
      });

      if (!user || !user.hashedPassword) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const isValid = await bcrypt.compare(
        input.currentPassword,
        user.hashedPassword,
      );
      if (!isValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid current password",
        });
      }

      const newHashedPassword = await hashPassword(input.newPassword);
      await ctx.db
        .update(users)
        .set({ hashedPassword: newHashedPassword })
        .where(eq(users.id, ctx.session.user.id));

      return { success: true };
    }),

  deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
    // TODO: Implement account deletion logic
    // This should include deleting or anonymizing all user data
    return { success: true };
  }),

  connectStripe: protectedProcedure.mutation(async ({ ctx }) => {
    // TODO: Implement Stripe connect logic
    return { success: true };
  }),

  acceptConsentAgreement: protectedProcedure.mutation(async ({ ctx }) => {
    await db
      .update(users)
      .set({ hasAcceptedConsent: true })
      .where(eq(users.id, ctx.session.user.id));
    return { success: true };
  }),

  followUser: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db.insert(follows).values({
        followerId: ctx.session.user.id,
        followingId: input.userId,
      });
      return { success: true };
    }),

  unfollowUser: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .delete(follows)
        .where(
          and(
            eq(follows.followerId, ctx.session.user.id),
            eq(follows.followingId, input.userId),
          ),
        );
      return { success: true };
    }),

  getFollowersCount: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const count = await db
        .select({ count: sql<number>`count(*)` })
        .from(follows)
        .where(eq(follows.followingId, input.userId));
      return count[0]?.count ?? 0;
    }),

  getFollowingCount: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const count = await db
        .select({ count: sql<number>`count(*)` })
        .from(follows)
        .where(eq(follows.followerId, input.userId));
      return count[0]?.count ?? 0;
    }),

  isFollowing: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const follow = await db.query.follows.findFirst({
        where: and(
          eq(follows.followerId, ctx.session.user.id),
          eq(follows.followingId, input.userId),
        ),
      });
      return !!follow;
    }),

  getUserByUsername: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input }) => {
      const user = await db.query.users.findFirst({
        where: eq(users.username, input.username),
      });
      return user;
    }),

  exportData: protectedProcedure.mutation(async ({ ctx }) => {
    const userData = await db.query.users.findFirst({
      where: eq(users.id, ctx.session.user.id),
      with: {
        posts: true,
        votes: true,
        tips: true,
      },
    });

    // You might want to format this data or generate a file for download
    return userData;
  }),
});
