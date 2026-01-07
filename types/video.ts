import { Category, Genre } from "./genres";

export type Video = {
  id: string | number;
  type: "movie" | "series" | "anime";
  title: string;
  description?: string;
  thumbnail?: string;
  banner?: string;
  cloudflare_video_uid?: string; // For movies only
  magnet_url?: string;
  release_year?: number;
  status?: string;
  duration?: number;
  age_rating?: string;
  quality?: string;
  imdb_rating?: number | string;
  is_published: boolean;
  is_featured: boolean;
  is_trending: boolean;
  view_count?: number;
  category_ids?: number[];
  genre_ids?: number[];
  categories?: Category[];
  genres?: Genre[];
  seasons?: VideoSeason[];
  created_at?: string;
  updated_at?: string;
};

export type VideoSeason = {
  id: string | number;
  video_id: string | number;
  season_number: number;
  title: string;
  description?: string;
  thumbnail?: string;
  release_year?: number;
  is_published?: boolean;
  episodes?: VideoEpisode[];
  created_at?: string;
  updated_at?: string;
};

export type VideoEpisode = {
  id: string | number;
  season_id: string | number;
  episode_number: number;
  title: string;
  description?: string;
  thumbnail?: string;
  cloudflare_video_uid?: string;
  status?: string;
  duration?: number;
  release_date?: string;
  is_published?: boolean;
  view_count?: number;
  created_at?: string;
  updated_at?: string;
};
