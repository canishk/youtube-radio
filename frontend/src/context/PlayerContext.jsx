import {
  createContext,
  useContext,
  useEffect,
  useRef,
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
  const [resumePosition, setResumePosition] = useState(0);
  const [consecutiveSkips, setConsecutiveSkips] = useState(0);
  const [pendingHandoff, setPendingHandoff] = useState(null);
  const [isPlayerMinimized, setIsPlayerMinimized] = useState(false);
  const prevCategoryIdRef = useRef(undefined);

  function clearPendingHandoff() {
    setPendingHandoff(null);
  }

  function togglePlayerMinimized() {
    setIsPlayerMinimized((previous) => !previous);
  }

  useEffect(() => {
    const categoryId = currentCategory?.id ?? null;
    if (prevCategoryIdRef.current !== undefined && prevCategoryIdRef.current !== categoryId) {
      setConsecutiveSkips(0);
      setPendingHandoff(null);
    }
    prevCategoryIdRef.current = categoryId;
  }, [currentCategory?.id]);

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

    playbackStatus,
    setPlaybackStatus,

    resumePosition,
    setResumePosition,

    consecutiveSkips,
    setConsecutiveSkips,

    pendingHandoff,
    setPendingHandoff,
    clearPendingHandoff,

    isPlayerMinimized,
    setIsPlayerMinimized,
    togglePlayerMinimized,
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