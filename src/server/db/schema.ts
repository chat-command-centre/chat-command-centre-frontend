import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  pgTableCreator,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
  boolean,
  real,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `app_${name}`);

export const users = createTable("user", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  username: varchar("username", { length: 50 }).notNull().unique(), // Add this line
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("email_verified", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  image: varchar("image", { length: 255 }),
  hashedPassword: varchar("hashed_password", { length: 255 }),
  resetToken: varchar("reset_token", { length: 255 }),
  resetTokenExpiry: timestamp("reset_token_expiry", {
    mode: "date",
    withTimezone: true,
  }),
  tipsEnabled: boolean("tips_enabled").default(false),
  stripeAccountId: varchar("stripe_account_id", { length: 255 }),
  hasAcceptedConsent: boolean("has_accepted_consent").default(false),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  posts: many(posts),
  followers: many(follows, { relationName: "follower" }),
  following: many(follows, { relationName: "following" }),
}));

export const usersSelectSchema = createSelectSchema(users);
export const usersInsertSchema = createInsertSchema(users);
export type UserSelect = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;

export const accounts = createTable(
  "account",
  {
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_user_id_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const accountsSelectSchema = createSelectSchema(accounts);
export const accountsInsertSchema = createInsertSchema(accounts);
export type AccountSelect = typeof accounts.$inferSelect;
export type AccountInsert = typeof accounts.$inferInsert;

export const sessions = createTable(
  "session",
  {
    sessionToken: varchar("session_token", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_user_id_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const sessionsSelectSchema = createSelectSchema(sessions);
export const sessionsInsertSchema = createInsertSchema(sessions);
export type SessionSelect = typeof sessions.$inferSelect;
export type SessionInsert = typeof sessions.$inferInsert;

export const verificationTokens = createTable(
  "verification_token",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);
export const verificationTokensSelectSchema =
  createSelectSchema(verificationTokens);
export const verificationTokensInsertSchema =
  createInsertSchema(verificationTokens);
export type VerificationTokenSelect = typeof verificationTokens.$inferSelect;
export type VerificationTokenInsert = typeof verificationTokens.$inferInsert;

export const posts = createTable(
  "post",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }).notNull().default("Untitled"),
    createdById: varchar("created_by", { length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
    content: text("content").notNull(),
  },
  (example) => ({
    createdByIdIdx: index("created_by_idx").on(example.createdById),
    nameIndex: index("name_idx").on(example.name),
  }),
);

export const postsRelations = relations(posts, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [posts.createdById],
    references: [users.id],
  }),
  votes: many(votes),
  tips: many(tips),
}));

export const postsSelectSchema = createSelectSchema(posts);
export const postsInsertSchema = createInsertSchema(posts);
export type PostSelect = typeof posts.$inferSelect;
export type PostInsert = typeof posts.$inferInsert;

