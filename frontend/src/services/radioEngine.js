import api from "./api";

export async function fetchNextSong(
  categoryId
) {

  try {

    const hour =
      new Date().getHours();

    const response =
      await api.get(
        `/stream/${categoryId}?hour=${hour}`
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