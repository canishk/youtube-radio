import { useState, useEffect } from "react";

import { getDashboardData } from "../../services/adminApi";

const DashboardCard = ({ title, value }) => (
  <div className="p-4 bg-green rounded shadow border">
    <div className="text-sm text-gray-500">{title}</div>
    <div className="text-2xl font-bold">{value}</div>
  </div>
);

function AdminDashboard() {

  const [dashboard, setDashboard] = useState(null);
  useEffect(() => {
    async function load() {
      try {
        const data = await getDashboardData();
        setDashboard(data);
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
              Missing Moods: {dashboard.metadata.missing_moods}
            </div>

            <div>
              Missing Time Slots: {dashboard.metadata.missing_time_slots}
            </div>

            <div>
              Missing Energy: {dashboard.metadata.missing_energy}
            </div>

            <div>
              Missing Priority: {dashboard.metadata.missing_priority}
            </div>

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

    </>
  );
}

export default AdminDashboard;