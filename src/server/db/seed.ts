import { db } from "./index";
import { posts, users } from "./schema";
import { hashPassword } from "../auth";

async function seed() {
  console.log("Starting seed process...");
  // Create a test user
  console.log("Creating test user");
  const hashedPassword = await hashPassword("password123");
  const [user] = await db
    .insert(users)
    .values({
      name: "Test User",
      username: "testuser",
      email: "test@example.com",
      hashedPassword,
      emailVerified: new Date(),
      tipsEnabled: false,
      hasAcceptedConsent: false,
    })
    .returning();
  console.log(`Test user created with ID: ${user!.id}`);

  // Create some test posts
  console.log("Creating test posts");
  await db.insert(posts).values([
    {
      name: "First Post",
      content: "This is the content of the first post.",
      createdById: user!.id,
    },
    {
      name: "Second Post",
      content: "This is the content of the second post.",
      createdById: user!.id,
    },
  ]);
  console.log("Test posts created successfully");

  console.log("Seed data inserted successfully");
}

seed()
  .then(() => {
    console.log("Seed process completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error during seed process:", error);
    process.exit(1);
  });
