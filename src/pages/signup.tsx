import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

export default function SignUp() {
  const [username, setUsername] = useState("");
  const [name, setName] = useState(""); // Add this line
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const signUp = api.auth.signUp.useMutation({
    onSuccess: () => {
      router.push("/verify-email");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    signUp.mutate({ username, name, email, password }); // Include name here
  };

  return (
    <div className="container mx-auto max-w-md p-4">
      <h1 className="mb-4 text-2xl font-bold">Sign Up</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full rounded border p-2"
          />
        </div>
        <div>
          <label htmlFor="name" className="block">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
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
          Sign Up
        </button>
      </form>
    </div>
  );
}
