import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "~/server/auth";
import bcrypt from "bcrypt";

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
});
