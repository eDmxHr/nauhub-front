import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "My Favorites",
  description:
    "Your saved movies and TV shows on Balani. Access your favorite content anytime.",
  path: "/favorites",
  noIndex: true, // Don't index user-specific pages
  keywords: ["favorites", "watchlist", "saved"],
});

export default function FavoritesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
