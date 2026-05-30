import {
  useEffect,
  useState
} from "react";

import {
  getVideoHealth,
  enableVideo
} from "../../services/adminApi";

function VideoHealthPage() {

  const [videos,
    setVideos] =
    useState([]);

  const [search,
    setSearch] =
    useState("");

  useEffect(() => {

    loadVideos();

  }, []);

  async function loadVideos() {

    const data =
      await getVideoHealth();

    setVideos(data);
  }

  async function handleEnable(
    videoId
  ) {

    await enableVideo(
      videoId
    );

    await loadVideos();
  }

  const filteredVideos =
    videos.filter(video =>
      video.youtube_video_id
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  return (

    <div className="p-6">

      <h1
        className="
          text-2xl
          font-bold
          mb-6
        "
      >
        Video Health
      </h1>

      <input
        value={search}
        onChange={(e) =>
          setSearch(
            e.target.value
          )
        }
        placeholder="Search Video ID"
        className="
          p-2
          rounded
          text-black
          mb-6
          w-full
        "
      />

      {filteredVideos.map(
        video => (

          <div
            key={
              video.youtube_video_id
            }
            className="
              bg-slate-900
              rounded-lg
              p-4
              mb-4
            "
          >

            <div
              className="
                flex
                justify-between
              "
            >

              <div>

                <p
                  className="
                    font-semibold
                  "
                >
                  {
                    video.youtube_video_id
                  }
                </p>

                <p>
                  Failures:
                  {" "}
                  {
                    video.failure_count
                  }
                </p>

                <p>
                  Reason:
                  {" "}
                  {
                    video.last_failure_reason ||
                    "-"
                  }
                </p>

                <p>
                  Checked:
                  {" "}
                  {
                    video.last_checked
                  }
                </p>

              </div>

              <img
                src={`https://img.youtube.com/vi/${video.youtube_video_id}/hqdefault.jpg`}
                alt="thumbnail"
                className="
                  w-32
                  rounded
                "
              />

            </div>

            <div
              className="
                mt-3
                flex
                items-center
                gap-4
              "
            >

              <span
                className={
                  video.is_playable
                    ? "bg-green-700 px-3 py-1 rounded"
                    : "bg-red-700 px-3 py-1 rounded"
                }
              >
                {
                  video.failure_count === 0 ? "Healthy" : video.is_playable ? "Warning" : "Disabled"
                }
              </span>

              {!video.is_playable && (

                <button
                  onClick={() =>
                    handleEnable(
                      video.youtube_video_id
                    )
                  }
                  className="
                    bg-blue-600
                    px-3
                    py-1
                    rounded
                  "
                >
                  Re-enable
                </button>

              )}

            </div>

          </div>

        )
      )}

    </div>

  );
}

export default VideoHealthPage;