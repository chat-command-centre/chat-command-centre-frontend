import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import Head from "next/head";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

export default function PostPage() {
  const router = useRouter();
  const { id, edit } = router.query;
  const { data: session } = useSession();
  const [tipAmount, setTipAmount] = useState("");
  const [tipEmail, setTipEmail] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const {
    data: post,
    isLoading,
    refetch,
  } = api.post.getPostById.useQuery({ id: Number(id) }, { enabled: !!id });

  const utils = api.useContext();

  const voteMutation = api.post.vote.useMutation({
    onMutate: async (newVote) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await utils.post.getPostById.cancel({ id: Number(id) });

      // Snapshot the previous value
      const previousPost = utils.post.getPostById.getData({ id: Number(id) });

      // Optimistically update to the new value
      if (previousPost) {
        utils.post.getPostById.setData(
          { id: Number(id) },
          {
            ...previousPost,
            voteCount:
              previousPost.voteCount +
              newVote.value -
              (previousPost.userVote || 0),
            userVote: newVote.value,
          },
        );
      }

      return { previousPost };
    },
    onError: (err, newVote, context) => {
      // If the mutation fails, use the context we returned above
      if (context?.previousPost) {
        utils.post.getPostById.setData(
          { id: Number(id) },
          context.previousPost,
        );
      }
    },
    onSettled: () => {
      // Sync with the server once mutation has settled
      utils.post.getPostById.invalidate({ id: Number(id) });
    },
  });

  const tipMutation = api.post.tip.useMutation({
    onSuccess: () => refetch(),
  });

  const updatePostMutation = api.post.updatePost.useMutation({
    onSuccess: () => {
      refetch();
      setIsEditing(false);
      router.push(`/post/${id}`);
    },
  });

  useEffect(() => {
    if (post) {
      setEditTitle(post.name);
      setEditContent(post.content);
    }
  }, [post]);

  useEffect(() => {
    if (edit === "true" && session?.user?.id === post?.createdBy.id) {
      setIsEditing(true);
    }
  }, [edit, session, post]);

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

  const handleEdit = () => {
    setIsEditing(true);
    router.push(`/post/${id}?edit=true`, undefined, { shallow: true });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(post?.name ?? "");
    setEditContent(post?.content ?? "");
    router.push(`/post/${id}`, undefined, { shallow: true });
  };

  const handleSaveEdit = () => {
    if (post) {
      updatePostMutation.mutate({
        id: post.id,
        name: editTitle,
        content: editContent,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="text-center text-2xl">Loading awesome content...</div>
    );
  }

  if (!post) {
    return <div className="text-center text-2xl">Oops! Post not found</div>;
  }

  const isAuthor = session?.user?.id === post.createdBy.id;

  return (
    <>
      <Head>
        <title>{post.name} - Totally Rad Blog</title>
        <meta name="description" content={post.content.substring(0, 160)} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen p-4">
        <div className="main-content-panel container mx-auto max-w-2xl p-8">
          <Link href="/" className="back-link mb-4 inline-block">
            &larr; Back to all rad posts
          </Link>
          {isEditing ? (
            <div className="mb-4">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="mb-2 w-full rounded border p-2 text-4xl font-bold"
              />
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full rounded border p-2"
                rows={10}
              />
              <div className="mt-2">
                <button
                  onClick={handleSaveEdit}
                  className="mr-2 rounded bg-green-500 px-4 py-2 text-white"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="rounded bg-gray-500 px-4 py-2 text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="blog-title mb-2 text-4xl font-bold">
                {post.name}
              </h1>
              <div className="mb-6 text-gray-600">
                <Link
                  href={`/profile/${post.createdBy.username}`}
                  className="hover:underline"
                >
                  By {post.createdBy.name}
                </Link>
                <span className="ml-2 text-sm">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="blog-post p-6">
                <p className="whitespace-pre-wrap">{post.content}</p>
              </div>
              {isAuthor && (
                <button
                  onClick={handleEdit}
                  className="mt-4 rounded bg-blue-500 px-4 py-2 text-white"
                >
                  Edit Post
                </button>
              )}
            </>
          )}
          <div className="mt-4 flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleVote(1)}
              className={`rounded-full p-2 ${
                post?.userVote === 1 ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              <FaArrowUp className="h-6 w-6" />
            </motion.button>
            <span className="text-xl font-bold">{post?.voteCount}</span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleVote(-1)}
              className={`rounded-full p-2 ${
                post?.userVote === -1 ? "bg-red-500 text-white" : "bg-gray-200"
              }`}
            >
              <FaArrowDown className="h-6 w-6" />
            </motion.button>
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
