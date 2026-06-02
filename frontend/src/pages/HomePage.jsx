import { useEffect, useState } from "react";

import api from "../services/api";

import CategoryCard from "../components/CategoryCard";
import RadioPlayer from "../components/RadioPlayer";
import ResumeCard from "../components/ResumeCard";
import { usePlayer } from "../context/PlayerContext";
import { fetchNextSong } from "../services/radioEngine";
import { getCurrentSession } from "../services/sessionApi";
import { getSessionId } from "../services/sessionService";

function HomePage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resumeCategory, setResumeCategory] = useState(null)
  const [showResumeCard, setShowResumeCard] = useState(false)
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
    // fetchCategories();
     initializePage();
  }, []);

  useEffect(() => {
    if (isPlaying) {
      setShowResumeCard(false);
    }
  }, [isPlaying]);

  async function initializePage() {
  const cats = await fetchCategories();

  await loadResumeInfo(cats);
}

  async function fetchCategories() {

    try {

      const response = await api.get("/categories/");
      setCategories(response.data);
      return response.data;

    } catch (error) {

      console.error(error);
    }
  }

  async function loadResumeInfo(categoriesList = null) {
  try {

    const sessionId = getSessionId();
    const session = await getCurrentSession(sessionId);

    const list = categoriesList || categories;
    const category = list.find((c) => c.id === session.last_category);

    if (category) {
      setResumeCategory(category);
      setShowResumeCard(true);
    }

  } catch (error) {
    console.error("Failed to load session", error);
  }
}

  async function handleResumeStation() {

    const category = categories.find(
        (c) =>
          c.id === resumeCategory.id
      );

    if (!category) {
      return;
    }
    setShowResumeCard(false);

    await handleSelectCategory(category);
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
      setShowResumeCard(false);

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
    <div className="p-6 pb-52">

      <h1 className="text-3xl font-bold mb-6">
        U-Tube Radio
      </h1>
      {showResumeCard && resumeCategory && (
        <ResumeCard
          categoryName={resumeCategory.name}
          onResume={handleResumeStation}
        />
      )}
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