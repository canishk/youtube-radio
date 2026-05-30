import { useEffect, useState } from "react";

import {
  extractVideoId,
  getThumbnailUrl
} from "../../utils/youtube";

import FormControl from "../ui/FormControl";

const MOOD_SUGGESTIONS = [
  "melody",
  "travel",
  "rain",
  "romantic",
  "sad",
  "energetic",
  "party",
  "hip-hop",
  "dance",
  "devotional",
  "nostalgia",
  "friendship",
  "motivation",
  "night",
  "peaceful"
];

const TIME_SLOTS = [
  "morning",
  "workday",
  "afternoon",
  "evening",
  "night",
  "late_night",
  "deep_night"
];

function SongForm({
  categories,
  initialData,
  onSubmit,
  onCancel
}) {

  const [youtubeUrl, setYoutubeUrl] =
    useState("");

  const [videoId, setVideoId] =
    useState("");

  const [title, setTitle] =
    useState("");

  const [movie, setMovie] =
    useState("");

  const [categoryId, setCategoryId] =
    useState("");

  const [moodsInput, setMoodsInput] =
    useState("");

  const [selectedTimeSlots,
    setSelectedTimeSlots] =
    useState([]);

  const [energy, setEnergy] =
    useState(5);

  const [priority, setPriority] =
    useState(5);

  useEffect(() => {

    if (!initialData) {

      if (categories.length > 0) {

        setCategoryId(
          categories[0].id
        );
      }

      return;
    }

    setVideoId(
      initialData.youtube_video_id
    );

    setYoutubeUrl(
      `https://youtu.be/${initialData.youtube_video_id}`
    );

    setTitle(
      initialData.title || ""
    );

    setMovie(
      initialData.movie || ""
    );

    setCategoryId(
      initialData.category_id
    );

    setMoodsInput(
      (initialData.moods || [])
        .join(", ")
    );

    setSelectedTimeSlots(
      initialData.time_slots || []
    );

    setEnergy(
      Number(initialData.energy) || 5
    );

    setPriority(
      Number(initialData.priority) || 5
    );

  }, [
    initialData,
    categories
  ]);

  function handleYoutubeChange(
    value
  ) {

    setYoutubeUrl(value);

    const extracted =
      extractVideoId(value);

    setVideoId(extracted);
  }

  function addMood(mood) {

    const currentMoods =
      moodsInput
        .split(",")
        .map(m => m.trim())
        .filter(Boolean);

    if (
      currentMoods.includes(
        mood
      )
    ) {
      return;
    }

    const updated = [
      ...currentMoods,
      mood
    ];

    setMoodsInput(
      updated.join(", ")
    );
  }

  function toggleTimeSlot(
    slot
  ) {

    if (
      selectedTimeSlots.includes(
        slot
      )
    ) {

      setSelectedTimeSlots(
        selectedTimeSlots.filter(
          s => s !== slot
        )
      );

      return;
    }

    setSelectedTimeSlots([
      ...selectedTimeSlots,
      slot
    ]);
  }

  async function handleSubmit(
    event
  ) {

    event.preventDefault();

    const moodsArray =
      moodsInput
        .split(",")
        .map(m => m.trim())
        .filter(Boolean);

    await onSubmit({

      category_id:
        categoryId,

      youtube_video_id:
        videoId,

      title,

      movie,

      moods:
        moodsArray,

      time_slots:
        selectedTimeSlots,

      energy:
        Number(energy),

      priority:
        Number(priority)

    });
  }

  return (

    <form
      onSubmit={handleSubmit}
      className="
        bg-slate-900
        p-6
        rounded-lg
        mb-6
      "
    >

      <h2
        className="
          text-xl
          font-bold
          mb-4
        "
      >
        {initialData
          ? "Edit Song"
          : "Add Song"}
      </h2>

      <div className="mb-4">

        <label>
          YouTube URL
        </label>

        <FormControl
          value={youtubeUrl}
          onChange={(e) => handleYoutubeChange(e.target.value)}
          placeholder="https://youtu.be/..."
        />

      </div>

      {videoId && (

        <div className="mb-4">

          <p
            className="
              text-sm
              text-slate-400
              mb-2
            "
          >
            Video ID:
            {" "}
            {videoId}
          </p>

          <img
            src={
              getThumbnailUrl(
                videoId
              )
            }
            alt="thumbnail"
            className="
              w-48
              rounded-lg
            "
          />

        </div>

      )}

      <div className="mb-4">

        <label>
          Category
        </label>

        <FormControl
          as="select"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >

          {categories.map(
            category => (

              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>

            )
          )}

        </FormControl>

      </div>

      <div className="mb-4">

        <label>
          Title
        </label>

        <FormControl
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

      </div>

      <div className="mb-4">

        <label>
          Movie
        </label>

        <FormControl
          value={movie}
          onChange={(e) => setMovie(e.target.value)}
        />

      </div>

      <div className="mb-4">

        <label>
          Moods
        </label>

        <FormControl
          value={moodsInput}
          onChange={(e) => setMoodsInput(e.target.value)}
          placeholder="melody, travel"
        />

      </div>

      <div
        className="
          flex
          flex-wrap
          gap-2
          mb-4
        "
      >

        {MOOD_SUGGESTIONS.map(
          mood => (

            <button
              key={mood}
              type="button"
              onClick={() =>
                addMood(mood)
              }
              className="
                bg-blue-700
                px-2
                py-1
                rounded
                text-xs
              "
            >
              {mood}
            </button>

          )
        )}

      </div>

      <div className="mb-4">

        <label>
          Time Slots
        </label>

        <div
          className="
            grid
            grid-cols-2
            gap-2
            mt-2
          "
        >

          {TIME_SLOTS.map(
            slot => (

              <label
                key={slot}
              >

                <input
                  type="checkbox"
                  checked={
                    selectedTimeSlots.includes(
                      slot
                    )
                  }
                  onChange={() =>
                    toggleTimeSlot(
                      slot
                    )
                  }
                />

                {" "}
                {slot}

              </label>

            )
          )}

        </div>

      </div>

      <div className="mb-4">

        <label>
          Energy:
          {" "}
          {energy}
        </label>

        <input
          type="range"
          min="1"
          max="10"
          value={energy}
          onChange={(e) =>
            setEnergy(
              e.target.value
            )
          }
          className="w-full"
        />

      </div>

      <div className="mb-4">

        <label>
          Priority:
          {" "}
          {priority}
        </label>

        <input
          type="range"
          min="1"
          max="10"
          value={priority}
          onChange={(e) =>
            setPriority(
              e.target.value
            )
          }
          className="w-full"
        />

      </div>

      <div className="flex gap-3">

        <button
          type="submit"
          className="
            bg-green-600
            px-4
            py-2
            rounded
          "
        >
          Save
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="
            bg-slate-700
            px-4
            py-2
            rounded
          "
        >
          Cancel
        </button>

      </div>

    </form>

  );
}

export default SongForm;