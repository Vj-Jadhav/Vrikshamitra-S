import React from 'react';
import { Users, Award, Target, TrendingUp } from "lucide-react";
import StatsCard from './StatsCard';

// This would typically come from props or context
const users = [
  { id: 1, name: "Alice", role: "Student", ecoPoints: 120 },
  { id: 2, name: "Bob", role: "Student", ecoPoints: 90 },
  { id: 3, name: "Charlie", role: "Teacher", ecoPoints: "-" },
];

const challenges = [
  { id: 1, title: "Plant 5 Trees", points: 50, status: "Active" },
  { id: 2, title: "Clean Campus", points: 40, status: "Pending" },
  { id: 3, title: "Recycle 10 Items", points: 30, status: "Active" },
];

export default function StatsGrid() {
  const totalEcoPoints = users
    .filter(u => u.role === "Student")
    .reduce((acc, u) => acc + u.ecoPoints, 0);

  const stats = [
    {
      title: "Total Students",
      value: users.filter(u => u.role === "Student").length,
      icon: Users,
      color: "from-emerald-500 to-teal-600",
      change: "+12%"
    },
    {
      title: "Total Teachers",
      value: users.filter(u => u.role === "Teacher").length,
      icon: Award,
      color: "from-blue-500 to-indigo-600",
      change: "+5%"
    },
    {
      title: "Active Challenges",
      value: challenges.filter(c => c.status === "Active").length,
      icon: Target,
      color: "from-purple-500 to-pink-600",
      change: "+8%"
    },
    {
      title: "Total EcoPoints",
      value: totalEcoPoints,
      icon: TrendingUp,
      color: "from-orange-500 to-red-600",
      change: "+23%"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, idx) => (
        <StatsCard
          key={idx}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
          change={stat.change}
        />
      ))}
    </div>
  );
}