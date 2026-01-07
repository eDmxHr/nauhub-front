import axios from "axios";
import { VideoEpisode } from "@/types/video";

// Server-side function to fetch episode data (for SEO)
export async function getEpisodeById(id: string | number): Promise<VideoEpisode | null> {
  try {
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseURL) {
      return null;
    }

    const response = await axios.get<{ episode: VideoEpisode }>(`${baseURL}/episodes/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 10000,
    });

    return response.data.episode;
  } catch (error: any) {
    return null;
  }
}

