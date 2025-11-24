// src/data/scientificData/airQualityData.js

export const AIR_QUALITY_DATA = {
  pm25: {
    safeLevel: 12, // μg/m³ WHO guideline
    effects: {
      12: "Safe level - minimal health risk",
      35: "Moderate risk - sensitive groups affected",
      55: "Unhealthy - general public health effects",
      150: "Very unhealthy - serious health effects",
      250: "Hazardous - emergency conditions"
    },
    sources: {
      vehicles: "28% of urban PM2.5",
      industry: "22% of urban PM2.5", 
      agriculture: "18% of urban PM2.5",
      natural: "15% of urban PM2.5",
      other: "17% of urban PM2.5"
    },
    healthImpacts: {
      respiratory: "Asthma, bronchitis, lung damage",
      cardiovascular: "Heart attacks, strokes",
      neurological: "Cognitive impairment, dementia",
      mortality: "7 million premature deaths/year globally"
    }
  },

  historicalCaseStudies: {
    london1952: {
      title: "Great Smog of London 1952",
      period: "December 4-9, 1952",
      pollutionLevels: "PM2.5: 1,600-4,000 μg/m³",
      impact: "4,000-12,000 premature deaths",
      causes: "Coal burning + temperature inversion",
      reforms: "Clean Air Act 1956",
      lessons: "Importance of environmental regulation"
    },
    delhiCurrent: {
      title: "Delhi Air Quality Crisis",
      period: "Annual winter smog",
      pollutionLevels: "PM2.5: 300-900 μg/m³",
      impact: "Reduced life expectancy by 10+ years",
      causes: "Vehicle emissions, crop burning, industry",
      solutions: "Odd-even vehicle policy, metro expansion",
      ongoingChallenges: "Population growth, economic pressures"
    }
  }
};