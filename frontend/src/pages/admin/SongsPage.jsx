import { useEffect, useMemo, useState } from "react";

import {
  getSongs,
  getCategories,
  createSong,
  updateSong,
  deleteSong
} from "../../services/adminApi";

import FormControl from "../../components/ui/FormControl";
import SongForm from "../../components/admin/SongForm";

function SongsPage() {

  const [songs, setSongs] =
    useState([]);

  const [categories, setCategories] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [categoryFilter,
    setCategoryFilter] =
    useState("all");

  const [showForm,
    setShowForm] =
    useState(false);

  const [editingSong,
    setEditingSong] =
    useState(null);

  useEffect(() => {

    loadData();

  }, []);

  async function loadData() {

    const [
      songsData,
      categoriesData
    ] = await Promise.all([
      getSongs(),
      getCategories()
    ]);

    setSongs(songsData);

    setCategories(
      categoriesData
    );
  }

  async function handleCreate(
    payload
  ) {

    await createSong(
      payload
    );

    setShowForm(false);

    await loadData();
  }

  async function handleUpdate(
    payload
  ) {

    await updateSong(
      editingSong.id,
      payload
    );

    setEditingSong(null);

    await loadData();
  }

  async function handleDelete(
    song
  ) {

    const confirmed =
      window.confirm(
        `Delete "${song.title}"?`
      );

    if (!confirmed) {
      return;
    }

    await deleteSong(
      song.id
    );

    await loadData();
  }

  const categoryOptions =
    useMemo(() => {

      return [
        "all",
        ...new Set(
          songs.map(
            song =>
              song.category_id
          )
        )
      ];

    }, [songs]);

  const filteredSongs =
    songs.filter(song => {

      const matchesSearch =

        song.title
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )

        ||

        song.movie
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const matchesCategory =

        categoryFilter ===
        "all"

        ||

        song.category_id ===
        categoryFilter;

      return (
        matchesSearch
        &&
        matchesCategory
      );
    });

  return (

    <div className="p-6">

      <div
        className="
          flex
          justify-between
          items-center
          mb-6
        "
      >

        <h1
          className="
            text-2xl
            font-bold
          "
        >
          Songs
        </h1>

        <button
          onClick={() =>
            setShowForm(true)
          }
          className="
            bg-green-600
            px-4
            py-2
            rounded
          "
        >
          Add Song
        </button>

      </div>

      {showForm && (

        <SongForm
          categories={categories}
          onSubmit={
            handleCreate
          }
          onCancel={() =>
            setShowForm(false)
          }
        />

      )}

      {editingSong && (

        <SongForm
          categories={categories}
          initialData={
            editingSong
          }
          onSubmit={
            handleUpdate
          }
          onCancel={() =>
            setEditingSong(null)
          }
        />

      )}

      <div
        className="
          mb-6
          flex
          flex-col
          gap-3
          sm:flex-row
        "
      >

        <select
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(
              e.target.value
            )
          }
          className="
            rounded
            border
            border-slate-700
            bg-slate-900
            p-2
            text-white
          "
        >

          {categoryOptions.map(
            category => (

              <option
                key={category}
                value={category}
              >
                {category}
              </option>

            )
          )}

        </select>

        <FormControl
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search songs"
        />

      </div>

      {filteredSongs.map(
        song => (

          <div
            key={song.id}
            className="
              bg-slate-900
              p-4
              rounded-lg
              mb-3
            "
          >

            <div
              className="
                flex
                justify-between
                items-start
              "
            >

              <div>

                <h3
                  className="
                    text-lg
                    font-semibold
                  "
                >
                  {song.title}
                </h3>

                <p>
                  {song.movie}
                </p>

                <p
                  className="
                    text-sm
                    text-slate-400
                  "
                >
                  {song.category_id}
                </p>

              </div>

              <img
                src={
                  `https://img.youtube.com/vi/${song.youtube_video_id}/hqdefault.jpg`
                }
                alt={
                  song.title
                }
                className="
                  w-28
                  rounded
                "
              />

            </div>

            <div
              className="
                flex
                flex-wrap
                gap-2
                mt-3
              "
            >

              {song.moods.map(
                mood => (

                  <span
                    key={mood}
                    className="
                      bg-blue-700
                      px-2
                      py-1
                      rounded
                      text-xs
                    "
                  >
                    {mood}
                  </span>

                )
              )}

            </div>

            <div
              className="
                mt-2
                text-sm
                text-slate-300
              "
            >

              Energy:
              {" "}
              {song.energy}

              {" | "}

              Priority:
              {" "}
              {song.priority}

            </div>

            <div
              className="
                flex
                gap-3
                mt-4
              "
            >

              <button
                onClick={() =>
                  setEditingSong(
                    song
                  )
                }
                className="
                  bg-yellow-600
                  px-3
                  py-1
                  rounded
                "
              >
                Edit
              </button>

              <button
                onClick={() =>
                  handleDelete(
                    song
                  )
                }
                className="
                  bg-red-600
                  px-3
                  py-1
                  rounded
                "
              >
                Delete
              </button>

            </div>

          </div>

        )
      )}

    </div>

  );
}

export default SongsPage;