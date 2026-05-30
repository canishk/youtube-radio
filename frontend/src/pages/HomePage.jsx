import { useEffect, useState } from "react";

import api from "../services/api";

import CategoryCard from "../components/CategoryCard";
import RadioPlayer from "../components/RadioPlayer";
import { usePlayer } from "../context/PlayerContext";
import { fetchNextSong } from "../services/radioEngine";

function HomePage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const {
    currentSong,
    setCurrentSong,

    currentCategory,
    setCurrentCategory,

    isPlaying,
    setIsPlaying,

    queue,
    setQueue,

  } = usePlayer();

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {

    try {

      const response = await api.get("/categories/");

      setCategories(response.data);

    } catch (error) {

      console.error(error);
    }
  }

  async function handleSelectCategory(category) {

    if (!category?.id) {
      console.error("Missing category id when selecting category", category);
      return;
    }

    try {
      setLoading(true);
      const song = await fetchNextSong(category.id)

      // setCurrentVideoId(response.data.youtube_video_id);
      setCurrentCategory(category);
      setCurrentSong(song);
      setIsPlaying(true);

      const preloadSongs = [];
      for (let i = 0; i < 3; i++) {

        const nextSong =
          await fetchNextSong(
            category.id
          );

        if (nextSong) {
          preloadSongs.push(nextSong);
        }
      }

      setQueue(preloadSongs);

    } catch (error) {

      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">
        U-Tube Radio
      </h1>

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          lg:grid-cols-3
          gap-6
        "
      >
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onSelect={handleSelectCategory}
          />
        ))}
      </div>

      {currentSong && (
        <RadioPlayer />
      )}

    </div>
  );
}

export default HomePage;