import { useRouter } from "next/router";
import { api } from "~/utils/api";
import Head from "next/head";
import Link from "next/link";

export default function SearchResults() {
  const router = useRouter();
  const { q } = router.query;
  const searchQuery = typeof q === "string" ? q : "";

  const { data: searchResults, isLoading } = api.post.search.useQuery(
    { query: searchQuery },
    { enabled: !!searchQuery },
  );

  return (
    <>
      <Head>
        <title>Search Results - Totally Rad Blog</title>
        <meta
          name="description"
          content={`Search results for "${searchQuery}"`}
        />
      </Head>
      <main className="container mx-auto max-w-4xl p-4">
        <h1 className="mb-6 text-3xl font-bold">
          Search Results for "{searchQuery}"
        </h1>
        {isLoading ? (
          <p>Loading results...</p>
        ) : searchResults && searchResults.length > 0 ? (
          <div className="space-y-4">
            {searchResults.map((post) => (
              <div key={post.id} className="rounded-lg bg-white p-4 shadow">
                <Link
                  href={`/post/${post.id}`}
                  className="text-xl font-semibold hover:underline"
                >
                  {post.name}
                </Link>
                <p className="mt-2 text-gray-600">
                  {post.content.substring(0, 150)}...
                </p>
                <div className="mt-2 text-sm text-gray-500">
                  Score: {post.score} | By:{" "}
                  <Link
                    href={`/profile/${post.createdBy.username}`}
                    className="text-blue-600 hover:underline"
                  >
                    {post.createdBy.name}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No results found for "{searchQuery}"</p>
        )}
      </main>
    </>
  );
}
