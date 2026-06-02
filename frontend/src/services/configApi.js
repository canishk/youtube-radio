import api from "./api";

export async function getPublicConfig() {

  const response = await api.get("/config/public");
  return response.data;
}