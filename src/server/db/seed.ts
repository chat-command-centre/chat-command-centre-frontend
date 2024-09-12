import { db } from "./index";
import { posts, users } from "./schema";
import { hashPassword } from "../auth";

async function seed() {
  // Create a test user
  const hashedPassword = await hashPassword("password123");
  const [user] = await db
    .insert(users)
    .values({
      name: "Test User",
      email: "test@example.com",
      hashedPassword,
      emailVerified: new Date(),
    })
    .returning();

  // Create some test posts
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

  console.log("Seed data inserted successfully");
}

seed()
  .then(() => {
    console.log("Seed data inserted successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error seeding data:", error);
    process.exit(1);
  });
