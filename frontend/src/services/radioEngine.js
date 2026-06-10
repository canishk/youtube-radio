import api from "./api";
import { getSessionId } from "./sessionService";

export async function fetchNextSong(
  categoryId,
  songId = null,
  attempts = 0
) {

  try {

    if (attempts > 3) {
      return null;
    }

    const hour = new Date().getHours();
    const sessionId = getSessionId();
    
    const response = await api.get(
        `/stream/${categoryId}?hour=${hour}&session_id=${sessionId}&_t=${Date.now()}`
      );
    if (songId != null && response.data.id == songId) {
      return await fetchNextSong(categoryId, songId, attempts+1);
    }
    return response.data;

  } catch (error) {

    if (error.response?.status === 410) {
      const detail = error.response.data?.detail;
      return {
        exhausted: true,
        recommendedCategory: detail?.recommended_category ?? null,
        sharedMoods: detail?.shared_moods ?? [],
        currentCategoryId: detail?.current_category_id,
      };
    }

    console.error(
      "Failed to fetch next song",
      error
    );

    return null;
  }
}
