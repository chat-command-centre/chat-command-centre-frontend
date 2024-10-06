import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { buffer } from 'micro';
import { env } from '~/env';
import { db } from '~/server/db';
import { subscriptions, users } from '~/server/db/schema';
import { eq } from 'drizzle-orm';

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-09-30.acacia',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error(`❌ Error verifying Stripe webhook signature: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionEvent(subscription);
      break;
    // ... handle other event types if needed
    default:
      console.warn(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
}

async function handleSubscriptionEvent(subscription: Stripe.Subscription) {
  const userId = await getUserIdByCustomerId(subscription.customer as string);
  if (!userId) {
    console.error(`User not found for customer ID: ${subscription.customer}`);
    return;
  }

  // Upsert subscription in your database
  await db
    .insert(subscriptions)
    .values({
      id: subscription.id,
      userId: userId,
      priceId: subscription.items.data[0].price.id,
      status: subscription.status,
      startDate: new Date(subscription.start_date * 1000),
      endDate: subscription.ended_at ? new Date(subscription.ended_at * 1000) : null,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      // Add other fields as needed
    })
    .onConflictDoUpdate({
      target: subscriptions.id,
      set: {
        status: subscription.status,
        endDate: subscription.ended_at ? new Date(subscription.ended_at * 1000) : null,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        // Update other fields
      },
    });
}

async function getUserIdByCustomerId(customerId: string): Promise<string | null> {
  // Retrieve the user associated with the Stripe customer ID
  const userRecord = await db
    .select({
      id: users.id,
    })
    .from(users)
    .where(eq(users.stripeCustomerId, customerId))
    .limit(1);
  return userRecord.length > 0 ? userRecord[0].id : null;
}