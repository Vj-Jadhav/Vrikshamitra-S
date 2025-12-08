import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Moon, Sun, ChevronRight, UserPlus } from "lucide-react";

// Simple Modal component
const Modal = ({ open, onClose, children, title }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-xl w-full p-6 z-10">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="text-gray-500 hover:text-gray-800">✕</button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};

// Animated Counter
const Counter = ({ value, label, duration = 800 }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const stepTime = Math.max(Math.floor(duration / value), 12);
    const timer = setInterval(() => {
      start += Math.ceil(value / (duration / stepTime));
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else setCount(start);
    }, stepTime);
    return () => clearInterval(timer);
  }, [value, duration]);
  return (
    <div className="text-center">
      <div className="text-3xl font-bold">{count}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState("light");
  const [challengeModal, setChallengeModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [joined, setJoined] = useState([]);

  const features = [
    {
      title: "Gamified Learning",
      desc: "Interactive lessons and quizzes to make environmental learning fun.",
      icon: "🎮",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Real-World Tasks",
      desc: "Complete activities like tree-planting, waste segregation, and more.",
      icon: "🌍",
      gradient: "from-green-500 to-blue-500",
    },
    {
      title: "Leaderboards & Badges",
      desc: "Earn eco-points, badges, and compete with peers.",
      icon: "🏆",
      gradient: "from-yellow-500 to-orange-500",
    },
  ];

  const sampleChallenges = [
    { id: 1, title: "Plant 5 Trees", points: 50, icon: "🌱", color: "emerald" },
    { id: 2, title: "Clean Your Campus", points: 40, icon: "🧹", color: "blue" },
    { id: 3, title: "Recycle 10 Items", points: 30, icon: "♻️", color: "green" },
    { id: 4, title: "Save 20L Water", points: 35, icon: "💧", color: "cyan" },
  ];

  const steps = [
    { text: "Register and create your profile", icon: "👤", delay: "100" },
    { text: "Complete interactive lessons & quizzes", icon: "📚", delay: "200" },
    { text: "Participate in real-world eco-tasks", icon: "🌿", delay: "300" },
    { text: "Earn points, badges, and climb the leaderboard", icon: "📈", delay: "400" },
  ];

  const stats = [
    { value: 12_450, label: "EcoPoints distributed" },
    { value: 2_300, label: "Tasks completed" },
    { value: 560, label: "Active schools" },
  ];

  // Search + filter for sample challenges
  const filtered = sampleChallenges.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase())
  );

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  const handleJoin = (challenge) => {
    if (joined.includes(challenge.id)) return;
    setJoined((s) => [...s, challenge.id]);
  };

  const openDetails = (c) => {
    setSelectedChallenge(c);
    setChallengeModal(true);
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-cyan-50 text-gray-800 font-sans overflow-x-hidden">
      {/* Top Nav */}
      <nav className="relative flex justify-between items-center px-6 md:px-12 py-3 bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-green-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
            <span className="text-white font-bold text-lg">VM</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">Vrikshmitraa</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden sm:flex items-center bg-white border border-gray-200 rounded-full px-3 py-2 shadow-sm">
            <Search size={16} className="text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search challenges or features..."
              className="ml-3 outline-none text-sm bg-transparent placeholder-gray-400"
              aria-label="Search"
            />
          </div>

          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100">
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <Link to="/login" className="hidden md:inline text-gray-700 hover:text-green-600 font-medium">
            Login
          </Link>
          <Link to="/register" className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl shadow hover:scale-105 transition-transform">
            <UserPlus size={16} />
            <span className="font-medium">Get Started</span>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col md:flex-row items-center justify-between px-6 md:px-16 py-16 md:py-24 overflow-hidden">
        <div className="max-w-xl space-y-6 z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Learn. Act. <span className="bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">Protect.</span>
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Gamified environmental education for schools & colleges. Complete eco-tasks, earn points, and compete on leaderboards.
          </p>

          <div className="flex gap-4">
            <Link to="/register" className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-transform">
              Start Your Journey
            </Link>
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="border-2 border-green-500 text-green-700 px-6 py-3 rounded-xl hover:bg-green-50 transition-transform">
              Explore Features
            </button>
          </div>

          {/* small stats */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            {stats.map((s, i) => (
              <Counter key={i} value={s.value} label={s.label} />
            ))}
          </div>
        </div>

        <div className="relative mt-10 md:mt-0">
          <div className="w-72 h-72 md:w-96 md:h-96 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl animate-float">
            <img src="https://cdn-icons-png.flaticon.com/512/414/414927.png" alt="environment" className="w-64 h-64 object-contain" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold">Platform Features</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">Discover how Vrikshmitraa makes environmental education engaging and impactful</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, idx) => (
              <div key={idx} className="group p-6 bg-white rounded-2xl shadow hover:shadow-2xl transition-all">
                <div className={`text-4xl mb-3 bg-gradient-to-r ${f.gradient} bg-clip-text text-transparent`}>{f.icon}</div>
                <h4 className="text-xl font-semibold mb-2">{f.title}</h4>
                <p className="text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Challenges List with search & join */}
      <section className="py-16 bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold">Active Challenges</h3>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center bg-white border border-gray-200 rounded-full px-3 py-2 shadow-sm">
                <Search size={16} className="text-gray-400" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter challenges..." className="ml-3 outline-none text-sm bg-transparent placeholder-gray-400" />
              </div>
              <button className="text-sm text-green-700 font-medium">View All</button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {filtered.map((c) => (
              <article key={c.id} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full bg-${c.color}-100 flex items-center justify-center text-xl`}>{c.icon}</div>
                      <div>
                        <h4 className="text-lg font-semibold">{c.title}</h4>
                        <p className="text-sm text-gray-500">{c.points} EcoPoints • 7 days</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button onClick={() => openDetails(c)} className="text-sm text-gray-600 hover:text-gray-800">Details</button>
                      <button onClick={() => handleJoin(c)} className={`inline-flex items-center gap-2 px-3 py-2 rounded-md font-medium transition ${joined.includes(c.id) ? 'bg-gray-200 text-gray-700' : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow'}`}>
                        {joined.includes(c.id) ? 'Joined' : 'Join'} <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Progress & mini-stats */}
                  <div className="mt-4 grid grid-cols-3 gap-3 text-sm text-gray-600">
                    <div className="space-y-1">
                      <div className="font-semibold">Progress</div>
                      <div>—</div>
                    </div>
                    <div className="space-y-1">
                      <div className="font-semibold">Participants</div>
                      <div>128</div>
                    </div>
                    <div className="space-y-1">
                      <div className="font-semibold">Reward</div>
                      <div>{c.points} pts</div>
                    </div>
                  </div>
                </div>

              </article>
            ))}

            {/* Quick card to create new challenge (UI-only) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm flex items-center justify-center border-dashed border-2 border-gray-200">
              <div className="text-center">
                <div className="text-3xl mb-3">➕</div>
                <h4 className="font-semibold mb-1">Create a Challenge</h4>
                <p className="text-sm text-gray-500 mb-3">Teachers & admins can create tasks for their students</p>
                <Link to="/create" className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium">
                  Create
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold">How It Works</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">Start your eco-friendly journey in just a few simple steps</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={i} className="p-6 bg-gradient-to-br from-white to-green-50 rounded-2xl shadow hover:shadow-xl transition-all">
                <div className="text-4xl mb-3">{s.icon}</div>
                <h5 className="font-semibold">Step {i + 1}</h5>
                <p className="text-sm text-gray-600">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-gradient-to-r from-green-600 to-emerald-700 text-white text-center">
        <h4 className="text-2xl font-bold mb-3">Ready to make a difference?</h4>
        <p className="mb-6">Join thousands of learners and start earning EcoPoints today.</p>
        <Link to="/register" className="inline-block bg-white text-green-700 px-6 py-3 rounded-xl font-semibold shadow">Create Account</Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center text-white">VM</div>
              <div>
                <div className="font-semibold text-white">Vrikshmitraa</div>
                <div className="text-xs text-gray-400">Making environmental education engaging</div>
              </div>
            </div>
          </div>

          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Twitter</a>
            <a href="#" className="hover:text-white">Facebook</a>
            <a href="#" className="hover:text-white">Instagram</a>
          </div>
        </div>
        <div className="text-center text-xs text-gray-500 mt-6">© 2025 Vrikshmitraa</div>
      </footer>

      {/* Challenge modal */}
      <Modal open={challengeModal} onClose={() => setChallengeModal(false)} title={selectedChallenge?.title}>
        {selectedChallenge ? (
          <div>
            <p className="text-gray-700 mb-4">This is a sample challenge detail UI. Teachers or admins can add criteria, attachments, and verification methods here.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setChallengeModal(false)} className="px-4 py-2 rounded-md border">Close</button>
              <button onClick={() => { handleJoin(selectedChallenge); setChallengeModal(false); }} className="px-4 py-2 rounded-md bg-gradient-to-r from-green-500 to-emerald-600 text-white">Join</button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
