import { useRef, useEffect, useCallback } from "react";

import YouTube from "react-youtube";

import { usePlayer } from "../context/PlayerContext";
import { useIsCompactPlayer } from "../hooks/useIsCompactPlayer";
import { useMediaSession } from "../hooks/useMediaSession";
import { fetchNextSong } from "../services/radioEngine";
import { HANDOFF_COUNTDOWN_SECONDS } from "./CategoryHandoffCard";
import { updateCurrentSong, updatePlaybackPosition } from "../services/sessionApi";
import { getSessionId } from "../services/sessionService";
import { trackEvent } from "../services/analyticsApi";
import { sendHeartbeat } from "../services/listenerApi";
import api from "../services/api";

function RadioPlayer() {

  const playerRef = useRef(null);
  const trackedSongRef = useRef(null);

 const {

  currentSong,
  setCurrentSong,

  currentCategory,

  isPlaying,
  setIsPlaying,

  volume,
  setVolume,

  queue,
  setQueue,

  playbackStatus,
  setPlaybackStatus,

  resumePosition,
  setResumePosition,

  consecutiveSkips,
  setConsecutiveSkips,

  setPendingHandoff,

  isPlayerMinimized,
  setIsPlayerMinimized,

} = usePlayer();

  const canSkip = consecutiveSkips < 2;
  const isCompact = useIsCompactPlayer();

  useEffect(() => {
    if (!currentSong || !isCompact) {
      return;
    }
    setIsPlayerMinimized(true);
  }, [currentSong?.id, isCompact, setIsPlayerMinimized]);

  function onReady(event) {
    if (resumePosition > 15) {
      event.target.seekTo(resumePosition, true);
      trackEvent({
        event: "song_resume",
        song_id: currentSong.id,
        category_id: currentSong.category_id
      });
    }
    playerRef.current = event.target;
    event.target.setVolume(volume);
    setPlaybackStatus("playing");
    setIsPlaying(true);
  }

  function onStateChange(event) {
    const YT = window.YT;
    if (!YT) {
      return;
    }

    const state = event.data;

    if (state === YT.PlayerState.PLAYING || state === YT.PlayerState.BUFFERING) {
      setIsPlaying(true);
    } else if (
      state === YT.PlayerState.PAUSED ||
      state === YT.PlayerState.ENDED ||
      state === YT.PlayerState.UNSTARTED
    ) {
      setIsPlaying(false);
    }
  }

  async function handlePause() {

    if (!playerRef.current) return;
    // await savePlaybackPosition();
    playerRef.current.pauseVideo();

    setIsPlaying(false);
    setPlaybackStatus("paused");
  }

  async function handleListenNow(category) {
    setResumePosition(0);
    
    const song = await fetchNextSong(category.id);
    setCurrentSong(song);
  }

  function handleResume() {

    if (!playerRef.current) return;

    playerRef.current.playVideo();

    setIsPlaying(true);
    setPlaybackStatus("playing");
  }

  async function handleStop() {

    if (!playerRef.current) return;

    // await savePlaybackPosition();
    playerRef.current.stopVideo();

    setIsPlaying(false);
    setPlaybackStatus("stopped");
  }

  function handleVolumeChange(event) {

  const newVolume =
    Number(event.target.value);

  setVolume(newVolume);

  if (!playerRef.current) return;

  playerRef.current.setVolume(newVolume);
}

  function handleCategoryExhaustion(result) {
    const categoryId = currentCategory?.id ?? currentCategory;
    setQueue([]);
    setPendingHandoff({
      recommendedCategory: result.recommendedCategory,
      sharedMoods: result.sharedMoods,
      secondsLeft: HANDOFF_COUNTDOWN_SECONDS,
    });
    setIsPlaying(false);
    setPlaybackStatus("stopped");

    trackEvent({
      event: "category_exhausted",
      category_id: categoryId,
      recommended_category_id: result.recommendedCategory?.id ?? null,
      session_id: getSessionId(),
    });
  }

  async function advanceToNextSong() {
    const categoryId = currentCategory?.id ?? currentCategory;
    if (!categoryId || !currentSong) return null;

    let nextSong = null;

    if (queue.length > 0) {
      nextSong = queue[0];
      setQueue(queue.slice(1));
    } else {
      nextSong = await fetchNextSong(categoryId, currentSong.id);
    }

    if (nextSong?.exhausted) {
      handleCategoryExhaustion(nextSong);
      return null;
    }

    if (!nextSong) return null;

    setCurrentSong(nextSong);

    const additionalSong = await fetchNextSong(categoryId, nextSong.id);
    if (additionalSong && !additionalSong.exhausted) {
      setQueue((previous) => [...previous, additionalSong]);
    }

    return nextSong;
  }

  async function handleSongEnd() {
    await updatePlaybackPosition(getSessionId(), currentSong.id, 0);
    setResumePosition(0);

    const categoryId = currentCategory?.id ?? currentCategory;
    if (!categoryId) return;

    await trackEvent({
      event: "song_complete",
      song_id: currentSong.id,
      category_id: categoryId,
      session_id: getSessionId(),
    });

    setConsecutiveSkips(0);
    await advanceToNextSong();
  }

  async function handleSkip() {
    if (!canSkip || !currentSong || !currentCategory) return;

    const categoryId = currentCategory?.id ?? currentCategory;

    await trackEvent({
      event: "song_skip",
      song_id: currentSong.id,
      category_id: categoryId,
    });

    setConsecutiveSkips((previous) => previous + 1);
    await updatePlaybackPosition(getSessionId(), currentSong.id, 0);
    setResumePosition(0);
    trackedSongRef.current = null;
    await advanceToNextSong();
  }

  async function handlePlayerError(
      event
    ) {

      console.error(
        "YouTube playback error",
        event.data
      );

      if (currentSong) {
        try {

          await api.post(
            "/video/failure",
            {
              youtube_video_id:
                currentSong
                  .youtube_video_id,

              reason:
                `youtube_error_${event.data}`
            }
          );

        } catch (error) {

          console.error(error);
        }
      }

      await handleSongEnd();
    }

    async function trackSongStart(
      song
    ) {

      if (!song) {
        return;
      }
      if (trackedSongRef.current == song.id) {
        return;
      }
      trackedSongRef.current = song.id;
      try {

        await updateCurrentSong(
          getSessionId(),
          song.id,
          currentCategory?.id
        );

        await trackEvent({
          event: "song_play",
          song_id: song.id,
          category_id: song.category_id,
        });

      } catch (error) {

        console.error(
          "Failed to track song",
          error
        );
      }
    }

  async function sendListenerHeartbeat() {
    if (!currentSong || !currentCategory) {
      return;
    }
    await sendHeartbeat({session_id:getSessionId(), song_id:currentSong.id, category_id:currentCategory.id});
  }
  useEffect(()=> {
    if (!isPlaying || !currentSong) {
      return;
    }
    sendListenerHeartbeat();
    const interval = setInterval(sendListenerHeartbeat, 30000);
    return () => clearInterval(interval);
  },[isPlaying, currentSong]);

  const savePlaybackPosition = useCallback(async () => {
    if (!playerRef.current || !currentSong) {
      return;
    }

    try {
      const currentTime = Math.floor(playerRef.current.getCurrentTime());
      await updatePlaybackPosition(
        getSessionId(),
        currentSong.id,
        currentTime
      );
    } catch (error) {
      console.error("Failed to save playback position", error);
    }
  }, [currentSong]);

  useMediaSession({
    currentSong,
    currentCategory,
    isPlaying,
    playbackStatus,
    canSkip,
    onPlay: handleResume,
    onPause: handlePause,
    onSkip: handleSkip,
  });

  useEffect(() => {
    const timeoutIds = [];

    function attemptResume(delayMs) {
      const timeoutId = setTimeout(() => {
        const YT = window.YT;
        if (!YT || !playerRef.current) {
          return;
        }

        const state = playerRef.current.getPlayerState();
        if (state !== YT.PlayerState.PLAYING && state !== YT.PlayerState.BUFFERING) {
          playerRef.current.playVideo();
          setIsPlaying(true);
        }
      }, delayMs);
      timeoutIds.push(timeoutId);
    }

    function resumePlaybackIfNeeded() {
      if (document.visibilityState !== "visible") {
        return;
      }
      if (playbackStatus !== "playing" || !playerRef.current || !currentSong) {
        return;
      }

      attemptResume(0);
      attemptResume(150);
      attemptResume(500);
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        savePlaybackPosition();
        return;
      }
      resumePlaybackIfNeeded();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("resume", resumePlaybackIfNeeded);
    window.addEventListener("pageshow", resumePlaybackIfNeeded);
    window.addEventListener("focus", resumePlaybackIfNeeded);

    return () => {
      timeoutIds.forEach(clearTimeout);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("resume", resumePlaybackIfNeeded);
      window.removeEventListener("pageshow", resumePlaybackIfNeeded);
      window.removeEventListener("focus", resumePlaybackIfNeeded);
    };
  }, [playbackStatus, currentSong?.id, savePlaybackPosition]);

  useEffect(() => {
    if (currentSong && currentCategory) {
      trackSongStart(currentSong);
    }
    function handleBeforeUnload() {

      if (
        !playerRef.current ||
        !currentSong
      ) {
        return;
      }

      const payload = {

        session_id:
          getSessionId(),

        song_id:
          currentSong.id,

        position_seconds:
          Math.floor(
            playerRef.current
              .getCurrentTime()
          )
      };

      navigator.sendBeacon(
        "/api/session/playback-position",
        new Blob(
          [JSON.stringify(payload)],
          {
            type:
              "application/json"
          }
        )
      );
    }

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload
    );

    return () => {

      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );
    };
  console.log("Curret Song Changed", currentSong?.title);
  }, [currentSong]);

  const opts = {

    height: "1",
    width: "1",

    playerVars: {
      autoplay: 1,
      enablejsapi: 1,
      playsinline: 1,
      origin: window.location.origin
    },
  };

  const playPauseButtonClass = isPlaying
    ? "bg-yellow-500 hover:bg-yellow-600"
    : "bg-green-600 hover:bg-green-700";

  return (
    <div
      className="
        fixed
        bottom-0
        left-0
        right-0
        bg-slate-900
        border-t
        border-slate-800
        p-4
        pb-[max(1rem,env(safe-area-inset-bottom))]
      "
    >

      {isCompact && isPlayerMinimized && (
        <div className="flex items-center gap-3">
          {currentSong?.thumbnail && (
            <img
              src={currentSong.thumbnail}
              alt={currentSong.title}
              className="w-12 h-12 rounded-lg object-cover shrink-0"
            />
          )}

          <div className="min-w-0 flex-1">
            <h3 className="font-semibold truncate">
              {currentSong?.title}
            </h3>
            <span className="inline-block mt-1 bg-red-600 px-2 py-0.5 rounded-full text-xs truncate max-w-full">
              {currentCategory?.name}
            </span>
          </div>

          <button
            type="button"
            onClick={isPlaying ? handlePause : handleResume}
            className={`shrink-0 px-3 py-2 rounded-lg text-sm ${playPauseButtonClass}`}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>

          <button
            type="button"
            onClick={() => setIsPlayerMinimized(false)}
            className="shrink-0 p-2 text-slate-400 hover:text-white"
            aria-label="Expand player"
          >
            ▲
          </button>
        </div>
      )}

      {(!isCompact || !isPlayerMinimized) && (
      <div
        className="
          flex
          flex-col
          gap-4
          md:flex-row
          md:items-center
          md:justify-between
        "
      >

        {isCompact && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsPlayerMinimized(true)}
              className="p-2 text-slate-400 hover:text-white"
              aria-label="Minimize player"
            >
              ▼
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">

          {currentSong?.thumbnail && (
            <img
              src={currentSong.thumbnail}
              alt={currentSong.title}
              className="
                w-20
                h-20
                rounded-lg
                object-cover
              "
            />
          )}

          <div>

            <h3 className="font-semibold text-lg">
              {currentSong?.title}
            </h3>

            <p className="text-slate-400 text-sm">
              {currentSong?.movie}
            </p>

            <span
              className="
                inline-block
                mt-2
                bg-red-600
                px-3
                py-1
                rounded-full
                text-xs
              "
            >
              {currentCategory?.name}
            </span>
          </div>

        </div>

        <div className="flex items-center gap-4">

          {isPlaying ? (
            <button
              onClick={handlePause}
              className="
                bg-yellow-500
                hover:bg-yellow-600
                px-4
                py-2
                rounded-lg
              "
            >
              Pause
            </button>
          ) : (
            <button
              onClick={handleResume}
              className="
                bg-green-600
                hover:bg-green-700
                px-4
                py-2
                rounded-lg
              "
            >
              Play
            </button>
          )}

          <button
            onClick={handleSkip}
            disabled={!currentSong}
            aria-hidden={!canSkip}
            tabIndex={canSkip ? 0 : -1}
            title="Skip to next song"
            className={`
              bg-slate-600
              hover:bg-slate-500
              px-4
              py-2
              rounded-lg
              ${canSkip ? "" : "invisible pointer-events-none"}
            `}
          >
            Skip
          </button>

          <button
            onClick={handleStop}
            className="
              bg-red-600
              hover:bg-red-700
              px-4
              py-2
              rounded-lg
            "
          >
            Stop
          </button>

        </div>
        <div className="flex items-center gap-2">

        <span className="text-sm">
            Volume
        </span>

        <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="cursor-pointer"
        />

        </div>
      </div>
      )}

      {currentSong && (
        <YouTube
          key={currentSong.youtube_video_id}
          videoId={currentSong.youtube_video_id}
          opts={opts}
          iframeClassName="youtube-player"
          onReady={onReady}
          onStateChange={onStateChange}
          onEnd={handleSongEnd}
          onError={handlePlayerError}
        />
      )}

    </div>
  );
}

export default RadioPlayer;