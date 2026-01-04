"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DesktopHeader() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="hidden lg:flex items-center justify-between h-16 px-6 bg-black/95 backdrop-blur-sm border-b border-white/10 fixed top-0 left-64 right-0 z-40">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search movies, TV shows, actors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 rounded-md py-2.5 pl-12 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/50"
          />
        </div>
      </form>
      {/* 
      <div className="flex items-center gap-4 ml-6">
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors relative">
          <Bell className="size-5" />
          <span className="absolute top-1 right-1 size-2 bg-brand rounded-full" />
        </button>

        {isAuthenticated ? (
          <Link
            href="/profile"
            className="flex items-center gap-3 px-3 py-1.5 hover:bg-white/10 rounded-full transition-colors"
          >
            <div className="size-8 rounded-full bg-brand/20 flex items-center justify-center">
              <User className="size-4 text-brand" />
            </div>
            <span className="text-sm font-medium hidden xl:block">
              {user?.phone || "Account"}
            </span>
          </Link>
        ) : (
          <Link
            href="/login"
            className="px-5 py-2 bg-brand hover:bg-brand/90 rounded-full font-medium text-sm transition-colors"
          >
            Sign In
          </Link>
        )}
      </div> */}
    </header>
  );
}
