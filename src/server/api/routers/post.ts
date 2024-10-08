import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { posts, votes, tips, users } from "~/server/db/schema";
import { eq, desc, sql, like } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import Stripe from "stripe";
import { env } from "~/env";
import { sendEmail } from "~/utils/email";

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

export const postRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z
        .object({
          title: z.string().min(1),
          content: z.string(), // Remove the .min(1) if you want to allow empty content
        })
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
        const subject = "Thank You for Your Tip!";
        const html = `
            <h1>Thank You for Your Tip!</h1>
            <p>We appreciate your generous tip of $${(input.amount / 100).toFixed(2)} for the post "${post.name}".</p>
            <p>Your support helps our authors create more awesome content!</p>
            <p>Thank you for being a part of our community!</p>
          `;

        await sendEmail({ to: input.email, subject, html });
      }

      return { clientSecret: paymentIntent.client_secret };
    }),

  getUserPosts: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.username, input.username),
      });

      if (!user) {
        throw new Error("User not found");
      }

      const userPosts = await ctx.db.query.posts.findMany({
        where: eq(posts.createdById, user.id),
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

  updatePost: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1),
        content: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.query.posts.findFirst({
        where: eq(posts.id, input.id),
      });

      if (!post || post.createdById !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to edit this post",
        });
      }

      const updatedPost = await ctx.db
        .update(posts)
        .set({
          name: input.name,
          content: input.content,
          updatedAt: new Date(),
        })
        .where(eq(posts.id, input.id))
        .returning();

      return updatedPost[0];
    }),

  deletePost: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.query.posts.findFirst({
        where: eq(posts.id, input.postId),
      });

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      if (post.createdById !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to delete this post",
        });
      }

      // Delete associated votes and tips
      await ctx.db.delete(votes).where(eq(votes.postId, input.postId));
      await ctx.db.delete(tips).where(eq(tips.postId, input.postId));

      // Delete the post
      await ctx.db.delete(posts).where(eq(posts.id, input.postId));

      return { success: true };
    }),
});
