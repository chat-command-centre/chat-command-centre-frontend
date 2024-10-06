import Stripe from 'stripe';
import { env } from "~/env";
import { db } from '~/server/db';
import { products, prices } from '~/server/db/schema';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-09-30.acacia',
});

interface Product {
  id: string;
  name: string;
  description?: string;
  // Add other relevant fields
}

interface Price {
  id: string;
  productId: string;
  unitAmount: number;
  currency: string;
  interval: string; // 'month', 'year', etc.
  // Add other relevant fields
}

async function fetchStripeProducts(): Promise<Product[]> {
  const response = await stripe.products.list({ limit: 100 });
  return response.data.map((prod) => ({
    id: prod.id,
    name: prod.name,
    description: prod.description || '',
  }));
}

async function fetchStripePrices(): Promise<Price[]> {
  const response = await stripe.prices.list({ limit: 100, expand: ['data.product'] });
  return response.data.map((price) => ({
    id: price.id,
    productId: typeof price.product === 'string' ? price.product : price.product.id,
    unitAmount: price.unit_amount || 0,
    currency: price.currency,
    interval: price.recurring?.interval || '',
  }));
}

async function syncProductsAndPrices() {
  try {
    const [stripeProducts, stripePrices] = await Promise.all([
      fetchStripeProducts(),
      fetchStripePrices(),
    ]);

    // Sync Products
    for (const stripeProduct of stripeProducts) {
      // Upsert product in database
      await db
        .insert(products)
        .values({
          id: stripeProduct.id,
          name: stripeProduct.name,
          description: stripeProduct.description,
          // Add other fields
        })
        .onConflictDoUpdate({
          target: products.id,
          set: {
            name: stripeProduct.name,
            description: stripeProduct.description,
            // Update other fields
          },
        });
    }

    // Sync Prices
    for (const stripePrice of stripePrices) {
      // Upsert price in database
      await db
        .insert(prices)
        .values({
          id: stripePrice.id,
          productId: stripePrice.productId,
          unitAmount: stripePrice.unitAmount,
          currency: stripePrice.currency.toUpperCase(),
          interval: stripePrice.interval,
          // Add other fields
        })
        .onConflictDoUpdate({
          target: prices.id,
          set: {
            unitAmount: stripePrice.unitAmount,
            currency: stripePrice.currency.toUpperCase(),
            interval: stripePrice.interval,
            // Update other fields
          },
        });
    }

    console.log('Product and Price synchronization complete.');
  } catch (error) {
    console.error('Error syncing products and prices:', error);
  }
}

syncProductsAndPrices();