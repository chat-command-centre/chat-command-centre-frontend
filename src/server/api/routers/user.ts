import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { hashPassword } from "~/server/auth";
import bcrypt from "bcrypt";
import { follows } from "~/server/db/schema";

export const userRouter = createTRPCRouter({
  getUser: protectedProcedure.query(async ({ ctx }) => {
    const user = await db.query.users.findFirst({
      where: eq(users.id, ctx.session.user.id),
    });
    return user;
  }),

  updateUser: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        password: z.string().optional(),
        newPassword: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const updateData: Partial<typeof users.$inferInsert> = {};

      if (input.name) updateData.name = input.name;
      if (input.email) updateData.email = input.email;

      if (input.password && input.newPassword) {
        const user = await db.query.users.findFirst({
          where: eq(users.id, userId),
        });
        if (!user || !user.hashedPassword) {
          throw new Error("User not found or password not set");
        }

        const isPasswordValid = await bcrypt.compare(
          input.password,
          user.hashedPassword,
        );
        if (!isPasswordValid) {
          throw new Error("Invalid current password");
        }

        updateData.hashedPassword = await hashPassword(input.newPassword);
      }

      await db.update(users).set(updateData).where(eq(users.id, userId));

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
});
