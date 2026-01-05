"use client";

import { Search, Bell } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export function MobileTopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const isSearchPage = pathname === "/search";

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-black backdrop-blur-sm border-b border-white/10 pt-safe">
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Image
            src="/icons/icon-192x192.png"
            alt="Nauhub Logo"
            width={40}
            height={40}
            priority
          />
        </Link>

        {/* Search Bar - Hidden on search page */}
        {!isSearchPage && (
          <button
            onClick={() => router.push("/search")}
            className="flex-1 flex items-center gap-2 bg-white/10 rounded-md py-2 px-4 text-sm text-muted-foreground"
          >
            <Search className="size-4" />
            <span>Search movies, shows...</span>
          </button>
        )}

        {/* Spacer when on search page */}
        {isSearchPage && <div className="flex-1" />}

        {/* Notification Bell */}
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <Bell className="size-5" />
        </button>
      </div>
    </header>
  );
}
