import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "Profile",
  description:
    "Manage your Balani account settings, preferences, and subscription.",
  path: "/profile",
  noIndex: true, // Don't index user-specific pages
  keywords: ["profile", "account", "settings"],
});

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
