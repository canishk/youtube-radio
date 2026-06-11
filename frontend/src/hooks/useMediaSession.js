import { useEffect } from "react";

function clearMediaSession() {
  if (!("mediaSession" in navigator)) {
    return;
  }

  navigator.mediaSession.metadata = null;
  navigator.mediaSession.playbackState = "none";

  for (const action of ["play", "pause", "nexttrack"]) {
    try {
      navigator.mediaSession.setActionHandler(action, null);
    } catch {
      // Some browsers reject unsupported actions.
    }
  }
}

export function useMediaSession({
  currentSong,
  currentCategory,
  isPlaying,
  playbackStatus,
  canSkip,
  onPlay,
  onPause,
  onSkip,
}) {
  useEffect(() => {
    if (!("mediaSession" in navigator)) {
      return;
    }

    if (!currentSong || playbackStatus === "stopped") {
      clearMediaSession();
      return;
    }

    const artist =
      currentSong.movie || currentCategory?.name || "U-Tube Radio";
    const artwork = currentSong.thumbnail
      ? [{ src: currentSong.thumbnail, sizes: "512x512", type: "image/jpeg" }]
      : [];

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentSong.title,
      artist,
      artwork,
    });

    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";

    try {
      navigator.mediaSession.setActionHandler("play", onPlay);
      navigator.mediaSession.setActionHandler("pause", onPause);
      navigator.mediaSession.setActionHandler(
        "nexttrack",
        canSkip ? onSkip : null
      );
    } catch (error) {
      console.error("Media session action handler failed", error);
    }

    return clearMediaSession;
  }, [
    currentSong?.id,
    currentSong?.title,
    currentSong?.movie,
    currentSong?.thumbnail,
    currentCategory?.name,
    isPlaying,
    playbackStatus,
    canSkip,
    onPlay,
    onPause,
    onSkip,
  ]);
}
