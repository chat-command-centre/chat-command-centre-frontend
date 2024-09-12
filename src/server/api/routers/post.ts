import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { posts, votes, tips } from "~/server/db/schema";
import { eq, desc, sql, like } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import Stripe from "stripe";
import { env } from "~/env";
import { sendThankYouEmail } from "~/utils/email";

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

export const postRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z
        .object({ title: z.string().min(1), content: z.string().min(1) })
        .strict(),
    )
    .mutation(async ({ ctx, input }) => {
      const newPost = await ctx.db
        .insert(posts)
        .values({
          name: input.title,
          content: input.content,
          createdById: ctx.session.user.id,
        })
        .returning();
      return newPost[0];
    }),

  getAllPosts: publicProcedure.query(async ({ ctx }) => {
    const allPosts = await ctx.db.query.posts.findMany({
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    });
    return allPosts;
  }),

  vote: protectedProcedure
    .input(
      z
        .object({
          postId: z.number(),
          value: z.number().min(-1).max(1),
        })
        .strict(),
    )
    .mutation(async ({ ctx, input }) => {
      const existingVote = await ctx.db.query.votes.findFirst({
        where:
          eq(votes.postId, input.postId) &&
          eq(votes.userId, ctx.session.user.id),
      });

      if (existingVote) {
        if (existingVote.value === input.value) {
          // Remove vote if it's the same
          await ctx.db.delete(votes).where(eq(votes.id, existingVote.id));
        } else {
          // Update vote if it's different
          await ctx.db
            .update(votes)
            .set({ value: input.value })
            .where(eq(votes.id, existingVote.id));
        }
      } else {
        // Create new vote
        await ctx.db.insert(votes).values({
          postId: input.postId,
          userId: ctx.session.user.id,
          value: input.value,
        });
      }

      return { success: true };
    }),

  getPostById: publicProcedure
    .input(z.object({ id: z.number() }).strict())
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.query.posts.findFirst({
        where: eq(posts.id, input.id),
        with: {
          createdBy: true,
          votes: true,
          tips: true,
        },
      });

      if (!post) return null;

      const voteCount = post.votes.reduce((acc, vote) => acc + vote.value, 0);
      const tipCount = post.tips.length;
      const score = voteCount + tipCount * 10;
      const userVote =
        post.votes.find((vote) => vote.userId === ctx.session?.user?.id)
          ?.value || 0;

      return {
        ...post,
        voteCount,
        tipCount,
        score,
        userVote,
        tipsEnabled:
          post.createdBy.tipsEnabled && !!post.createdBy.stripeAccountId,
      };
    }),

  tip: publicProcedure
    .input(
      z
        .object({
          postId: z.number(),
          amount: z.number().min(1),
          email: z.string().email().optional(),
        })
        .strict(),
    )
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.query.posts.findFirst({
        where: eq(posts.id, input.postId),
        with: { createdBy: true },
      });

      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      if (!post.createdBy.tipsEnabled || !post.createdBy.stripeAccountId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tips are not enabled for this user",
        });
      }

      const platformFee = Math.round(
        input.amount * (env.PLATFORM_FEE_PERCENTAGE / 100),
      );
      const authorAmount = input.amount - platformFee;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: input.amount,
        currency: "usd",
        application_fee_amount: platformFee,
        transfer_data: {
          destination: post.createdBy.stripeAccountId!,
        },
      });

      await ctx.db.insert(tips).values({
        postId: input.postId,
        userId: ctx.session?.user?.id ?? null,
        amount: input.amount,
        email: input.email,
      });

      if (input.email) {
        await sendThankYouEmail(input.email, post.name, input.amount);
      }

      return { clientSecret: paymentIntent.client_secret };
    }),

  getUserPosts: protectedProcedure.query(async ({ ctx }) => {
    const userPosts = await ctx.db.query.posts.findMany({
      where: eq(posts.createdById, ctx.session.user.id),
      orderBy: [desc(posts.createdAt)],
      with: {
        votes: true,
        tips: true,
      },
    });

    return userPosts.map((post) => ({
      ...post,
      voteCount: post.votes.reduce((acc, vote) => acc + vote.value, 0),
      tipCount: post.tips.length,
      score:
        post.votes.reduce((acc, vote) => acc + vote.value, 0) +
        post.tips.length * 10,
    }));
  }),

  search: publicProcedure
    .input(z.object({ query: z.string() }).strict())
    .query(async ({ ctx, input }) => {
      const searchResults = await ctx.db.query.posts.findMany({
        where: sql`${posts.name} ILIKE ${`%${input.query}%`} OR ${posts.content} ILIKE ${`%${input.query}%`}`,
        orderBy: [desc(posts.createdAt)],
        with: {
          createdBy: true,
          votes: true,
          tips: true,
        },
      });

      return searchResults.map((post) => ({
        ...post,
        voteCount: post.votes.reduce((acc, vote) => acc + vote.value, 0),
        tipCount: post.tips.length,
        score:
          post.votes.reduce((acc, vote) => acc + vote.value, 0) +
          post.tips.length * 10,
      }));
    }),
});
