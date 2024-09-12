import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Profile() {
  const router = useRouter();
  const { username } = router.query;
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const { data: userData, refetch: refetchUserData } =
    api.user.getUserByUsername.useQuery(
      { username: username as string },
      { enabled: !!username },
    );
  const { data: userPosts, refetch: refetchUserPosts } =
    api.post.getUserPosts.useQuery(
      { userId: userData?.id ?? "" },
      { enabled: !!userData?.id },
    );

  const updateUser = api.user.updateUser.useMutation({
    onSuccess: () => refetchUserData(),
  });
  const deletePost = api.post.deletePost.useMutation({
    onSuccess: () => refetchUserPosts(),
  });

  useEffect(() => {
    if (userData) {
      setName(userData.name ?? "");
      setEmail(userData.email ?? "");
    }
  }, [userData]);

  const isOwnProfile = session?.user?.id === userData?.id;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser.mutate({ name, email, password, newPassword });
  };

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
        <form onSubmit={handleSubmit} className="mb-8 space-y-4">
          <div>
            <label htmlFor="name" className="block">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded border p-2"
            />
          </div>
          <div>
            <label htmlFor="email" className="block">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border p-2"
            />
          </div>
          <div>
            <label htmlFor="password" className="block">
              Current Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border p-2"
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="block">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded border p-2"
            />
          </div>
          <button
            type="submit"
            className="rounded bg-blue-500 px-4 py-2 text-white"
          >
            Update Profile
          </button>
        </form>
      )}
      <h2 className="mb-4 text-xl font-bold">User Posts</h2>
      <ul className="space-y-4">
        {userPosts?.map((post) => (
          <li key={post.id} className="flex items-center justify-between">
            <Link
              href={`/post/${post.id}`}
              className="text-blue-600 hover:underline"
            >
              {post.name}
            </Link>
            {isOwnProfile && (
              <div>
                <Link
                  href={`/edit-post/${post.id}`}
                  className="mr-2 text-green-600 hover:underline"
                >
                  Edit
                </Link>
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
