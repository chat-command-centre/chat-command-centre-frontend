import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import Link from "next/link";
import { useRouter } from "next/router";
import { PostSelect } from "~/server/db/schema";

export default function Profile() {
  const router = useRouter();
  const { username } = router.query;
  const { data: session } = useSession();

  const { data: userData } = api.user.getUserByUsername.useQuery(
    { username: username as string },
    { enabled: !!username },
  );

  const { data: userPosts, refetch: refetchUserPosts } =
    api.post.getUserPosts.useQuery(
      { username: username as string },
      { enabled: !!username },
    );

  const deletePost = api.post.deletePost.useMutation({
    onSuccess: () => refetchUserPosts(),
    onError: (error) => {
      console.error("Error deleting post:", error);
      alert("Failed to delete post. Please try again.");
    },
  });

  const isOwnProfile = session?.user?.username === username;

  const handleDeletePost = (postId: number) => {
    if (confirm("Are you sure you want to delete this post?")) {
      deletePost.mutate({ postId });
    }
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <h1 className="mb-4 text-2xl font-bold">{userData.name}'s Profile</h1>
      {isOwnProfile && (
        <Link
          href="/settings"
          className="mb-4 inline-block rounded bg-blue-500 px-4 py-2 text-white"
        >
          Edit Profile
        </Link>
      )}
      <h2 className="mb-4 text-xl font-bold">User Posts</h2>
      <ul className="space-y-4">
        {userPosts?.map((post: PostSelect) => (
          <li key={post.id} className="flex items-center justify-between">
            <Link
              href={`/post/${post.id}`}
              className="text-blue-600 hover:underline"
            >
              {post.name}
            </Link>
            {isOwnProfile && (
              <div>
                <button
                  onClick={() => handleDeletePost(post.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
