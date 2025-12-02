// storytelling/ChapterEngine.jsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useGameStore } from '../store/gameStore';
import DialogueSystem from './DialogueSystem';
import CaseStudyModule from '../components/educational/CaseStudyModule';
import ScientificVisualization from '../components/educational/ScientificVisualization';
import DecisionMakingModule from '../components/educational/DecisionMakingModule';
import ActionPlanningModule from '../components/educational/ActionPlanningModule';
import { STORY_CHAPTERS } from '../data/storyChapters';

const ChapterEngine = ({ chapterId }) => {
  const { currentScene, updateWorldState, recordChoice } = useGameStore();
  const [currentModule, setCurrentModule] = useState(null);
  const [sceneHistory, setSceneHistory] = useState([]);

  const chapter = STORY_CHAPTERS[chapterId];
  const scene = chapter.scenes[currentScene];

  useEffect(() => {
    loadScene(currentScene);
  }, [currentScene]);

  const loadScene = (sceneId) => {
    const sceneData = chapter.scenes[sceneId];
    setCurrentModule({
      type: sceneData.type,
      data: sceneData,
      sceneId: sceneId
    });
    setSceneHistory(prev => [...prev, sceneId]);
  };

  const handleSceneComplete = (result) => {
    if (result.impact) {
      updateWorldState(result.impact);
    }
    if (result.choice) {
      recordChoice(result.choice);
    }
    
    if (result.nextScene) {
      loadScene(result.nextScene);
    }
  };

  const renderCurrentModule = () => {
    if (!currentModule) return null;

    switch (currentModule.type) {
      case 'narrative':
        return (
          <DialogueSystem
            dialogue={currentModule.data.dialogue}
            onComplete={handleSceneComplete}
          />
        );

      case 'case_study':
        return (
          <CaseStudyModule
            caseData={currentModule.data.content}
            onComplete={handleSceneComplete}
          />
        );

      case 'interactive_learning':
        return (
          <ScientificVisualization
            data={currentModule.data}
            onComplete={handleSceneComplete}
          />
        );

      case 'decision_making':
        return (
          <DecisionMakingModule
            scenario={currentModule.data.scenario}
            onDecision={handleSceneComplete}
          />
        );

      case 'action_planning':
        return (
          <ActionPlanningModule
            context={currentModule.data.context}
            onPlanComplete={handleSceneComplete}
          />
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Environmental Status HUD */}
      <EcoHUD />
      
      {/* Current Module */}
      {renderCurrentModule()}
      
      {/* Progress Indicator */}
      <ProgressTracker 
        chapter={chapterId}
        currentScene={currentScene}
        totalScenes={Object.keys(chapter.scenes).length}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e'
  }
});

export default ChapterEngine;