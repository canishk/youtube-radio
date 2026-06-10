import { useEffect, useState, useMemo } from "react";

import api from "../services/api";

import CategoryCard from "../components/CategoryCard";
import RadioPlayer from "../components/RadioPlayer";
import ResumeCard from "../components/ResumeCard";
import CategoryHandoffCard from "../components/CategoryHandoffCard";
import { usePlayer } from "../context/PlayerContext";
import { fetchNextSong } from "../services/radioEngine";
import { getCurrentSession, getListenerCount, resetCategoryHistory } from "../services/sessionApi";
import { getSessionId } from "../services/sessionService";
import { shuffleArray } from "../utils/shuffleArray";
import { trackEvent } from "../services/analyticsApi";
import { getCurrentListeners } from "../services/listenerApi";

function HomePage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resumeCategory, setResumeCategory] = useState(null);
  const [resumeSong, setResumeSong] = useState(null);
  const [showResumeCard, setShowResumeCard] = useState(false);
  const [resumePosition, setResumePosition] = useState(0);
  const [listenerCount, setListenerCount] = useState(0);
  const [isResumeMode, setIsResumeMode] = useState(false);
  const {
    currentSong,
    setCurrentSong,

    currentCategory,
    setCurrentCategory,

    isPlaying,
    setIsPlaying,

    queue,
    setQueue,
    setResumePosition: setPlayerResumePosition,

    pendingHandoff,
    setPendingHandoff,
    clearPendingHandoff,
    setPlaybackStatus,

    isPlayerMinimized,

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

  useEffect(() => {
    if (pendingHandoff) {
      setShowResumeCard(false);
    }
  }, [pendingHandoff]);

  const canResumeSong = useMemo(() => {

    return (
      resumeSong &&
      resumePosition >= 15
    );

  }, [resumeSong, resumePosition]);

  async function initializePage() {

    const cats = await fetchCategories();
    await loadResumeInfo(cats);
  }

  async function loadListenerCount() {
    try {
      const data = await getCurrentListeners();
      setListenerCount(data.current_listeners);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadListenerCount();
    const interval = setInterval(loadListenerCount, 60000);
    return () => clearInterval(interval)
  },[]);

  async function fetchCategories() {

    try {

      const response =
        await api.get(
          "/categories/"
        );

      const storedOrder =
  sessionStorage.getItem(
    "category_order"
  );

if (storedOrder) {

    const order =
      JSON.parse(
        storedOrder
      );

    const ordered =
      order
        .map(
          id =>
            response.data.find(
              c => c.id === id
            )
        )
        .filter(Boolean);

    setCategories(
      ordered
    );

  } else {

    const shuffled =
      shuffleArray(
        response.data
      );

    sessionStorage.setItem(
      "category_order",
      JSON.stringify(
        shuffled.map(
          c => c.id
        )
      )
    );

    setCategories(
      shuffled
    );
  }

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
        if (nextSong?.exhausted || !nextSong) {
          break;
        }
        preloadSongs.push(nextSong);
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
    setIsResumeMode(false);
    setCurrentSong(null);
    setCurrentCategory(null);
    handleSelectCategory(resumeCategory);
  }

  function showCategoryHandoff(result, category) {
    setCurrentCategory(category);
    setShowResumeCard(false);
    setPendingHandoff({
      recommendedCategory: result.recommendedCategory,
      sharedMoods: result.sharedMoods,
    });
    setIsPlaying(false);
    setPlaybackStatus("stopped");

    trackEvent({
      event: "category_exhausted",
      category_id: category.id,
      recommended_category_id: result.recommendedCategory?.id ?? null,
      session_id: getSessionId(),
    });
  }

  async function handleHandoffAccept() {
    const recommendedCategory = pendingHandoff?.recommendedCategory;

    trackEvent({
      event: "category_handoff_accepted",
      category_id: currentCategory?.id,
      recommended_category_id: recommendedCategory?.id ?? null,
      session_id: getSessionId(),
    });

    clearPendingHandoff();

    if (recommendedCategory) {
      await handleSelectCategory(recommendedCategory);
    }
  }

  async function handleHandoffStay() {
    if (!currentCategory?.id) {
      return;
    }

    const category = currentCategory;
    const recommendedCategoryId =
      pendingHandoff?.recommendedCategory?.id ?? null;

    clearPendingHandoff();
    setShowResumeCard(false);
    setQueue([]);

    trackEvent({
      event: "category_handoff_stayed",
      category_id: category.id,
      recommended_category_id: recommendedCategoryId,
      session_id: getSessionId(),
    });

    try {
      await resetCategoryHistory(getSessionId(), category.id);
    } catch (error) {
      console.error("Failed to reset category history", error);
      return;
    }

    await restartCategoryPlayback(category);
  }

  async function restartCategoryPlayback(category) {
    if (!category?.id) {
      return;
    }

    try {
      setLoading(true);
      setPlayerResumePosition(0);

      const song = await fetchNextSong(category.id);

      if (song?.exhausted) {
        showCategoryHandoff(song, category);
        return;
      }

      if (!song) {
        console.error("No song returned after category reset");
        return;
      }

      setCurrentCategory(category);
      setCurrentSong(song);
      setIsPlaying(true);
      setPlaybackStatus("playing");
      setShowResumeCard(false);

      const preloadSongs = [];
      for (let i = 0; i < 3; i++) {
        const nextSong = await fetchNextSong(category.id);
        if (nextSong?.exhausted || !nextSong) {
          break;
        }
        preloadSongs.push(nextSong);
      }

      setQueue(preloadSongs);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectCategory(category) {
    if (!category?.id) {
      console.error("Missing category id", category);
      return;
    }

    await trackEvent({
      event: "category_entered",
      category_id: category.id,
    });

    clearPendingHandoff();
    setIsResumeMode(false);
    setShowResumeCard(false);
    setCurrentSong(null);

    try {
      await resetCategoryHistory(getSessionId(), category.id);
    } catch (error) {
      console.error("Failed to reset category history", error);
      return;
    }

    await restartCategoryPlayback(category);
  }

  return (

    <div
      className={`p-6 ${
        currentSong
          ? isPlayerMinimized
            ? "pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-56"
            : "pb-[calc(22rem+env(safe-area-inset-bottom))] md:pb-56"
          : "pb-6"
      }`}
    >

      <header className="mb-6 text-center">
        <div className="flex items-center justify-center gap-3">
          <h1 className="text-3xl font-bold">U-Tube Radio</h1>
          <img src="/logo.png" alt="U-Tube Radio" className="h-10 w-10" />
        </div>
        <p className="mt-2 text-sm text-slate-400">
          {listenerCount} listening
        </p>
      </header>

      {pendingHandoff && currentCategory && (
        <CategoryHandoffCard
          currentCategoryName={currentCategory.name}
          recommendedCategory={pendingHandoff.recommendedCategory}
          sharedMoods={pendingHandoff.sharedMoods}
          onAccept={handleHandoffAccept}
          onStay={handleHandoffStay}
        />
      )}

      {showResumeCard &&
        !pendingHandoff &&
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