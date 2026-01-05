import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nauhub - Stream Movies & TV Shows",
    short_name: "Nauhub",
    description: "Stream your favorite movies and TV shows on Nauhub",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    orientation: "portrait-primary",
    categories: ["entertainment", "movies", "tv"],
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png+xml",
        purpose: "any",
      },
    ],
  };
}
