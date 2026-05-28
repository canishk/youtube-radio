import api from "./api";

const recentlyPlayed = [];

export async function fetchNextSong(
  categoryId
) {

  try {

    for (let i = 0; i < 5; i++) {

      const response =
        await api.get(
          `/stream/${categoryId}`
        );

      const song =
        response.data;

      const alreadyPlayed =
        recentlyPlayed.includes(
          song.youtube_video_id
        );

      if (!alreadyPlayed) {

        recentlyPlayed.push(
          song.youtube_video_id
        );

        if (
          recentlyPlayed.length > 10
        ) {
          recentlyPlayed.shift();
        }

        return song;
      }
    }

    return null;

  } catch (error) {

    console.error(
      "Failed to fetch next song",
      error
    );

    return null;
  }
}