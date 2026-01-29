import { Suspense } from "react";
import { SearchClient } from "./search-client";

// Note: Metadata is exported from a separate file for client components
// See search/layout.tsx for SEO metadata

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <SearchClient />
    </Suspense>
  );
}
