import { db } from '~/server/db';
import { usage } from '~/server/db/schema';
import { and, eq, lte, gte } from 'drizzle-orm';

export async function incrementTokenUsage(userId: string, tokens: number) {
  const now = new Date();

  // Find the current usage period for the user
  const [currentUsage] = await db
    .select()
    .from(usage)
    .where(
      and(
        eq(usage.userId, userId),
        lte(usage.periodStart, now),
        gte(usage.periodEnd, now)
      )
    );

  if (!currentUsage) {
    // Create a new usage period if none exists
    const periodStart = new Date();
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1); // Assuming monthly billing

    await db.insert(usage).values({
      userId,
      tokensUsed: tokens,
      periodStart,
      periodEnd,
    });
  } else {
    // Update tokens used
    await db
      .update(usage)
      .set({ tokensUsed: currentUsage.tokensUsed + tokens })
      .where(eq(usage.id, currentUsage.id));
  }
}