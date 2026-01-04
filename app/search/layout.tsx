import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "Search",
  description:
    "Search for your favorite movies and TV shows on Balani. Find Korean dramas, anime, Hollywood movies, and more.",
  path: "/search",
  keywords: ["search", "find", "movies", "TV shows", "Korean drama", "anime"],
});

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