export const votes = createTable(
  "vote",
  {
    id: serial("id").primaryKey(),
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    value: integer("value").notNull(), // 1 for upvote, -1 for downvote
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (vote) => ({
    userPostIndex: index("user_post_idx").on(vote.userId, vote.postId),
  }),
);

export const votesRelations = relations(votes, ({ one }) => ({
  post: one(posts, {
    fields: [votes.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [votes.userId],
    references: [users.id],
  }),
}));

export const votesSelectSchema = createSelectSchema(votes);
export const votesInsertSchema = createInsertSchema(votes);
export type VoteSelect = typeof votes.$inferSelect;
export type VoteInsert = typeof votes.$inferInsert;

export const tips = createTable(
  "tip",
  {
    id: serial("id").primaryKey(),
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id),
    userId: varchar("user_id", { length: 255 }).references(() => users.id),
    email: varchar("email", { length: 255 }),
    amount: integer("amount").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (tip) => ({
    userPostIndex: index("user_post_tip_idx").on(tip.userId, tip.postId),
  }),
);

export const tipsRelations = relations(tips, ({ one }) => ({
  post: one(posts, {
    fields: [tips.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [tips.userId],
    references: [users.id],
  }),
}));

export const tipsSelectSchema = createSelectSchema(tips);
export const tipsInsertSchema = createInsertSchema(tips);
export type TipSelect = typeof tips.$inferSelect;
export type TipInsert = typeof tips.$inferInsert;

export const loginAttempts = createTable(
  "login_attempt",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    success: boolean("success").notNull(),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: varchar("user_agent", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (loginAttempt) => ({
    emailIndex: index("login_attempt_email_idx").on(loginAttempt.email),
  }),
);

export const loginAttemptsSelectSchema = createSelectSchema(loginAttempts);
export const loginAttemptsInsertSchema = createInsertSchema(loginAttempts);
export type LoginAttemptSelect = typeof loginAttempts.$inferSelect;
export type LoginAttemptInsert = typeof loginAttempts.$inferInsert;

export const follows = createTable(
  "follow",
  {
    id: serial("id").primaryKey(),
    followerId: varchar("follower_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    followingId: varchar("following_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (follow) => ({
    followerFollowingIndex: index("follower_following_idx").on(
      follow.followerId,
      follow.followingId,
    ),
  }),
);

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: "follower",
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
    relationName: "following",
  }),
}));

export const followsSelectSchema = createSelectSchema(follows);
export const followsInsertSchema = createInsertSchema(follows);
export type FollowSelect = typeof follows.$inferSelect;
export type FollowInsert = typeof follows.$inferInsert;

// Define the products table
export const products = createTable(
  "product",
  {
    id: varchar("id", { length: 255 }).notNull().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
    // Remove price and billingInterval from products
  },
);

export const productsRelations = relations(products, ({ many }) => ({
  subscriptions: many(subscriptions),
}));

export const productsSelectSchema = createSelectSchema(products);
export const productsInsertSchema = createInsertSchema(products);
export type ProductSelect = typeof products.$inferSelect;
export type ProductInsert = typeof products.$inferInsert;

// Define the prices table
export const prices = createTable(
  "price",
  {
    id: varchar("id", { length: 255 }).notNull().primaryKey(),
    productId: varchar("product_id", { length: 255 })
      .notNull()
      .references(() => products.id),
    unitAmount: integer("unit_amount").notNull(), // Amount in cents
    currency: varchar("currency", { length: 10 }).notNull().default("USD"),
    interval: varchar("interval", { length: 20 }).notNull(), // e.g., 'month', 'year'
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
    // Add other relevant fields as needed
  },
);

export const pricesRelations = relations(prices, ({ one, many }) => ({
  product: one(products, {
    fields: [prices.productId],
    references: [products.id],
  }),
  subscriptions: many(subscriptions),
}));

export const pricesSelectSchema = createSelectSchema(prices);
export const pricesInsertSchema = createInsertSchema(prices);
export type PriceSelect = typeof prices.$inferSelect;
export type PriceInsert = typeof prices.$inferInsert;

// Update subscriptions table to reference priceId
export const subscriptions = createTable(
  "subscription",
  {
    id: varchar("id", { length: 255 }).notNull().primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    priceId: varchar("price_id", { length: 255 })
      .notNull()
      .references(() => prices.id),
    status: varchar("status", { length: 50 }).notNull(), // e.g., 'active', 'canceled'
    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }),
    currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
    // Add other relevant fields as needed
  },
);

// Update subscriptionsRelations
export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  price: one(prices, {
    fields: [subscriptions.priceId],
    references: [prices.id],
  }),
  // Remove product relation if not needed
}));

export const subscriptionsSelectSchema = createSelectSchema(subscriptions);
export const subscriptionsInsertSchema = createInsertSchema(subscriptions);
export type SubscriptionSelect = typeof subscriptions.$inferSelect;
export type SubscriptionInsert = typeof subscriptions.$inferInsert;

// Define the usage table to track token usage
export const usage = createTable(
  "usage",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    tokensUsed: integer("tokens_used").notNull().default(0),
    periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
    periodEnd: timestamp("period_end", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
);

export const usageRelations = relations(usage, ({ one }) => ({
  user: one(users, {
    fields: [usage.userId],
    references: [users.id],
  }),
}));

export const usageSelectSchema = createSelectSchema(usage);
export const usageInsertSchema = createInsertSchema(usage);
export type UsageSelect = typeof usage.$inferSelect;
export type UsageInsert = typeof usage.$inferInsert;