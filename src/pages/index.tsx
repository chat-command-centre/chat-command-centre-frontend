import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { api } from "~/utils/api";

export default function Home() {
  const { data: posts, isLoading } = api.post.getAllPosts.useQuery();
  const { data: session } = useSession();

  return (
    <>
      <Head>
        <title>Totally Rad Blog</title>
        <meta name="description" content="A totally rad 2000's style blog" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen p-4">
        <div className="blog-container container mx-auto max-w-4xl p-8">
          <h1 className="mb-8 text-center text-6xl font-bold">
            Totally Rad Blog
          </h1>
          {!session && (
            <div className="mb-8 text-center">
              <p className="mb-4 text-xl">
                Join our rad community and start sharing your awesome ideas!
              </p>
              <Link
                href="/signup"
                className="mr-4 inline-block rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              >
                Sign Up
              </Link>
              <Link
                href="/signin"
                className="inline-block rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
              >
                Sign In
              </Link>
            </div>
          )}
          {isLoading ? (
            <p className="text-2xl">Loading awesome posts...</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {posts?.map((post) => (
                <Link
                  key={post.id}
                  className="blog-post flex flex-col gap-2 rounded-lg bg-white p-4 shadow-md transition-transform hover:scale-105"
                  href={`/post/${post.id}`}
                >
                  <h3 className="text-2xl font-bold">{post.name}</h3>
                  <p className="text-lg">{post.content.substring(0, 100)}...</p>
                  <span className="mt-2 self-end text-sm italic text-blue-600">
                    Read more...
                  </span>
                </Link>
              ))}
            </div>
          )}
          <div className="mt-8 text-center">
            <Link href="/about" className="text-blue-600 hover:underline">
              Learn more about Totally Rad Blog
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

// ... AuthShowcase component ...
