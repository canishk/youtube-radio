import { useEffect, useState } from "react";

import api from "../services/api";

import CategoryCard from "../components/CategoryCard";
import RadioPlayer from "../components/RadioPlayer";
import { usePlayer } from "../context/PlayerContext";

function HomePage() {
  const [categories, setCategories] = useState([]);
  const {
    currentSong,
    setCurrentSong,

    currentCategory,
    setCurrentCategory,

    isPlaying,
    setIsPlaying

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

    try {
      const response = await api.get(
        `/stream/${category.id}`
      );

      // setCurrentVideoId(response.data.youtube_video_id);
      setCurrentCategory(category.name);
      setCurrentSong(response.data);
      setIsPlaying(true)

    } catch (error) {

      console.error(error);
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