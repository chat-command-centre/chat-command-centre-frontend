import { useState } from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import Head from "next/head";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function PostPage() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const [tipAmount, setTipAmount] = useState("");
  const [tipEmail, setTipEmail] = useState("");

  const {
    data: post,
    isLoading,
    refetch,
  } = api.post.getPostById.useQuery({ id: Number(id) }, { enabled: !!id });

  const voteMutation = api.post.vote.useMutation({
    onSuccess: () => refetch(),
  });

  const tipMutation = api.post.tip.useMutation({
    onSuccess: () => refetch(),
  });

  const handleVote = (value: number) => {
    if (!session) {
      void router.push("/signin");
      return;
    }
    voteMutation.mutate({ postId: Number(id), value });
  };

  const handleTip = () => {
    const amount = parseInt(tipAmount, 10);
    if (isNaN(amount) || amount < 1) {
      alert("Please enter a valid tip amount");
      return;
    }

    tipMutation.mutate({
      postId: Number(id),
      amount: amount * 100, // Convert to cents
      email: session?.user?.email ?? tipEmail,
    });
  };

  if (isLoading) {
    return (
      <div className="text-center text-2xl">Loading awesome content...</div>
    );
  }

  if (!post) {
    return <div className="text-center text-2xl">Oops! Post not found</div>;
  }

  return (
    <>
      <Head>
        <title>{post.name} - Totally Rad Blog</title>
        <meta name="description" content={post.content.substring(0, 160)} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen p-4">
        <div className="blog-container container mx-auto max-w-2xl p-8">
          <Link href="/" className="back-link mb-4 inline-block">
            &larr; Back to all rad posts
          </Link>
          <h1 className="blog-title mb-2 text-4xl font-bold">{post.name}</h1>
          <div className="mb-6 text-gray-600">
            <Link
              href={`/profile/${post.createdBy.id}`}
              className="hover:underline"
            >
              By {post.createdBy.name}
            </Link>
            <span className="ml-2 text-sm">
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="mb-4">
            <Link
              href={`/profile/${post.createdBy.id}`}
              className="text-blue-600 hover:underline"
            >
              Author: {post.createdBy.name}
            </Link>
          </div>
          <div className="blog-post p-6">
            <p className="whitespace-pre-wrap">{post.content}</p>
          </div>
          <div className="mt-4 flex items-center space-x-4">
            <button
              onClick={() => handleVote(1)}
              className={`px-2 py-1 ${
                post.userVote === 1 ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              Upvote
            </button>
            <span>{post.voteCount}</span>
            <button
              onClick={() => handleVote(-1)}
              className={`px-2 py-1 ${
                post.userVote === -1 ? "bg-red-500 text-white" : "bg-gray-200"
              }`}
            >
              Downvote
            </button>
          </div>
          {post.tipsEnabled && (
            <div className="mt-4">
              <h3 className="text-xl font-semibold">Tip the Author</h3>
              <input
                type="number"
                value={tipAmount}
                onChange={(e) => setTipAmount(e.target.value)}
                placeholder="Tip amount ($)"
                className="mr-2 rounded border p-2"
              />
              {!session && (
                <input
                  type="email"
                  value={tipEmail}
                  onChange={(e) => setTipEmail(e.target.value)}
                  placeholder="Your email (optional)"
                  className="mr-2 rounded border p-2"
                />
              )}
              <button
                onClick={handleTip}
                className="rounded bg-green-500 px-4 py-2 text-white"
              >
                Send Tip
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
