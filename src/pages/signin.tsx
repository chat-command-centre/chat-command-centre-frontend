import { useState, useEffect } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { FaGoogle, FaApple, FaFacebook, FaDiscord } from "react-icons/fa";
import { SiMicrosoft } from "react-icons/si";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (session) {
      void router.push(`/profile/${session.user.username}`);
    }
  }, [session, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (session) {
    return null;
  }

  const handleOAuthSignIn = (provider: string) => {
    void signIn(provider, { callbackUrl: "/" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      if (result?.error) {
        setError("Invalid email or password");
      } else {
        void router.push(`/profile/${session?.user?.username}`);
      }
    } catch (error) {
      setError("An error occurred during sign in");
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto max-w-md p-4">
      <div className="rounded-xl bg-white/80 p-8 shadow-lg ring-1 ring-black/5 backdrop-blur-md">
        <h1 className="mb-4 text-2xl font-bold">Sign In</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded border p-2"
            />
          </div>
          <div>
            <label htmlFor="password" className="block">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded border p-2"
            />
          </div>
          <button
            type="submit"
            className="rounded bg-blue-500 px-4 py-2 text-white"
          >
            Sign In
          </button>
        </form>
        <div className="mt-4">
          <p className="text-center">Or sign in with:</p>
          <div className="mt-2 flex justify-center space-x-4">
            <button
              onClick={() => handleOAuthSignIn("google")}
              className="rounded-full bg-red-500 p-2 text-white"
            >
              <FaGoogle />
            </button>
            <button
              onClick={() => handleOAuthSignIn("apple")}
              className="rounded-full bg-black p-2 text-white"
            >
              <FaApple />
            </button>
            <button
              onClick={() => handleOAuthSignIn("facebook")}
              className="rounded-full bg-blue-600 p-2 text-white"
            >
              <FaFacebook />
            </button>
            <button
              onClick={() => handleOAuthSignIn("azure-ad")}
              className="rounded-full bg-blue-500 p-2 text-white"
            >
              <SiMicrosoft />
            </button>
            <button
              onClick={() => handleOAuthSignIn("discord")}
              className="rounded-full bg-indigo-500 p-2 text-white"
            >
              <FaDiscord />
            </button>
          </div>
        </div>
        <div className="mt-4">
          <Link href="/signup" className="text-blue-600 hover:underline">
            Don't have an account? Sign Up
          </Link>
        </div>
        <div className="mt-2">
          <Link
            href="/forgot-password"
            className="text-blue-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        {error && <div className="mt-4 text-center text-red-600">{error}</div>}
      </div>
    </div>
  );
}
