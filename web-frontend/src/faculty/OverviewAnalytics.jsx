// src/faculty/OverviewAnalytics.jsx
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

/**
 * Props:
 *  - analytics: object from backend (see assumed format below)
 *  - loading: boolean
 *  - error: string
 *  - refresh: function to reload data
 *
 * Assumed backend response shape (example):
 * {
 *   totalStudents: 240,
 *   totalEcoPoints: 18200,
 *   activeChallenges: 32,
 *   participationRate: 87,
 *   monthlyParticipation: [{ _id: { month: 1 }, count: 60 }, ...] OR [{month: "Jan", count: 60}, ...],
 *   topClasses: [{ _id: "9A", submissions: 1500 }, { className: "9B", submissions: 1200 }],
 *   activityDistribution: [{ _id: "quizzes", count: 40 }, { _id: "assignments", count: 30 }]
 * }
 */

const COLORS = ["#22c55e", "#06b6d4", "#f59e0b", "#ef4444", "#6366f1", "#0ea5a4"];

const Loader = () => (
  <div className="py-12 flex items-center justify-center">
    <div className="text-gray-500">Loading analytics...</div>
  </div>
);

export default function OverviewAnalytics({ analytics, loading, error, refresh }) {
  if (loading) return <Loader />;
  if (error)
    return (
      <div className="p-6 bg-white rounded shadow">
        <div className="flex items-center justify-between">
          <div className="text-red-600">Failed to load analytics: {error}</div>
          <button
            onClick={refresh}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );

  // safe defaults
  const totalStudents = analytics?.totalStudents ?? 0;
  const totalEcoPoints = analytics?.totalEcoPoints ?? 0;
  const activeChallenges = analytics?.activeChallenges ?? 0;
  const participationRate = analytics?.participationRate ?? 0;

  // transform monthlyParticipation into [{month: 'Jan', count: 10}, ...]
  const monthLabels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  let monthlyData = [];
  if (Array.isArray(analytics?.monthlyParticipation)) {
    // Accept either aggregate result with _id.month or plain {month,count}
    monthlyData = analytics.monthlyParticipation.map((m) => {
      if (m._id && typeof m._id.month === "number") {
        return {
          month: monthLabels[m._id.month - 1] || `M${m._id.month}`,
          count: m.count ?? 0,
        };
      }
      return { month: m.month || m._id || "N/A", count: m.count ?? m.value ?? 0 };
    });
  }

  // topClasses -> [{name, submissions}]
  let topClassesData = [];
  if (Array.isArray(analytics?.topClasses)) {
    topClassesData = analytics.topClasses.map((c) => {
      let name = c.className || c._id?.name || c._id || c.name || "Unknown";
      let value = c.submissions ?? c.count ?? c.value ?? 0;
      return { name: String(name), submissions: value };
    });
  }

  // activityDistribution as array
  let activityData = [];
  if (Array.isArray(analytics?.activityDistribution)) {
    activityData = analytics.activityDistribution.map((a) => {
      const name = a._id || a.type || a.name;
      const value = a.count ?? a.value ?? 0;
      return { name: String(name), value };
    });
  } else if (analytics?.activityDistribution && typeof analytics.activityDistribution === "object") {
    // maybe object: { quizzes: 40, assignments: 30 }
    activityData = Object.keys(analytics.activityDistribution).map((k) => ({
      name: k,
      value: analytics.activityDistribution[k] || 0,
    }));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800">Faculty Dashboard</h2>
        <div className="text-sm text-gray-600">Overview & analytics</div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Total Students</div>
          <div className="mt-2 text-2xl font-bold text-gray-800 flex items-center">
            <span className="mr-2">👥</span> {totalStudents}
          </div>
          <div className="text-xs text-gray-400 mt-1">Registered students</div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Total EcoPoints</div>
          <div className="mt-2 text-2xl font-bold text-gray-800 flex items-center">
            <span className="mr-2">🏆</span> {totalEcoPoints}
          </div>
          <div className="text-xs text-gray-400 mt-1">Accumulated by students</div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Active Challenges</div>
          <div className="mt-2 text-2xl font-bold text-gray-800 flex items-center">
            <span className="mr-2">🎯</span> {activeChallenges}
          </div>
          <div className="text-xs text-gray-400 mt-1">Currently active</div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Participation Rate</div>
          <div className="mt-2 text-2xl font-bold text-gray-800 flex items-center">
            <span className="mr-2">📈</span> {participationRate}%
          </div>
          <div className="text-xs text-gray-400 mt-1">Submissions / student</div>
        </div>
      </div>

      {/* Charts area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line chart - Student Participation Trend */}
        <div className="bg-white p-4 rounded shadow col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-700">Student Participation Trend</h3>
            <div className="text-sm text-gray-500">Last 12 months</div>
          </div>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={monthlyData.length ? monthlyData : [{ month: "No data", count: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie chart - Activity Distribution */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Activity Distribution</h3>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={activityData.length ? activityData : [{ name: "No data", value: 1 }]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {(activityData.length ? activityData : [{ name: "No data", value: 1 }]).map(
                    (entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    )
                  )}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Classes - Bar chart */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Top Performing Classes</h3>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={topClassesData.length ? topClassesData : [{ name: "No data", submissions: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="submissions" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
