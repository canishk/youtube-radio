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
        `/stream/${categoryId}?hour=${hour}&session_id=${sessionId}`
      );
    if (songId != null && response.data.id == songId) {
      return await fetchNextSong(categoryId, songId, attempts+1);
    }
    return response.data;

  } catch (error) {

    console.error(
      "Failed to fetch next song",
      error
    );

    return null;
  }
}

