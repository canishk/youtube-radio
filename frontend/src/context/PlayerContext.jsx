import {
  createContext,
  useContext,
  useState,
} from "react";

const PlayerContext = createContext();

export function PlayerProvider({
  children
}) {

  const [currentSong, setCurrentSong] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [queue, setQueue] = useState([]);
  const [playbackStatus, setPlaybackStatus] = useState("stopped");

  const value = {

    currentSong,
    setCurrentSong,

    currentCategory,
    setCurrentCategory,

    isPlaying,
    setIsPlaying,

    volume,
    setVolume,

    queue,
    setQueue,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}