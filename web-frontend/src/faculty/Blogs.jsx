import React, { useState } from "react";

const EnvironmentalAwareness = () => {
  const [currentView, setCurrentView] = useState("dashboard");
  const [currentCategory, setCurrentCategory] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("Relevance");

  const categories = [
    {
      id: "pollution",
      title: "Pollution & Its Effects",
      image: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&h=600&fit=crop",
      desc: "Understanding pollution types and their environmental impact",
      topics: [
        {
          title: "Air Pollution in Urban Cities",
          image: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&h=600&fit=crop",
          summary: "Exploring the causes and health effects of urban air pollution from vehicles and industries.",
          description: "Urban air pollution is a critical environmental challenge affecting millions worldwide. Major sources include vehicle emissions, industrial activities, and construction dust. This pollution leads to respiratory diseases, cardiovascular problems, and reduced quality of life. Cities are implementing clean air zones, promoting public transport, and transitioning to electric vehicles to combat this issue. Individual actions like carpooling and using eco-friendly transportation can make a significant difference.",
        },
        {
          title: "Plastic Pollution in Oceans",
          image: "https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800&h=600&fit=crop",
          summary: "The devastating impact of plastic waste on marine ecosystems and wildlife.",
          description: "Our oceans are drowning in plastic waste, with an estimated 8 million tons entering marine environments annually. This pollution harms marine life through ingestion and entanglement, disrupts food chains, and breaks down into microplastics that contaminate our food supply. Solutions include reducing single-use plastics, improving waste management systems, supporting beach cleanups, and choosing sustainable alternatives. Every small action counts in protecting our precious marine ecosystems.",
        },
        {
          title: "Industrial Pollution Solutions",
          image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=600&fit=crop",
          summary: "Innovative technologies and policies reducing industrial environmental footprint.",
          description: "Industries are major contributors to environmental pollution, but innovative solutions are emerging. Advanced filtration systems, cleaner production techniques, and circular economy principles help minimize waste. Green chemistry reduces toxic substances, while renewable energy adoption cuts carbon emissions. Regulatory frameworks and corporate sustainability commitments drive change. Supporting eco-conscious businesses and demanding transparency accelerates the transition to cleaner industrial practices.",
        }
      ],
    },
    {
      id: "climate",
      title: "Weather & Climate",
      image: "https://images.unsplash.com/photo-1592210454359-9043f067919b?w=800&h=600&fit=crop",
      desc: "Climate change patterns and weather phenomenon explained",
      topics: [
        {
          title: "Global Warming Trends",
          image: "https://images.unsplash.com/photo-1592210454359-9043f067919b?w=800&h=600&fit=crop",
          summary: "Rising global temperatures and their cascading environmental effects.",
          description: "Global temperatures have risen approximately 1.1°C since pre-industrial times, causing ice melt, sea-level rise, and extreme weather events. Greenhouse gas emissions from fossil fuels are the primary driver. The Paris Agreement aims to limit warming to 1.5°C. Solutions include transitioning to renewable energy, improving energy efficiency, protecting forests, and adopting sustainable lifestyles. Individual carbon footprint reduction contributes to this global effort.",
        },
        {
          title: "Extreme Weather Events",
          image: "https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=800&h=600&fit=crop",
          summary: "Increasing frequency of hurricanes, floods, and droughts worldwide.",
          description: "Climate change is intensifying extreme weather events, causing devastating floods, prolonged droughts, powerful hurricanes, and unprecedented heatwaves. These events displace communities, destroy infrastructure, and threaten food security. Early warning systems, climate-resilient infrastructure, and emergency preparedness save lives. Addressing root causes through emissions reduction and climate adaptation strategies is crucial for building resilience.",
        }
      ],
    },
    {
      id: "energy",
      title: "Renewable Energy",
      image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop",
      desc: "Clean energy solutions for a sustainable future",
      topics: [
        {
          title: "Solar Power Revolution",
          image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800&h=600&fit=crop",
          summary: "Harnessing the sun's energy through advanced photovoltaic technology.",
          description: "Solar energy is the fastest-growing renewable source, with costs dropping dramatically. Photovoltaic panels convert sunlight directly into electricity, while concentrated solar power uses mirrors to generate heat. Residential, commercial, and utility-scale installations are expanding globally. Solar power reduces greenhouse gas emissions, creates jobs, and provides energy independence. Battery storage technology makes solar viable even after sunset, revolutionizing our energy landscape.",
        },
        {
          title: "Wind Energy Systems",
          image: "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=800&h=600&fit=crop",
          summary: "Wind turbines generating clean electricity from natural air currents.",
          description: "Wind energy harnesses natural air movements to generate clean electricity through turbines. Onshore and offshore wind farms are proliferating worldwide, with offshore installations accessing stronger, more consistent winds. Modern turbines are highly efficient and increasingly affordable. Wind power creates jobs, reduces carbon emissions, and complements other renewables. Smart grid integration ensures reliable energy supply despite wind variability.",
        }
      ],
    },
    {
      id: "waste",
      title: "Waste Management",
      image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&h=600&fit=crop",
      desc: "Effective strategies for reducing, reusing, and recycling",
      topics: [
        {
          title: "Recycling Best Practices",
          image: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800&h=600&fit=crop",
          summary: "Proper sorting and processing of recyclable materials for environmental benefit.",
          description: "Effective recycling reduces landfill waste, conserves natural resources, and saves energy. Proper sorting is crucial: clean, dry materials should be separated by type. Contamination reduces recycling effectiveness. Understanding local recycling rules, reducing single-use items, choosing recyclable packaging, and supporting circular economy businesses maximize impact. Composting organic waste complements recycling efforts, creating a comprehensive waste reduction strategy.",
        }
      ],
    },
    {
      id: "water",
      title: "Water Conservation",
      image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800&h=600&fit=crop",
      desc: "Preserving our most precious resource for future generations",
      topics: [
        {
          title: "Household Water Saving",
          image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=600&fit=crop",
          summary: "Simple daily practices to significantly reduce water consumption at home.",
          description: "Household water conservation is achievable through simple practices: fixing leaks promptly, installing low-flow fixtures, taking shorter showers, and running full loads in washing machines and dishwashers. Collecting rainwater for gardens and choosing water-efficient appliances further reduce consumption. These actions lower utility bills, reduce strain on water infrastructure, and preserve freshwater resources for future generations. Every drop saved matters in water-scarce regions.",
        }
      ],
    },
    {
      id: "sustainable",
      title: "Sustainable Living",
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=600&fit=crop",
      desc: "Practical tips for eco-friendly daily life choices",
      topics: [
        {
          title: "Sustainable Fashion",
          image: "https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=800&h=600&fit=crop",
          summary: "Ethical clothing choices reducing environmental impact and supporting fair labor.",
          description: "The fashion industry is a major polluter, but sustainable alternatives exist. Choose quality over quantity, buy second-hand, support ethical brands using organic materials and fair labor practices. Care for clothes properly to extend lifespan, repair damaged items, and recycle old textiles. Fast fashion's environmental and social costs are enormous. Making conscious fashion choices reduces waste, saves resources, and promotes better industry practices.",
        }
      ],
    }
  ];

  const showCategory = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    setCurrentCategory(category);
    setCurrentView("category");
    window.scrollTo(0, 0);
  };

  const showDashboard = () => {
    setCurrentView("dashboard");
    setCurrentCategory(null);
    window.scrollTo(0, 0);
  };

  const showModal = (topic) => {
    setCurrentTopic(topic);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentTopic(null);
  };

  const filteredCategories = categories.filter(cat =>
    cat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTopics = currentCategory?.topics.filter(topic =>
    topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.summary.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const sortedCategories = [...filteredCategories].sort((a, b) => {
    if (sortOption === "A-Z") return a.title.localeCompare(b.title);
    return 0;
  });

  const sortedTopics = [...filteredTopics].sort((a, b) => {
    if (sortOption === "A-Z") return a.title.localeCompare(b.title);
    return 0;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
     

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            className="flex-1 min-w-64 px-4 sm:px-6 py-3 border-2 border-green-400 rounded-full text-base focus:border-green-600 focus:ring-4 focus:ring-green-100 outline-none transition-all"
            placeholder="🔍 Search for topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="px-4 sm:px-6 py-3 border-2 border-green-400 rounded-full text-base bg-white cursor-pointer outline-none"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option>Relevance</option>
            <option>A-Z</option>
            <option>Latest</option>
          </select>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-12">
        {/* Dashboard View */}
        {currentView === "dashboard" && (
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-center text-green-800 mb-8 sm:mb-12">Explore Environmental Topics</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {sortedCategories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 relative overflow-hidden"
                  onClick={() => showCategory(category.id)}
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-800 to-green-400"></div>
                  <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-48 object-cover rounded-xl mb-4"
                  />
                  <h3 className="text-xl font-semibold text-green-800 mb-2">{category.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{category.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category View */}
        {currentView === "category" && currentCategory && (
          <div>
            <button
              onClick={showDashboard}
              className="flex items-center gap-2 px-4 sm:px-6 py-3 bg-green-700 text-white rounded-full hover:bg-green-800 transition-all transform hover:-translate-x-1 mb-6 sm:mb-8 text-sm sm:text-base"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl sm:text-4xl font-bold text-center text-green-800 mb-8 sm:mb-12">{currentCategory.title}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {sortedTopics.map((topic, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
                  onClick={() => showModal(topic)}
                >
                  <img
                    src={topic.image}
                    alt={topic.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-green-800 mb-3">{topic.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">{topic.summary}</p>
                    <button className="bg-green-700 text-white px-4 sm:px-6 py-2 rounded-full hover:bg-green-800 transition-all transform hover:scale-105 flex items-center gap-2 text-sm sm:text-base">
                      Read More →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && currentTopic && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:bg-red-500 hover:text-white transition-all transform hover:rotate-90 z-10 text-xl"
              onClick={closeModal}
            >
              ×
            </button>
            <img
              src={currentTopic.image}
              alt={currentTopic.title}
              className="w-full h-64 object-cover rounded-t-2xl"
            />
            <div className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-green-800 mb-4">{currentTopic.title}</h2>
              <p className="text-gray-700 leading-relaxed">{currentTopic.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-green-800 text-white text-center py-8 mt-16 px-4">
        <p className="text-sm sm:text-base">© 2025 Environmental Awareness & Sustainability | All Rights Reserved</p>
      </footer>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default EnvironmentalAwareness;