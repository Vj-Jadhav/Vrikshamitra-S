// data/storyChapters.js
export const STORY_CHAPTERS = {
  air_pollution: {
    id: 'air_pollution',
    title: 'Breath of Life: The Air Crisis',
    element: 'air',
    spirit: 'Aura',
    learningObjectives: [
      'Understand PM2.5 and its health impacts',
      'Identify major air pollution sources',
      'Learn personal and community solutions'
    ],
    scenes: {
      intro: {
        id: 'air_intro',
        type: 'narrative',
        background: 'city_smog',
        characters: ['Aura'],
        dialogue: [
          {
            character: 'Aura',
            text: "Guardian... can you feel it? The air grows heavy with invisible poison. Each breath carries tiny particles that harm all living beings.",
            emotion: 'concerned'
          },
          {
            character: 'Player',
            text: "Invisible poison? What do you mean?",
            emotion: 'curious'
          },
          {
            character: 'Aura',
            text: "They call it PM2.5 - particles so small they bypass our natural defenses and enter our bloodstream. Let me show you what this means for real people...",
            emotion: 'serious'
          }
        ],
        nextScene: 'case_study_asthma'
      },
      
      case_study_asthma: {
        id: 'case_study_asthma',
        type: 'case_study',
        title: 'Real Impact: Maria\'s Story',
        content: {
          personalStory: `Meet Maria, a 14-year-old asthma patient from a city with high air pollution. On bad air days, she can't go to school or play outside.`,
          scientificFacts: [
            "Asthma attacks increase by 30% on high pollution days",
            "Children's lung development is permanently affected by poor air quality",
            "PM2.5 particles can cross from lungs into bloodstream"
          ],
          data: {
            hospitalVisits: '3x more frequent on high pollution days',
            schoolDaysLost: '15-20 days per year',
            economicImpact: '$5,000 annual medical costs'
          }
        },
        choices: [
          {
            id: 'learn_sources',
            text: 'What causes this pollution?',
            impact: { environmentalKnowledge: +10 },
            nextScene: 'pollution_sources'
          },
          {
            id: 'immediate_help',
            text: 'How can we help Maria now?',
            impact: { empathy: +15 },
            nextScene: 'personal_solutions'
          }
        ]
      },
      
      pollution_sources: {
        id: 'pollution_sources',
        type: 'interactive_learning',
        title: 'Sources of Air Pollution',
        visualization: 'source_pie_chart',
        data: {
          vehicles: '28%',
          industry: '22%',
          agriculture: '18%',
          energy: '15%',
          other: '17%'
        },
        miniGame: 'categorize_sources',
        educationalContent: {
          keyFacts: [
            "Transportation is the largest source in urban areas",
            "Coal power plants release mercury and particulate matter",
            "Agricultural burning contributes significantly to seasonal pollution"
          ],
          localRelevance: "Check your local air quality index and major pollution sources"
        }
      }
    }
  },
  
  water_pollution: {
    id: 'water_pollution',
    title: 'River of Tears: Water Crisis',
    element: 'water',
    spirit: 'Ripple',
    // ... similar structure
  },
  
  soil_pollution: {
    id: 'soil_pollution',
    title: 'Earth\'s Pain: Soil Degradation',
    element: 'soil',
    spirit: 'Terra',
    // ... similar structure
  },
  
  noise_pollution: {
    id: 'noise_pollution',
    title: 'Silent Scream: Noise Pollution',
    element: 'sound',
    spirit: 'Echo',
    // ... similar structure
  },
  
  conservation: {
    id: 'conservation',
    title: 'Circle of Life: Conservation',
    element: 'life',
    spirit: 'Vita',
    // ... similar structure
  }
};