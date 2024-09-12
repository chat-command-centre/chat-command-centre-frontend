import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, generateVerificationToken } from "~/server/auth";
import { db } from "~/server/db";
import { sendEmail } from "~/utils/email";
import { env } from "~/env";
import { loginAttempts } from "~/server/db/schema";

export const authRouter = createTRPCRouter({
  signUp: publicProcedure
    .input(
      z
        .object({
          name: z.string(),
          email: z.string().email(),
          password: z.string().min(8),
        })
        .strict(),
    )
    .mutation(async ({ input }) => {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email));
      if (result.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with this email already exists",
        });
      }

      const hashedPassword = await hashPassword(input.password);
      const verificationToken = generateVerificationToken();
      const newUser = await db
        .insert(users)
        .values({
          name: input.name,
          email: input.email,
          hashedPassword,
          resetToken: verificationToken, // Use resetToken for email verification
          resetTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        })
        .returning();

      const verificationUrl = `${env.NEXTAUTH_URL}/verify-email?email=${encodeURIComponent(input.email)}&token=${verificationToken}`;
      await sendEmail({
        to: input.email,
        subject: "Verify your email",
        html: `Click <a href="${verificationUrl}">here</a> to verify your email.`,
      });

      return { success: true, user: newUser[0] };
    }),

  resendEmailVerificationCode: publicProcedure
    .input(z.object({ email: z.string().email() }).strict())
    .mutation(async ({ input }) => {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (result.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const user = result[0]!;
      const verificationToken = generateVerificationToken();
      await db
        .update(users)
        .set({
          resetToken: verificationToken,
          resetTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        })
        .where(eq(users.id, user.id));

      const verificationUrl = `${env.NEXTAUTH_URL}/verify-email?email=${encodeURIComponent(input.email)}&token=${verificationToken}`;
      await sendEmail({
        to: input.email,
        subject: "Verify your email",
        html: `Click <a href="${verificationUrl}">here</a> to verify your email.`,
      });

      return { success: true };
    }),

  submitEmailVerificationCode: publicProcedure
    .input(z.object({ email: z.string().email(), token: z.string() }).strict())
    .mutation(async ({ input }) => {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (result.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
      const user = result[0]!;

      if (user.resetToken !== input.token) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid verification code",
        });
      }

      if (user.resetTokenExpiry && user.resetTokenExpiry < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Verification code has expired",
        });
      }

      await db
        .update(users)
        .set({
          emailVerified: new Date(),
          resetToken: null,
          resetTokenExpiry: null,
        })
        .where(eq(users.id, user.id));

      return { success: true };
    }),

  forgotPassword: publicProcedure
    .input(
      z
        .object({
          email: z.string().email(),
        })
        .strict(),
    )
    .mutation(async ({ input }) => {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email));
      if (result.length === 0) {
        // Don't reveal that the user doesn't exist
        return { success: true };
      }
      const user = result[0]!;
      const resetToken = generateVerificationToken();
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

      await db
        .update(users)
        .set({ resetToken, resetTokenExpiry })
        .where(eq(users.id, user.id));

      const resetUrl = `${env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
      await sendEmail({
        to: input.email,
        subject: "Reset your password",
        html: `Click <a href="${resetUrl}">here</a> to reset your password.`,
      });

      return { success: true };
    }),

  resetPassword: publicProcedure
    .input(
      z
        .object({
          token: z.string(),
          newPassword: z.string().min(8),
        })
        .strict(),
    )
    .mutation(async ({ input }) => {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.resetToken, input.token));
      if (result.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invalid or expired reset token",
        });
      }

      const user = result[0]!;
      if (user.resetTokenExpiry && user.resetTokenExpiry < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Reset token has expired",
        });
      }

      const hashedPassword = await hashPassword(input.newPassword);
      await db
        .update(users)
        .set({
          hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
        })
        .where(eq(users.id, user.id));

      return { success: true };
    }),

  getUser: publicProcedure.query(async ({ ctx }) => {
    const userId = ctx.session?.user?.id;
    if (!userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Not authenticated",
      });
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (user.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return user[0];
  }),

  verifyEmail: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      const user = await db.query.users.findFirst({
        where: eq(users.resetToken, input.token),
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invalid or expired verification token",
        });
      }

      if (user.resetTokenExpiry && user.resetTokenExpiry < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Verification token has expired",
        });
      }

      await db
        .update(users)
        .set({
          emailVerified: new Date(),
          resetToken: null,
          resetTokenExpiry: null,
        })
        .where(eq(users.id, user.id));

      return { success: true };
    }),
});
