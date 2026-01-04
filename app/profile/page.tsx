"use client";

import { useState } from "react";
import {
  User,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  Shield,
  Crown,
  Receipt,
  Film,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LucideIcon } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { LoginModal } from "@/components/auth/login-modal";
import { ProfileManagement } from "@/components/auth/profile-management";
import { cn } from "@/lib/utils";

interface MenuItem {
  icon: LucideIcon;
  label: string;
  href: string;
  value?: string;
  requiresAuth?: boolean;
}

interface MenuSection {
  section: string;
  items: MenuItem[];
}

const AVATAR_COLORS: Record<string, string> = {
  red: "bg-red-500",
  blue: "bg-blue-500",
  green: "bg-green-500",
  yellow: "bg-yellow-500",
  purple: "bg-purple-500",
  pink: "bg-pink-500",
  orange: "bg-orange-500",
  teal: "bg-teal-500",
};

export default function ProfilePage() {
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileManagement, setShowProfileManagement] = useState(false);
  const { user, logout, activeProfile, setShowProfileSelector } =
    useAuthStore();
  const isAuthenticated = !!user;

  const menuItems: MenuSection[] = [
    {
      section: "Subscription",
      items: [
        {
          icon: Crown,
          label: "Manage Subscription",
          href: "/subscription",
          requiresAuth: true,
        },
        {
          icon: Receipt,
          label: "Payment History",
          href: "/profile/payments",
          requiresAuth: true,
        },
        {
          icon: Film,
          label: "My Requests",
          href: "/profile/requests",
          requiresAuth: true,
        },
      ],
    },
    {
      section: "Account",
      items: [
        {
          icon: User,
          label: "Edit Profile",
          href: "/profile/edit",
          requiresAuth: true,
        },
        { icon: Bell, label: "Notifications", href: "/profile/notifications" },
      ],
    },

    {
      section: "Support",
      items: [
        { icon: HelpCircle, label: "Help Center", href: "/help" },
        { icon: Shield, label: "Privacy Policy", href: "/privacy" },
        { icon: Settings, label: "Settings", href: "/settings" },
      ],
    },
  ];

  const handleMenuClick = (item: MenuItem, e: React.MouseEvent) => {
    if (item.requiresAuth && !isAuthenticated) {
      e.preventDefault();
      setShowLoginModal(true);
    }
  };

  const handleLogout = () => {
    logout();
    router.refresh();
  };

  return (
    <div className="min-h-screen">
      {/* Profile Header */}
      <div className="px-4 py-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => isAuthenticated && setShowProfileSelector(true)}
            className={cn(
              "w-20 h-20 rounded-lg flex items-center justify-center transition-all",
              activeProfile?.avatar && AVATAR_COLORS[activeProfile.avatar]
                ? AVATAR_COLORS[activeProfile.avatar]
                : "bg-brand/20",
              isAuthenticated && "hover:ring-2 ring-white cursor-pointer"
            )}
          >
            <User className="size-10 text-white" />
          </button>
          <div className="flex-1">
            {isAuthenticated && user ? (
              <>
                <h1 className="text-xl font-bold">
                  {activeProfile?.name || user.name || "User"}
                </h1>
                <p className="text-sm text-muted-foreground">{user.mobile}</p>
                {activeProfile && (
                  <button
                    onClick={() => setShowProfileSelector(true)}
                    className="mt-1 text-xs text-brand font-medium"
                  >
                    Switch Profile
                  </button>
                )}
              </>
            ) : (
              <>
                <h1 className="text-xl font-bold">Guest User</h1>
                <p className="text-sm text-muted-foreground">Not signed in</p>
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="mt-2 text-sm text-brand font-medium"
                >
                  Sign in to continue
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Manage Profiles Button */}
      {isAuthenticated && (
        <button
          onClick={() => setShowProfileManagement(true)}
          className="mx-4 mt-4 w-[calc(100%-2rem)] flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
        >
          <div className="flex items-center gap-3">
            <Users className="size-5 text-muted-foreground" />
            <span className="font-medium">Manage Profiles</span>
          </div>
          <ChevronRight className="size-5 text-muted-foreground" />
        </button>
      )}

      {/* Subscription Banner */}
      {isAuthenticated && (
        <Link href="/subscription">
          <div className="mx-4 mt-4 p-4 bg-brand-muted rounded-xl border border-brand/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <Crown className="size-4 text-brand" />
                  Upgrade to Premium
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Unlimited streaming from 99 ETB/mo
                </p>
              </div>
              <ChevronRight className="size-5 text-muted-foreground" />
            </div>
          </div>
        </Link>
      )}

      {/* Active Subscription Info */}
      {/* {subscription && subscription.status === "active" && (
        <div className="mx-4 mt-4 p-4 bg-brand-muted rounded-xl border border-brand/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Plan</p>
              <h3 className="font-semibold text-brand">{currentPlan.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Renews: {new Date(subscription.endDate).toLocaleDateString()}
              </p>
            </div>
            <Link
              href="/subscription"
              className="px-4 py-2 bg-brand hover:bg-brand/90 rounded-lg text-sm font-medium transition-colors"
            >
              Manage
            </Link>
          </div>
        </div>
      )} */}

      {/* Pending Payment Notice */}
      {/* {subscription && subscription.status === "pending" && (
        <div className="mx-4 mt-4 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
          <div className="flex items-center gap-3">
            <CreditCard className="size-5 text-yellow-500" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-500">Payment Pending</h3>
              <p className="text-sm text-muted-foreground">
                Your payment is being verified
              </p>
            </div>
            <Link
              href="/profile/payments"
              className="text-sm text-yellow-500 font-medium"
            >
              View
            </Link>
          </div>
        </div>
      )} */}

      {/* Menu Sections */}
      <div className="px-4 py-4 space-y-6">
        {menuItems.map((section) => (
          <div key={section.section}>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {section.section}
            </h2>
            <div className="bg-white/5 rounded-xl overflow-hidden">
              {section.items.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={(e) => handleMenuClick(item, e)}
                    className={`flex items-center justify-between p-4 hover:bg-white/5 transition-colors ${
                      index !== section.items.length - 1
                        ? "border-b border-white/5"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="size-5 text-muted-foreground" />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.value && (
                        <span className="text-sm text-muted-foreground">
                          {item.value}
                        </span>
                      )}
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sign Out */}
      {isAuthenticated && (
        <div className="px-4 pb-8">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors"
          >
            <LogOut className="size-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      )}

      {/* App Version */}
      <div className="text-center pb-8">
        <p className="text-xs text-muted-foreground">Balani v1.0.0</p>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      {/* Profile Management Modal */}
      <ProfileManagement
        isOpen={showProfileManagement}
        onClose={() => setShowProfileManagement(false)}
      />
    </div>
  );
}
