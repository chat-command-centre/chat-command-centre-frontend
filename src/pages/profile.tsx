import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import Link from "next/link";

export default function Profile() {
  const { data: session } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [tipsEnabled, setTipsEnabled] = useState(false);
  const [hasStripeAccount, setHasStripeAccount] = useState(false);

  const updateUser = api.user.updateUser.useMutation();
  const { data: userPosts } = api.post.getUserPosts.useQuery();
  const { data: userData, refetch: refetchUserData } =
    api.user.getUser.useQuery();

  useEffect(() => {
    if (userData) {
      setTipsEnabled(userData.tipsEnabled);
      setHasStripeAccount(!!userData.stripeAccountId);
    }
  }, [userData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser.mutate({ name, email, password, newPassword, tipsEnabled });
  };

  const isOwnProfile = session?.user?.id === userData?.id;

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <h1 className="mb-4 text-2xl font-bold">User Profile</h1>
      {isOwnProfile && (
        <form onSubmit={handleSubmit} className="mb-8 space-y-4">
          {/* ... existing form fields ... */}
          <div>
            <label htmlFor="tipsEnabled" className="flex items-center">
              <input
                type="checkbox"
                id="tipsEnabled"
                checked={tipsEnabled}
                onChange={(e) => setTipsEnabled(e.target.checked)}
                disabled={!hasStripeAccount}
                className="mr-2"
              />
              Enable tips for my posts
            </label>
            {!hasStripeAccount && (
              <p className="text-sm text-red-500">
                You need to connect a Stripe account to enable tips.{" "}
                <Link
                  href="/connect-stripe"
                  className="text-blue-500 underline"
                >
                  Connect Stripe
                </Link>
              </p>
            )}
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
      <ul className="space-y-2">
        {userPosts?.map((post) => (
          <li key={post.id}>
            <Link
              href={`/post/${post.id}`}
              className="text-blue-600 hover:underline"
            >
              {post.name}
            </Link>
            <span className="ml-2 text-sm text-gray-500">
              Score: {post.score}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
