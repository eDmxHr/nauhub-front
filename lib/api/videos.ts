import axios from "axios";
import { Video } from "@/types/video";

// Server-side function to fetch video data (for SEO)
// Uses a separate axios instance without cookie interceptors
export async function getVideoById(id: string | number): Promise<Video | null> {
  try {
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseURL) {
      return null;
    }

    const response = await axios.get<{ video: Video }>(`${baseURL}/videos/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 10000, // 10 seconds for server-side
    });

    return response.data.video;
  } catch (error: any) {
    // Handle errors gracefully - return null so page can still render
    return null;
  }
}

