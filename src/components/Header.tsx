import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { Search, X } from "lucide-react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";

interface HeaderProps {
  onThemeChange: (theme: string) => void;
}

export function Header({ onThemeChange }: HeaderProps) {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      void router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleThemeChange = (value: string) => {
    onThemeChange(value);
  };

  return (
    <header className="fixed left-4 right-4 top-4 z-10 rounded-lg bg-white/70 p-4 shadow-lg backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          Blog
        </Link>
        <div className="flex items-center space-x-4">
          {isSearchVisible ? (
            <form onSubmit={handleSearch} className="flex items-center">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts..."
                className="mr-2 w-64"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchVisible(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchVisible(true)}
            >
              <Search className="h-4 w-4" />
            </Button>
          )}
          <Select onValueChange={handleThemeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="light-red">Light Red</SelectItem>
              <SelectItem value="light-yellow">Light Yellow</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="dark-red">Dark Red</SelectItem>
              <SelectItem value="dark-yellow">Dark Yellow</SelectItem>
            </SelectContent>
          </Select>
          {session ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/profile">Profile</Link>
              </Button>
              <Button variant="ghost" onClick={() => void signOut()}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/signin">Sign in</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
