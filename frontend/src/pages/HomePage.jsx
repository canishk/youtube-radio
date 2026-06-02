import { useEffect, useState, useMemo } from "react";

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
  const [resumeCategory, setResumeCategory] = useState(null);
  const [resumeSong, setResumeSong] = useState(null);
  const [showResumeCard, setShowResumeCard] = useState(false);
  const [resumePosition, setResumePosition] = useState(0);
  const {
    currentSong,
    setCurrentSong,

    currentCategory,
    setCurrentCategory,

    isPlaying,
    setIsPlaying,

    queue,
    setQueue,
    setResumePosition: setPlayerResumePosition

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

  const canResumeSong = useMemo(() => {

    return (
      resumeSong &&
      resumePosition >= 15
    );

  }, [resumeSong, resumePosition]);

  async function initializePage() {

    const cats =
      await fetchCategories();

    await loadResumeInfo(cats);
  }

  async function fetchCategories() {

    try {

      const response =
        await api.get(
          "/categories/"
        );

      setCategories(
        response.data
      );

      return response.data;

    } catch (error) {

      console.error(error);

      return [];
    }
  }

  async function loadResumeInfo(
    categoriesList = []
  ) {

    try {

      const sessionId =
        getSessionId();

      const session =
        await getCurrentSession(
          sessionId
        );

      const category =
        categoriesList.find(
          (c) =>
            c.id ===
            session.last_category
        );

      if (category) {

        setResumeCategory(
          category
        );

        setShowResumeCard(
          true
        );
      }

      if (session.last_song) {

        setResumeSong(
          session.last_song
        );

        setResumePosition(
          session.playback_position_seconds || 0
        );
      }

    } catch (error) {

      console.error(
        "Failed to load session",
        error
      );
    }
  }

  async function handleResume() {

    if (!resumeSong || !resumeCategory) {
      return;
    }

    try {
      setLoading(true);

      setCurrentCategory(resumeCategory);
      setCurrentSong(resumeSong);
      
      if (canResumeSong) {
        setPlayerResumePosition(resumePosition);
      }

      setIsPlaying(true);
      setShowResumeCard(false);

      const preloadSongs = [];
      for (let i = 0; i < 3; i++) {
        const nextSong = await fetchNextSong(resumeCategory.id);
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

  function handleStartFresh() {

    setResumeSong(null);
    setResumePosition(0);
    setPlayerResumePosition(0);
    setShowResumeCard(false);
    handleSelectCategory(resumeCategory);
  }

  async function handleSelectCategory(
    category
  ) {

    if (!category?.id) {

      console.error(
        "Missing category id",
        category
      );

      return;
    }

    try {

      setLoading(true);

      const song =
        await fetchNextSong(
          category.id
        );

      setCurrentCategory(
        category
      );

      setCurrentSong(
        song
      );

      setIsPlaying(
        true
      );

      setShowResumeCard(
        false
      );

      const preloadSongs = [];

      for (
        let i = 0;
        i < 3;
        i++
      ) {

        const nextSong =
          await fetchNextSong(
            category.id
          );

        if (nextSong) {

          preloadSongs.push(
            nextSong
          );
        }
      }

      setQueue(
        preloadSongs
      );

    } catch (error) {

      console.error(
        error
      );

    } finally {

      setLoading(
        false
      );
    }
  }

  return (

    <div className="p-6 pb-52">

      <h1
        className="
          text-3xl
          font-bold
          mb-6
        "
      >
        U-Tube Radio
      </h1>

      {showResumeCard &&
        resumeCategory && (

        <ResumeCard

          categoryName={
            resumeCategory.name
          }

          songTitle={
            resumeSong?.title
          }

          thumbnail={
            resumeSong?.thumbnail
          }

          resumePosition={
            resumePosition
          }

          canResumeSong={
            canResumeSong
          }

          onResume={
            handleResume
          }

          onStartFresh={
            handleStartFresh
          }
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
        {categories.map(
          (category) => (

          <CategoryCard
            key={category.id}
            category={category}
            onSelect={
              handleSelectCategory
            }
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