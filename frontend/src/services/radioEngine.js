import api from "./api";
import { getSessionId } from "./sessionService";

export async function fetchNextSong(
  categoryId
) {

  try {

    const hour = new Date().getHours();
    const sessionId = getSessionId();
    
    const response = await api.get(
        `/stream/${categoryId}?hour=${hour}&session_id=${sessionId}`
      );

    return response.data;

  } catch (error) {

    console.error(
      "Failed to fetch next song",
      error
    );

    return null;
  }
}