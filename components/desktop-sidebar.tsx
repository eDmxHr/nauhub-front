"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  Heart,
  User,
  Film,
  Tv,
  TrendingUp,
  Settings,
  CreditCard,
  LogOut,
  ShipWheel,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";
import { LoginModal } from "@/components/auth/login-modal";
import { useState } from "react";

const mainNavItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/category/trending", label: "Trending", icon: TrendingUp },
  { href: "/category/movies", label: "Movies", icon: Film },
  { href: "/category/tv-series", label: "TV Series", icon: Tv },
  { href: "/favorites", label: "My List", icon: Heart },
];

const accountNavItems = [
  { href: "/profile", label: "Profile", icon: User },
  { href: "/subscription", label: "Subscription", icon: CreditCard },
  { href: "/profile/payments", label: "Payment History", icon: Settings },
];

export function DesktopSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const isAuthenticated = !!user;

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-zinc-950 border-r border-white/10 fixed left-0 top-0 z-50">
      {/* Logo */}
      <div className="p-6 ">
        <Link href="/" className="flex items-center gap-2">
          <ShipWheel className="text-brand size-5" />
          <h1 className="text-2xl font-bold text-brand">Balani</h1>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-3 mb-6">
          <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Browse
          </p>
          <ul className="space-y-1">
            {mainNavItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                      isActive
                        ? "bg-brand/20 text-brand"
                        : "text-muted-foreground hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon className="size-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="px-3">
          <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Account
          </p>
          <ul className="space-y-1">
            {accountNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                      isActive
                        ? "bg-brand/20 text-brand"
                        : "text-muted-foreground hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon className="size-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-white/10">
        {isAuthenticated ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-2">
              <div className="size-10 rounded-full bg-brand/20 flex items-center justify-center">
                <User className="size-5 text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.mobile || "User"}
                </p>
                <p className="text-xs text-muted-foreground">Free Plan</p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <LogOut className="size-4" />
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowLoginModal(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand/90 rounded-lg font-medium transition-colors"
          >
            Sign In
          </button>
        )}
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </aside>
  );
}
