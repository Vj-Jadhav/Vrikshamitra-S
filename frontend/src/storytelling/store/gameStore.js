// store/gameStore.js
import { create } from 'zustand';

export const useGameStore = create((set, get) => ({
  // Player progression
  currentChapter: 'air_pollution',
  currentScene: 'air_intro',
  completedChapters: [],
  
  // Player stats
  playerStats: {
    environmentalKnowledge: 0,
    airMastery: 0,
    waterMastery: 0,
    soilMastery: 0,
    noiseMastery: 0,
    conservationMastery: 0,
    empathy: 50,
    leadership: 0
  },
  
  // World state (affected by player choices)
  worldState: {
    airQuality: 30,        // 0-100 scale
    waterPurity: 25,
    soilHealth: 40,
    noiseLevel: 70,        // Lower is better
    biodiversity: 20,
    communityEngagement: 35
  },
  
  // Player choices and consequences
  choicesMade: [],
  environmentalImpact: [],
  
  // Actions
  completeScene: (sceneId) => set(state => ({
    completedScenes: [...state.completedScenes, sceneId]
  })),
  
  updateWorldState: (updates) => set(state => ({
    worldState: { ...state.worldState, ...updates }
  })),
  
  recordChoice: (choice) => set(state => ({
    choicesMade: [...state.choicesMade, {
      timestamp: new Date(),
      ...choice
    }]
  })),
  
  calculateEnvironmentalScore: () => {
    const state = get();
    const world = state.worldState;
    return (world.airQuality + world.waterPurity + world.soilHealth + 
           (100 - world.noiseLevel) + world.biodiversity) / 5;
  }
}));