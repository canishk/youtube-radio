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