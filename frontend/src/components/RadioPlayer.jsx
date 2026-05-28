import { useRef, useState } from "react";

import YouTube from "react-youtube";

import { usePlayer } from "../context/PlayerContext";
import { fetchNextSong } from "../services/radioEngine";

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

} = usePlayer();

  function onReady(event) {

    playerRef.current = event.target;
    event.target.setVolume(volume);
  }

  function handlePause() {

    if (!playerRef.current) return;

    playerRef.current.pauseVideo();

    setIsPlaying(false);
  }

  function handleResume() {

    if (!playerRef.current) return;

    playerRef.current.playVideo();

    setIsPlaying(true);
  }

  function handleStop() {

    if (!playerRef.current) return;

    playerRef.current.stopVideo();

    setIsPlaying(false);
  }

  function handleVolumeChange(event) {

  const newVolume =
    Number(event.target.value);

  setVolume(newVolume);

  if (!playerRef.current) return;

  playerRef.current.setVolume(newVolume);
}

  async function handleSongEnd() {

    if (!currentCategory) return;

    let nextSong = null;

    if (queue.length > 0) {

        nextSong = queue[0];

        setQueue(
        queue.slice(1)
        );

    } else {

        nextSong =
        await fetchNextSong(
            currentCategory.id
        );
    }

    if (!nextSong) return;

    setCurrentSong(nextSong);

    const additionalSong =
        await fetchNextSong(
        currentCategory.id
        );

    if (additionalSong) {

        setQueue((previous) => [
        ...previous,
        additionalSong
        ]);
    }
}

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
          items-center
          justify-between
        "
      >

        <div>
          {/* <p className="text-sm text-slate-400">
            Now Playing
          </p> */}

          <h3 className="font-semibold">
            {currentCategory?.name}
          </h3>
          <p className="text-sm text-slate-400">{currentSong?.title}</p>
          <p className="text-xs text-slate-500">{currentSong?.movie}</p>
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

      <YouTube
        videoId={currentSong.youtube_video_id}
        opts={opts}
        onReady={onReady}
        onEnd={handleSongEnd}
      />

    </div>
  );
}

export default RadioPlayer;