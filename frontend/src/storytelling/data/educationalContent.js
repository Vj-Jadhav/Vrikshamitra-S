// data/educationalContent.js
export const AIR_POLLUTION_CONTENT = {
  decisionScenarios: [
    {
      id: 'transport_choice',
      title: 'Daily Commute Decision',
      description: 'Choose how you travel to school/work',
      context: 'Your current commute contributes significantly to air pollution. What changes can you make?',
      choices: [
        {
          id: 'personal_car',
          text: 'Continue using personal car',
          consequence: 'Air quality decreases. Health risks increase for vulnerable community members.',
          impact: { airQuality: -15, empathy: -10 },
          educationalContent: 'Personal vehicles account for 28% of urban air pollution. Each car emits 4.6 metric tons of CO2 annually.',
          realWorldExample: 'Cities like Delhi have implemented odd-even vehicle policies to reduce pollution.'
        },
        {
          id: 'public_transport',
          text: 'Switch to public transportation',
          consequence: 'Reduces your carbon footprint. Supports sustainable infrastructure.',
          impact: { airQuality: +10, environmentalKnowledge: +5 },
          educationalContent: 'Buses produce 80% less CO2 per passenger than cars. Metro systems can reduce city pollution by 20-30%.',
          realWorldExample: 'Cities with strong public transport like Singapore have significantly better air quality.'
        },
        {
          id: 'active_transport',
          text: 'Use bicycle/walking when possible',
          consequence: 'Zero emissions + health benefits. Inspires others in your community.',
          impact: { airQuality: +20, health: +15, leadership: +10 },
          educationalContent: 'Active transport eliminates emissions and provides 30 minutes of daily exercise, reducing healthcare costs.',
          realWorldExample: 'Copenhagen has 62% of residents cycling to work, making it one of the healthiest and cleanest cities.'
        }
      ]
    }
  ],

  caseStudies: [
    {
      id: 'london_smog_1952',
      title: 'The Great Smog of London 1952',
      personalStory: 'For five days in December 1952, London disappeared under a thick blanket of smog. Visibility dropped to near zero, transportation halted, and people struggled to breathe in their own homes.',
      scientificFacts: [
        'PM2.5 levels reached 1,600-4,000 μg/m³ (WHO safe limit is 25 μg/m³)',
        'Temperature inversion trapped pollution from coal burning at ground level',
        'The smog contained sulfuric acid, nitrogen dioxide, and other toxic compounds'
      ],
      data: {
        'Duration': '5 days',
        'Estimated Deaths': '4,000-12,000 people',
        'Economic Impact': 'Major transportation and business disruption',
        'Policy Outcome': 'Clean Air Act 1956 - banned black smoke emissions'
      },
      lessons: [
        'Environmental regulations save lives',
        'Air pollution can have immediate, catastrophic effects',
        'Government action is essential for public health protection'
      ]
    }
  ],

  miniGames: {
    air_quality_puzzle: {
      title: 'Air Quality Detective',
      objective: 'Identify pollution sources and solutions',
      mechanics: 'Drag and match pollution sources with their impacts and solutions',
      educationalOutcome: 'Understand complex air pollution systems'
    }
  }
};