import { useEffect, useState } from "react";

const COMPACT_MEDIA_QUERIES = [
  "(max-width: 1023px)",
  "(display-mode: standalone)",
  "(pointer: coarse)",
];

function getIsCompactPlayer() {
  if (typeof window === "undefined") {
    return false;
  }

  const narrow = window.matchMedia("(max-width: 1023px)").matches;
  const standalone = window.matchMedia("(display-mode: standalone)").matches;
  const touch = window.matchMedia("(pointer: coarse)").matches;

  return narrow || standalone || touch;
}

export function useIsCompactPlayer() {
  const [isCompact, setIsCompact] = useState(getIsCompactPlayer);

  useEffect(() => {
    const mediaQueries = COMPACT_MEDIA_QUERIES.map((query) =>
      window.matchMedia(query)
    );

    function update() {
      setIsCompact(getIsCompactPlayer());
    }

    update();
    mediaQueries.forEach((mediaQuery) => {
      mediaQuery.addEventListener("change", update);
    });

    return () => {
      mediaQueries.forEach((mediaQuery) => {
        mediaQuery.removeEventListener("change", update);
      });
    };
  }, []);

  return isCompact;
}
