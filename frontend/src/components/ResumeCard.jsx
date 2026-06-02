import { formatDuration } from "../utils/timeFormatter";

function ResumeCard({
  categoryName,
  songTitle,
  thumbnail,
  resumePosition,
  canResumeSong,
  onResume,
  onStartFresh
}) {
  console.log(songTitle);
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
      <h2
        className="
          text-lg
          font-semibold
        "
      >
        Welcome Back
      </h2>

      <p
        className="
          text-slate-400
          mt-2
        "
      >
        Continue listening?
      </p>

      <div
        className="
          mt-4
          flex
          items-center
          gap-4
        "
      >
        {thumbnail && (
          <img
            src={thumbnail}
            alt={songTitle}
            className="
              w-16
              h-16
              rounded-lg
              object-cover
            "
          />
        )}

        <div>
          {songTitle && (
            <p
              className="
                font-semibold
                text-white
              "
            >
              {songTitle}
            </p>
          )}

          <p
            className="
              text-slate-300
              text-sm
            "
          >
            {categoryName}
          </p>

          {canResumeSong && (
            <p
              className="
                text-green-400
                text-sm
                mt-1
              "
            >
              Resume at{" "}
              {formatDuration(
                resumePosition
              )}
            </p>
          )}
        </div>
      </div>

      <div
        className="
          flex
          gap-3
          mt-5
        "
      >
        <button
          onClick={onResume}
          className="
            bg-red-600
            hover:bg-red-700
            px-4
            py-2
            rounded-lg
          "
        >
          Resume
        </button>

        <button
          onClick={onStartFresh}
          className="
            bg-slate-700
            hover:bg-slate-600
            px-4
            py-2
            rounded-lg
          "
        >
          Start Fresh
        </button>
      </div>
    </div>
  );
}

export default ResumeCard;