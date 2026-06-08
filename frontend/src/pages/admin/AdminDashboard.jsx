import { useState, useEffect } from "react";

import { getAnalyticsSummary, getDashboardData, getMetadataGaps } from "../../services/adminApi";

const DashboardCard = ({ title, value }) => (
  <div className="p-4 bg-black-50 rounded shadow border">
    <div className="text-sm text-gray-500">{title}</div>
    <div className="text-2xl font-bold">{value}</div>
  </div>
);

function AdminDashboard() {

  const [dashboard, setDashboard] = useState(null);
  const [metadataGaps, setMetadataGaps] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  
  useEffect(() => {
    async function load() {
      try {

        const [ dashboardData, gapsData ] = await Promise.all([getDashboardData(),getMetadataGaps()]);
        const analyticsData = await getAnalyticsSummary();
        setDashboard(dashboardData);
        setMetadataGaps(gapsData);
        setAnalytics(analyticsData);
      } catch (error) {

        console.error(error);
      }
    }
    load();
  }, []);

  return (
    <>
      <div className="p-6">

        <h1
          className="
          text-3xl
          font-bold
        "
        >
          Admin Dashboard
        </h1>

      </div>

      {dashboard && (

        <div
          className="
          grid
          grid-cols-2
          md:grid-cols-4
          gap-4
          mb-8
        "
        >

          <DashboardCard title="Songs" value={dashboard.overview.total_songs} />

          <DashboardCard title="Categories" value={dashboard.overview.total_categories} />

          <DashboardCard title="Healthy" value={dashboard.overview.total_video_health} />

          <DashboardCard title="Failed" value={dashboard.overview.failed_video} />

        </div>
      )}

      {dashboard && (
        <div className="mt-6 rounded border">

          <h2
            className="
          text-xl
          font-semibold
          mb-4
        "
          >
            Metadata Health
          </h2>

          <div
            className="
            grid
            md:grid-cols-2
            gap-4
          "
          >

            <div>
              Missing Moods:
              <span className="font-semibold ml-2">
                {dashboard.metadata.missing_moods}
              </span>

              <span className="text-sm text-gray-500 ml-2">
                ({dashboard.metadata.mood_coverage}% coverage)
              </span>
            </div>

            <div>
              Missing Time Slots: 
              <span className="font-semibold ml-2">
                {dashboard.metadata.missing_time_slots}
              </span>
              <span className="text-sm text-gray-500 ml-2">
                ({dashboard.metadata.time_slot_coverage}% coverage)
              </span>
            </div>

            <div>
              Missing Energy:
              <span className="font-semibold m1-2">
                {dashboard.metadata.missing_energy}
              </span>
              <span className="text-sm text-gray-500 ml-2">
                ({dashboard.metadata.energy_coverage}% coverage)
              </span>
            </div>

            <div>
              Missing Priority: 
              <span className="font-semibold m1-2">
                {dashboard.metadata.missing_priority}
              </span>
              <span className="text-sm text-gray-500 ml-2">
                ({dashboard.metadata.priority_coverage}% coverage)
              </span>
            </div>

          </div>

        </div>
      )}
      {analytics && (
        <div className="mb-8">

          <h2
            className="
              text-xl
              font-semibold
              mb-4
            "
          >
            Listener Analytics
          </h2>

          <div
            className="
              grid
              grid-cols-2
              md:grid-cols-3
              gap-4
            "
          >
            <DashboardCard title="Total Plays"value={analytics.plays}/>
            <DashboardCard title="Completions" value={analytics.completions}/>
            <DashboardCard title="Completion Rate" value={`${analytics.completion_rate}%`}/>
            <DashboardCard title="Resumes"value={analytics.resumes}/>
            <DashboardCard title="Estimated Skips" value={analytics.estimated_skips}/>
            <DashboardCard title="Tracked Songs" value={analytics.songs_tracked}/>
          </div>

        </div>
      )}
      {dashboard && (
        <div className="mt-6 rounded border">

          <h2
            className="
        text-xl
        font-semibold
        mb-4
      "
          >
            Category Health
          </h2>

          <table
            className="
        w-full
        text-left
      "
          >

            <thead>

              <tr>

                <th>Category</th>

                <th>Songs</th>

                <th>Status</th>

              </tr>

            </thead>

            <tbody>

              {dashboard.category_health.map((category) => (

                <tr key={category.id}>

                  <td>{category.name}</td>

                  <td>{category.song_count}</td>

                  <td>{category.low_inventory ? "⚠ Low Inventory" : "Healthy"}</td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>
      )}

      {metadataGaps.length > 0 && (

        <div className="mt-8 rounded border p-4">

          <h2
            className="
              text-xl
              font-semibold
              mb-4
            "
          >
            Metadata Gap Explorer
          </h2>

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead>

                <tr>

                  <th className="pb-2">
                    Song
                  </th>

                  <th className="pb-2">
                    Movie
                  </th>

                  <th className="pb-2">
                    Missing Fields
                  </th>

                </tr>

              </thead>

              <tbody>

                {metadataGaps.map(song => (

                  <tr
                    key={song.song_id}
                    className="border-t"
                  >

                    <td className="py-2">
                      {song.title || "-"}
                    </td>

                    <td className="py-2">
                      {song.movie || "-"}
                    </td>

                    <td className="py-2">

                      <span
                        className="
                          text-red-600
                          font-medium
                        "
                      >
                        {song.missing_fields.join(", ")}
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>
      )}

      {metadataGaps.length === 0 && (

        <div className="mt-8 rounded border p-4">

          <h2
            className="
              text-xl
              font-semibold
              mb-2
            "
          >
            Metadata Gap Explorer
          </h2>

          <div className="text-green-600">

            ✓ No metadata gaps found.

          </div>

        </div>
      )}

    </>
  );
}

export default AdminDashboard;