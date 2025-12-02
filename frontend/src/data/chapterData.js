export const chapterData = {
  air: {
    id: 'air',
    title: 'BREATH OF LIFE',
    subtitle: 'Air Pollution Crisis',
    themeColor: '#7ED0F0',
    spirit: {
      name: 'Aura',
      description: 'Air Spirit Guardian',
      intro: "Hello! I'm Aura, the Spirit of Air. The skies need our help!",
      icon: '🌬️'
    },
    scenes: [
      {
        id: 'scene1',
        title: 'The Haze Descends',
        animation: require('../assets/animations/air_scene1.json'),
        duration: 4000,
        text: "Look at the city skyline... what was once clear blue is now covered in a thick haze of pollution. Factories, vehicles, and industries are releasing harmful gases into our atmosphere.",
        choices: [],
        type: 'intro'
      },
      {
        id: 'scene2',
        title: 'Meeting Aura',
        animation: require('../assets/animations/air_spirit.json'),
        duration: 3000,
        text: "I am Aura, the Spirit of Air. I've watched as my clean breath has become heavy with toxins. Children cough, animals struggle, and the very air we need to live is making us sick.",
        choices: [],
        type: 'spirit_intro'
      },
      {
        id: 'scene3',
        title: 'Sources of Pollution',
        animation: require('../assets/animations/air_pollution.json'),
        duration: 5000,
        text: "The main culprits? Vehicle exhaust, factory emissions, burning of fossil fuels, and deforestation. Each day, millions of tons of CO2, methane, and particulate matter choke our atmosphere.",
        choices: [
          {
            id: 'choice1',
            text: 'Learn about vehicle emissions',
            nextScene: 'scene4a',
            impact: '+10 Knowledge'
          },
          {
            id: 'choice2',
            text: 'Explore industrial pollution',
            nextScene: 'scene4b',
            impact: '+10 Knowledge'
          }
        ],
        type: 'educational'
      },
      {
        id: 'scene4a',
        title: 'Vehicle Emissions',
        animation: require('../assets/animations/vehicle_pollution.json'),
        duration: 4000,
        text: "Cars and trucks release nitrogen oxides and carbon monoxide. Did you know? One gallon of gasoline produces 20 pounds of CO2! Electric vehicles and public transport can make a huge difference.",
        choices: [
          {
            id: 'choice3',
            text: 'Promote electric vehicles',
            nextScene: 'scene5',
            impact: '+15 Air Quality'
          },
          {
            id: 'choice4',
            text: 'Advocate for better public transport',
            nextScene: 'scene6',
            impact: '+20 Air Quality'
          }
        ],
        type: 'choice'
      },
      {
        id: 'scene5',
        title: 'Clean Transportation',
        animation: require('../assets/animations/electric_car.json'),
        duration: 4000,
        text: "Excellent choice! Electric vehicles produce zero tailpipe emissions. Combined with renewable energy sources, they can clean our cities' air significantly.",
        choices: [
          {
            id: 'choice5',
            text: 'Continue the journey',
            nextScene: 'scene7',
            impact: '+10 Progress'
          }
        ],
        type: 'solution'
      },
      {
        id: 'scene7',
        title: 'The Clean Air Future',
        animation: require('../assets/animations/clean_air.json'),
        duration: 5000,
        text: "Look! With our choices, the air is clearing. Birds are returning, children are playing outside, and the sun shines through clean air. This can be our reality if we act now!",
        choices: [
          {
            id: 'choice6',
            text: 'Commit to clean air actions',
            nextScene: 'completion',
            impact: '+25 World Health'
          }
        ],
        type: 'resolution'
      },
      {
        id: 'completion',
        title: 'Chapter Complete!',
        animation: require('../assets/animations/success.json'),
        duration: 3000,
        text: "Congratulations! You've helped Aura restore clean air. Remember: Plant trees, use public transport, support clean energy, and spread awareness!",
        choices: [
          {
            id: 'final_choice',
            text: 'Return to Chapters',
            nextScene: 'end',
            impact: 'Chapter Complete'
          }
        ],
        type: 'completion'
      }
    ],
    facts: [
      "Air pollution causes 7 million premature deaths yearly",
      "Clean air can improve life expectancy by 2 years",
      "Trees absorb CO2 and release oxygen",
      "Renewable energy creates zero air pollution"
    ],
    solutions: [
      "Use public transportation or carpool",
      "Support renewable energy initiatives",
      "Plant and protect trees",
      "Reduce energy consumption at home"
    ]
  },
  // We'll add other chapters later
};

export const getAllChapters = () => chapterData;