import Stripe from 'stripe';
import { env } from '~/env';
import { db } from '~/server/db';
import { subscriptions, usage } from '~/server/db/schema';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-09-30.acacia',
});

export async function handleOverageBilling(userId: string) {
  // Fetch user's subscription
  const [subscriptionRecord] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId));

  if (!subscriptionRecord) {
    console.error(`No subscription found for user ID: ${userId}`);
    return;
  }

  // Define this function to get token limit based on priceId
  const tokenLimit = await getTokenLimitForSubscription(subscriptionRecord.priceId);

  // Fetch current usage
  const [currentUsage] = await db
    .select()
    .from(usage)
    .where(eq(usage.userId, userId));

  if (currentUsage.tokensUsed > tokenLimit) {
    const overage = currentUsage.tokensUsed - tokenLimit;

    // Calculate overage amount (e.g., $0.01 per extra token)
    const overageAmount = overage * 1; // Amount in cents

    // Create an invoice item for the overage
    await stripe.invoiceItems.create({
      customer: subscriptionRecord.stripeCustomerId!,
      amount: overageAmount,
      currency: 'usd',
      description: `Overage charge for ${overage} extra tokens`,
    });

    // Create an invoice
    await stripe.invoices.create({
      customer: subscriptionRecord.stripeCustomerId!,
      auto_advance: true, // Auto-finalize this invoice
    });
  }
}

async function getTokenLimitForSubscription(priceId: string): Promise<number> {
  // Implement logic to return token limit based on the priceId
  // For example:
  if (priceId === 'price_basic') return 1000;
  if (priceId === 'price_premium') return 5000;
  // ... and so on
  return 1000; // Default token limit
}