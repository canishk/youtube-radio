import { useEffect, useMemo, useState } from "react";

import { getSongs } from "../../services/adminApi";

function SongsPage() {
  const [songs, setSongs] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    loadSongs();
  }, []);

  async function loadSongs() {
    const data = await getSongs();
    setSongs(data);
  }

  const categories = useMemo(() => {
    return [
      "all",
      ...new Set(songs.map((song) => song.category_id)),
    ];
  }, [songs]);

  const filteredSongs = songs.filter((song) => {
    const matchesSearch =
      song.title.toLowerCase().includes(search.toLowerCase()) ||
      song.movie.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || song.category_id === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded border border-slate-700 bg-slate-900 p-2 text-white"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search songs"
          className="rounded border border-slate-700 bg-white p-2 text-black"
        />
      </div>

      {filteredSongs.map((song) => (
        <div
          key={song.id}
          className="bg-slate-900 p-4 rounded-lg mb-3"
        >
          <h3 className="text-lg font-semibold">{song.title}</h3>
          <p>{song.movie}</p>
          <p className="text-sm text-slate-400">{song.category_id}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {song.moods.map((mood) => (
              <span
                key={mood}
                className="bg-blue-700 px-2 py-1 rounded text-xs"
              >
                {mood}
              </span>
            ))}
          </div>
          <div className="mt-2 text-sm text-slate-300">
            Energy: {song.energy} | Priority: {song.priority}
          </div>
        </div>
      ))}
    </div>
  );
}

export default SongsPage;
