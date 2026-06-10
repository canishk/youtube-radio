import { useEffect, useRef, useState } from "react";

export const HANDOFF_COUNTDOWN_SECONDS = 15;

function CategoryHandoffCard({
  currentCategoryName,
  recommendedCategory,
  sharedMoods,
  onAccept,
  onCancel,
}) {
  const [secondsLeft, setSecondsLeft] = useState(HANDOFF_COUNTDOWN_SECONDS);
  const onAcceptRef = useRef(onAccept);
  const acceptedRef = useRef(false);

  onAcceptRef.current = onAccept;

  function handleAccept() {
    if (acceptedRef.current) {
      return;
    }
    acceptedRef.current = true;
    onAcceptRef.current();
  }

  useEffect(() => {
    if (!recommendedCategory) {
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((previous) => {
        if (previous <= 1) {
          clearInterval(interval);
          handleAccept();
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [recommendedCategory]);

  const moodLabel =
    sharedMoods?.length > 0
      ? sharedMoods.join(", ")
      : "a similar vibe";

  return (
    <div
      className="
        bg-slate-900
        border
        border-slate-700
        rounded-xl
        p-5
        mb-6
      "
    >
      <h2 className="text-lg font-semibold">
        Station Complete
      </h2>

      <p className="text-slate-400 mt-2">
        {recommendedCategory ? (
          <>
            You&apos;ve heard everything in{" "}
            <span className="text-white">{currentCategoryName}</span>.
            Try{" "}
            <span className="text-white">{recommendedCategory.name}</span>
            {" — "}similar mood: {moodLabel}.
          </>
        ) : (
          <>
            You&apos;ve heard everything in{" "}
            <span className="text-white">{currentCategoryName}</span>.
            No similar stations are left right now.
          </>
        )}
      </p>

      {recommendedCategory && (
        <p className="text-slate-500 text-sm mt-3">
          Switching in {secondsLeft}s…
        </p>
      )}

      <div className="flex gap-3 mt-5">
        {recommendedCategory && (
          <button
            onClick={handleAccept}
            className="
              bg-red-600
              hover:bg-red-700
              px-4
              py-2
              rounded-lg
            "
          >
            Continue now
          </button>
        )}

        <button
          onClick={onCancel}
          className="
            bg-slate-700
            hover:bg-slate-600
            px-4
            py-2
            rounded-lg
          "
        >
          {recommendedCategory ? "Stay here" : "Dismiss"}
        </button>
      </div>
    </div>
  );
}

export default CategoryHandoffCard;
