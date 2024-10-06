import cron from 'node-cron';
import { handleOverageBilling } from '~/server/utils/billing';
import { db } from '~/server/db';
import { usage } from '~/server/db/schema';

// Run at midnight on the first of every month
cron.schedule('0 0 1 * *', async () => {
  console.log('Running monthly billing tasks...');

  // Fetch all users
  const userIds = await db.select({ id: usage.userId }).from(usage);

  // Handle overage billing for all users
  for (const { id: userId } of userIds) {
    await handleOverageBilling(userId);
  }

  // Reset token usage for all users
  await db.update(usage).set({ tokensUsed: 0 });

  console.log('Monthly billing tasks completed.');
});