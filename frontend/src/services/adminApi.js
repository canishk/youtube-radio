import api from "./api";

export async function getCategories() {

  const response =
    await api.get(
      "/admin/categories"
    );

  return response.data;
}

export async function createCategory(
  payload
) {

  const response =
    await api.post(
      "/admin/categories",
      payload
    );

  return response.data;
}

export async function updateCategory(
  categoryId,
  payload
) {

  const response =
    await api.put(
      `/admin/categories/${categoryId}`,
      payload
    );

  return response.data;
}

export async function deleteCategory(
  categoryId
) {

  const response =
    await api.delete(
      `/admin/categories/${categoryId}`
    );

  return response.data;
}

export async function toggleCategory(
  categoryId
) {

  const response =
    await api.put(
      `/admin/categories/${categoryId}/toggle`
    );

  return response.data;
}

export async function getSongs() {

  const response =
    await api.get(
      "/admin/songs"
    );

  return response.data;
}

export async function createSong(payload) {
    const response = await api.post('/admin/songs',payload);
    return response.data;
}

export async function updateSong(songId, payload) {
    const response = await api.put(`/admin/songs/${songId}`, payload);
    return response.data;
    
}

export async function deleteSong(songId) {
    const response = await api.delete(`/admin/songs/${songId}`);
    return response.data;
}

export async function getVideoHealth() {
  const response = await api.get("/admin/video-health");
  return response.data;
}

export async function enableVideo(videoId) {
  const response = await api.post(`/admin/video-health/${videoId}/enable`);
  return response.data;
}

export async function fetchYoutubeMetadata(youtubeUrl) {
  const response = await api.post("/admin/youtube/metadata",
      {
        youtube_url: youtubeUrl
      }
    );
  return response.data;
}

export async function generateSuggestions(songId) {
  const response = await api.post(`/admin/songs/${songId}/suggest`);
  return response.data;
  
}

export async function generateAISuggestions(songId) {
  const response = await api.post(
    `/admin/songs/${songId}/suggest-ai`
  );
  return response.data;
}

export async function getDashboardData() {
  const response = await api.get(`/admin/dashboard`);
  return response.data;
}

export async function getMetadataGaps() {
  const response = await api.get("/admin/dashboard/metadata-gaps");
  return response.data;
}

export async function getAnalyticsSummary() {
  const response = await api.get("/analytics/summary");
  return response.data;
}

export async function getTopSongs() {
  const response = await api.get("/analytics/top-songs");
  return response.data;
}

export async function getTopCategories() {
  const response = await api.get("/analytics/top-categories");
  return response.data;
}

export async function getTopMoods() {
  const response = await api.get("/analytics/top-moods");
  return response.data;
}