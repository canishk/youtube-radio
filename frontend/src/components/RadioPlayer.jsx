import { useRef, useState, useEffect } from "react";

import YouTube from "react-youtube";

import { usePlayer } from "../context/PlayerContext";
import { fetchNextSong } from "../services/radioEngine";
import { updateCurrentSong, updatePlaybackPosition } from "../services/sessionApi";
import { getSessionId } from "../services/sessionService";
import api from "../services/api";

function RadioPlayer() {

  const playerRef = useRef(null);

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
  setResumePosition

} = usePlayer();

  function onReady(event) {
    console.log(resumePosition);
    if (resumePosition > 15) {
      event.target.seekTo(resumePosition, true);
    }
    playerRef.current = event.target;
    event.target.setVolume(volume);
    setPlaybackStatus("playing");
  }

  async function handlePause() {

    if (!playerRef.current) return;
    // await savePlaybackPosition();
    playerRef.current.pauseVideo();

    setIsPlaying(false);
    setPlaybackStatus("paused");
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

  async function handleSongEnd() {
    await updatePlaybackPosition(getSessionId(), currentSong.id, 0)
    const categoryId = currentCategory?.id ?? currentCategory;
    if (!categoryId) return;

    let nextSong = null;

    if (queue.length > 0) {

        nextSong = queue[0];

        setQueue(
        queue.slice(1)
        );

    } else {

        nextSong =
        await fetchNextSong(
            categoryId
        );
    }

    if (!nextSong) return;
    setCurrentSong(nextSong);
    const additionalSong =
        await fetchNextSong(
        categoryId
        );

    if (additionalSong) {

        setQueue((previous) => [
        ...previous,
        additionalSong
        ]);
    }
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

      try {

        await updateCurrentSong(
          getSessionId(),
          song.id,
          currentCategory?.id
        );

      } catch (error) {

        console.error(
          "Failed to track song",
          error
        );
      }
    }

    async function savePlaybackPosition() {

      if (
        !playerRef.current ||
        !currentSong
      ) {
        return;
      }

      try {

        const currentTime =
          Math.floor(
            playerRef.current
              .getCurrentTime()
          );

        await updatePlaybackPosition(
          getSessionId(),
          currentSong.id,
          currentTime
        );

      } catch (error) {

        console.error(
          "Failed to save playback position",
          error
        );
      }
    }

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

  }, [currentSong]);

  const opts = {

    height: "0",
    width: "0",

    playerVars: {
      autoplay: 1,
    },
  };

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
      "
    >

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
            {/* <p className="text-xs text-slate-500 mt-2">Status: {playbackStatus}</p> */}
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

      {currentSong && (
        <YouTube
          key={currentSong.youtube_video_id}
          videoId={currentSong.youtube_video_id}
          opts={opts}
          onReady={onReady}
          onEnd={handleSongEnd}
          onError={handlePlayerError}
        />
      )}

    </div>
  );
}

export default RadioPlayer;