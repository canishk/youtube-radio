import api from "./api";

export async function getCurrentSession(
  sessionId
) {

  const response =
    await api.get(
      `/session/current?session_id=${sessionId}`
    );
  return response.data;
}

export async function updatePlaybackPosition(
  sessionId,
  songId,
  positionSeconds
) {

  const response =
    await api.post(
      "/session/playback-position",
      {
        session_id:
          sessionId,

        song_id:
          songId,

        position_seconds:
          positionSeconds
      }
    );

  return response.data;
}

export async function updateCurrentSong(
  sessionId,
  songId,
  categoryId
) {

  const response =
    await api.post(
      "/session/current-song",
      {
        session_id:
          sessionId,

        song_id:
          songId,

        category_id:
          categoryId
      }
    );

  return response.data;
}

export async function resetCategoryHistory(
  sessionId,
  categoryId
) {
  const response = await api.post(
    "/session/category-history/reset",
    {
      session_id: sessionId,
      category_id: categoryId,
    }
  );

  return response.data;
}

export async function getListenerCount() {

  const response =
    await api.get(
      "/stats/listeners"
    );

  return response.data;
}