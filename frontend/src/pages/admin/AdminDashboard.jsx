import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  getAnalyticsSummary,
  getDashboardData,
  getMetadataGaps,
  getTopSongs,
  getTopCategories,
  getTopMoods,
} from "../../services/adminApi";
import { getCurrentListeners } from "../../services/listenerApi";

const CHART_COLORS = {
  plays: "#8884d8",
  completions: "#82ca9d",
  resumes: "#ffc658",
  skips: "#ff6384",
  entries: "#8884d8",
  moods: "#82ca9d",
};

const PIE_COLORS = [CHART_COLORS.completions, CHART_COLORS.resumes, CHART_COLORS.skips];

const DARK_TOOLTIP_CLASS =
  "rounded border border-slate-700 bg-slate-900 p-2 text-sm text-slate-100 shadow";

const RECHARTS_TOOLTIP_PROPS = {
  contentStyle: {
    backgroundColor: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "0.25rem",
    color: "#f8fafc",
  },
  itemStyle: { color: "#f8fafc" },
  labelStyle: { color: "#f8fafc" },
};

const DashboardCard = ({ title, value }) => (
  <div className="p-4 bg-slate-900 rounded shadow border">
    <div className="text-sm text-gray-500">{title}</div>
    <div className="text-2xl font-bold">{value}</div>
  </div>
);

const ChartPanel = ({ title, children }) => (
  <div className="rounded border p-4">
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    {children}
  </div>
);

const truncateTitle = (title, maxLength = 12) =>
  title.length > maxLength ? `${title.slice(0, maxLength)}…` : title;

const buildPlaybackBreakdown = (analytics) => [
  { name: "Completions", value: analytics.completions },
  { name: "Resumes", value: analytics.resumes },
  { name: "Estimated Skips", value: analytics.estimated_skips },
];

const PlaybackTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value, payload: entry } = payload[0];
  const totalPlays = entry.totalPlays || 0;
  const percent = totalPlays > 0 ? Math.round((value / totalPlays) * 100) : 0;
  return (
    <div className={DARK_TOOLTIP_CLASS}>
      <div className="font-medium">{name}</div>
      <div>{value} ({percent}% of plays)</div>
    </div>
  );
};

const TopSongsTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const song = payload[0]?.payload;
  return (
    <div className={DARK_TOOLTIP_CLASS}>
      <div className="font-medium mb-1">{label}</div>
      {payload.map((entry) => (
        <div key={entry.dataKey}>
          {entry.name}: {entry.value}
        </div>
      ))}
      {song?.completion_rate != null && (
        <div className="mt-1 text-slate-400">Completion rate: {song.completion_rate}%</div>
      )}
    </div>
  );
};

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [metadataGaps, setMetadataGaps] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [currentListeners, setCurrentListeners] = useState(0);
  const [topSongs, setTopSongs] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [topMoods, setTopMoods] = useState([]);

  async function loadCurrentListeners() {
    try {
      const data = await getCurrentListeners();
      setCurrentListeners(data.current_listeners || 0);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    async function load() {
      try {
        const [
          dashboardData,
          gapsData,
          analyticsData,
          topSongsData,
          topCategoriesData,
          topMoodsData,
        ] = await Promise.all([
          getDashboardData(),
          getMetadataGaps(),
          getAnalyticsSummary(),
          getTopSongs(),
          getTopCategories(),
          getTopMoods(),
        ]);
        setDashboard(dashboardData);
        setMetadataGaps(gapsData);
        setAnalytics(analyticsData);
        setTopSongs(topSongsData);
        setTopCategories(topCategoriesData);
        setTopMoods(topMoodsData);
      } catch (error) {
        console.error(error);
      }
    }
    load();
    loadCurrentListeners();
  }, []);

  useEffect(() => {
    loadCurrentListeners();
    const interval = setInterval(loadCurrentListeners, 60000);
    return () => clearInterval(interval);
  }, []);

  const playbackBreakdown = analytics ? buildPlaybackBreakdown(analytics) : [];
  const playbackBreakdownWithTotal = playbackBreakdown.map((slice) => ({
    ...slice,
    totalPlays: analytics?.plays || 0,
  }));
  const moodChartData = topMoods.map((item) => ({
    ...item,
    mood: item.mood || "Unknown",
  }));

  return (
    <>
      <div className="p-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      {analytics && (
        <div className="px-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            <DashboardCard title="Current Listeners" value={currentListeners} />
            <DashboardCard title="Total Plays" value={analytics.plays} />
            <DashboardCard title="Completions" value={analytics.completions} />
            <DashboardCard title="Completion Rate" value={`${analytics.completion_rate}%`} />
            <DashboardCard title="Resumes" value={analytics.resumes} />
            <DashboardCard title="Estimated Skips" value={analytics.estimated_skips} />
            <DashboardCard title="Tracked Songs" value={analytics.songs_tracked} />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <ChartPanel title="Playback Breakdown">
              {analytics.plays > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={playbackBreakdownWithTotal}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) =>
                        `${name} ${Math.round(percent * 100)}%`
                      }
                    >
                      {playbackBreakdownWithTotal.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PlaybackTooltip />} {...RECHARTS_TOOLTIP_PROPS} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-gray-500 py-12 text-center">No data yet</div>
              )}
            </ChartPanel>

            <ChartPanel title="Top Songs">
              {topSongs.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topSongs}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="title"
                      tickFormatter={truncateTitle}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis />
                    <Tooltip content={<TopSongsTooltip />} {...RECHARTS_TOOLTIP_PROPS} />
                    <Legend />
                    <Bar dataKey="play_count" name="Plays" fill={CHART_COLORS.plays} />
                    <Bar dataKey="completion_count" name="Completions" fill={CHART_COLORS.completions} />
                    <Bar dataKey="resume_count" name="Resumes" fill={CHART_COLORS.resumes} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-gray-500 py-12 text-center">No data yet</div>
              )}
            </ChartPanel>

            <ChartPanel title="Top Categories">
              {topCategories.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topCategories}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip {...RECHARTS_TOOLTIP_PROPS} />
                    <Legend />
                    <Bar dataKey="entries" name="Entries" fill={CHART_COLORS.entries} />
                    <Bar dataKey="completions" name="Completions" fill={CHART_COLORS.completions} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-gray-500 py-12 text-center">No data yet</div>
              )}
            </ChartPanel>

            <ChartPanel title="Top Moods">
              {moodChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={moodChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mood" />
                    <YAxis />
                    <Tooltip {...RECHARTS_TOOLTIP_PROPS} />
                    <Bar dataKey="count" name="Songs" fill={CHART_COLORS.moods} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-gray-500 py-12 text-center">No data yet</div>
              )}
            </ChartPanel>
          </div>
        </div>
      )}

      {dashboard && (
        <div className="px-6 mb-8 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <DashboardCard title="Songs" value={dashboard.overview.total_songs} />
            <DashboardCard title="Categories" value={dashboard.overview.total_categories} />
            <DashboardCard title="Healthy" value={dashboard.overview.total_video_health} />
            <DashboardCard title="Failed" value={dashboard.overview.failed_video} />
          </div>

          <ChartPanel title="Metadata Health">
            <div className="grid md:grid-cols-2 gap-4">
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
                <span className="font-semibold ml-2">
                  {dashboard.metadata.missing_energy}
                </span>
                <span className="text-sm text-gray-500 ml-2">
                  ({dashboard.metadata.energy_coverage}% coverage)
                </span>
              </div>

              <div>
                Missing Priority:
                <span className="font-semibold ml-2">
                  {dashboard.metadata.missing_priority}
                </span>
                <span className="text-sm text-gray-500 ml-2">
                  ({dashboard.metadata.priority_coverage}% coverage)
                </span>
              </div>
            </div>
          </ChartPanel>

          <ChartPanel title="Category Health">
            <table className="w-full text-left">
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
          </ChartPanel>

          <ChartPanel title="Metadata Gap Explorer">
            {metadataGaps.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr>
                      <th className="pb-2">Song</th>
                      <th className="pb-2">Movie</th>
                      <th className="pb-2">Missing Fields</th>
                    </tr>
                  </thead>

                  <tbody>
                    {metadataGaps.map((song) => (
                      <tr key={song.song_id} className="border-t">
                        <td className="py-2">{song.title || "-"}</td>
                        <td className="py-2">{song.movie || "-"}</td>
                        <td className="py-2">
                          <span className="text-red-600 font-medium">
                            {song.missing_fields.join(", ")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-green-600">✓ No metadata gaps found.</div>
            )}
          </ChartPanel>
        </div>
      )}
    </>
  );
}

export default AdminDashboard;
