import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";

export function Header() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      void router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-10 bg-white/70 p-4 shadow-lg backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          Blog
        </Link>
        <form onSubmit={handleSearch} className="mx-4 flex-grow">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts..."
            className="w-full rounded-lg border bg-white/50 px-4 py-2 backdrop-blur-sm"
          />
        </form>
        <div className="flex items-center space-x-4">
          {session ? (
            <>
              <Link href="/profile" className="text-blue-600 hover:underline">
                Profile
              </Link>
              <button
                onClick={() => signOut()}
                className="text-blue-600 hover:underline"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/signin" className="text-blue-600 hover:underline">
                Sign in
              </Link>
              <Link href="/signup" className="text-blue-600 hover:underline">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
