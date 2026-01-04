import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "Offline",
  description:
    "You are currently offline. Please check your internet connection.",
  path: "/offline",
  noIndex: true, // Don't index offline page
});

export default function OfflineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
