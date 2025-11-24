// src/screens/ChapterScreen.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Animated,
  Easing,
  ScrollView
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

const ChapterScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { chapterId } = route.params;
  
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [showChoices, setShowChoices] = useState(false);
  const [playerStats, setPlayerStats] = useState({
    knowledge: 0,
    airQuality: 0,
    progress: 0,
    worldHealth: 0
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Complete Air Pollution Chapter Data
  const chapter = {
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
        duration: 5000,
        text: "Look at the city skyline... what was once clear blue is now covered in a thick haze of pollution. Factories, vehicles, and industries are releasing harmful gases into our atmosphere.",
        choices: [],
        type: 'intro'
      },
      {
        id: 'scene2',
        title: 'Meeting Aura',
        animation: require('../assets/animations/air_spirit.json'),
        duration: 4000,
        text: "I am Aura, the Spirit of Air. I've watched as my clean breath has become heavy with toxins. Children cough, animals struggle, and the very air we need to live is making us sick.",
        choices: [],
        type: 'spirit_intro'
      },
      {
        id: 'scene3',
        title: 'Sources of Pollution',
        animation: require('../assets/animations/air_pollution.json'),
        duration: 6000,
        text: "The main culprits? Vehicle exhaust, factory emissions, burning of fossil fuels, and deforestation. Each day, millions of tons of CO2, methane, and particulate matter choke our atmosphere.",
        choices: [
          {
            id: 'choice1',
            text: 'Learn about vehicle emissions',
            nextScene: 'scene4',
            impact: { knowledge: 10 }
          },
          {
            id: 'choice2',
            text: 'Explore industrial pollution',
            nextScene: 'scene5', 
            impact: { knowledge: 10 }
          }
        ],
        type: 'educational'
      },
      {
        id: 'scene4',
        title: 'Vehicle Emissions',
        animation: require('../assets/animations/vehicle_pollution.json'),
        duration: 5000,
        text: "Cars and trucks release nitrogen oxides and carbon monoxide. One gallon of gasoline produces 20 pounds of CO2! Electric vehicles and public transport can make a huge difference.",
        choices: [
          {
            id: 'choice3',
            text: 'Continue the journey',
            nextScene: 'scene6',
            impact: { knowledge: 15, airQuality: 10 }
          }
        ],
        type: 'educational'
      },
      {
        id: 'scene5',
        title: 'Industrial Pollution',
        animation: require('../assets/animations/electric_car.json'),
        duration: 5000,
        text: "Factories release sulfur dioxide, mercury, and other toxins. Proper filters and clean technology can reduce these emissions by up to 90%.",
        choices: [
          {
            id: 'choice4',
            text: 'Continue the journey',
            nextScene: 'scene6',
            impact: { knowledge: 15, airQuality: 10 }
          }
        ],
        type: 'educational'
      },
      {
        id: 'scene6',
        title: 'Making a Difference',
        animation: require('../assets/animations/clean_air.json'),
        duration: 5000,
        text: "Together we can clear the air! Planting trees, using renewable energy, and supporting clean transportation are key solutions. Every small action counts!",
        choices: [
          {
            id: 'choice5',
            text: 'Complete chapter',
            nextScene: 'end',
            impact: { worldHealth: 25, airQuality: 20 }
          }
        ],
        type: 'resolution'
      },
      {
        id: 'end',
        title: 'Chapter Complete!',
        animation: require('../assets/animations/success.json'),
        duration: 4000,
        text: "Congratulations! You've helped Aura restore clean air. Remember: Plant trees, use public transport, support clean energy, and spread awareness!",
        choices: [
          {
            id: 'final_choice',
            text: 'Return to Chapters',
            nextScene: 'home',
            impact: { progress: 100 }
          }
        ],
        type: 'completion'
      }
    ]
  };

  const currentScene = chapter.scenes[currentSceneIndex];

  useEffect(() => {
    // Animation when scene changes
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic)
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic)
      })
    ]).start();

    // Auto-advance if no choices after animation duration
    if (currentScene.choices.length === 0 && currentScene.id !== 'end') {
      const timer = setTimeout(() => {
        if (currentSceneIndex < chapter.scenes.length - 1) {
          goToNextScene();
        }
      }, currentScene.duration);
      
      return () => clearTimeout(timer);
    } else {
      // Show choices after animation
      const timer = setTimeout(() => {
        setShowChoices(true);
      }, currentScene.duration);
      
      return () => clearTimeout(timer);
    }
  }, [currentSceneIndex]);

  const goToNextScene = () => {
    // Reset animations for next scene
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    setShowChoices(false);
    
    if (currentSceneIndex < chapter.scenes.length - 1) {
      setCurrentSceneIndex(currentSceneIndex + 1);
    } else {
      // Chapter completed
      navigation.navigate('StorytellingGame');
    }
  };

  const handleChoiceSelect = (choice) => {
    // Update player stats based on choice impact
    if (choice.impact) {
      setPlayerStats(prev => ({
        ...prev,
        knowledge: (prev.knowledge || 0) + (choice.impact.knowledge || 0),
        airQuality: (prev.airQuality || 0) + (choice.impact.airQuality || 0),
        worldHealth: (prev.worldHealth || 0) + (choice.impact.worldHealth || 0),
        progress: (prev.progress || 0) + (choice.impact.progress || 0)
      }));
    }
    
    // Handle navigation choices
    if (choice.nextScene === 'home') {
      navigation.navigate('StorytellingGame');
    } else if (choice.nextScene === 'end') {
      setCurrentSceneIndex(chapter.scenes.length - 1);
    } else {
      // Find next scene index
      const nextSceneIndex = chapter.scenes.findIndex(scene => scene.id === choice.nextScene);
      if (nextSceneIndex !== -1) {
        fadeAnim.setValue(0);
        slideAnim.setValue(50);
        setShowChoices(false);
        setCurrentSceneIndex(nextSceneIndex);
      }
    }
  };

  const progressPercentage = ((currentSceneIndex + 1) / chapter.scenes.length) * 100;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progressPercentage,
      duration: 500,
      useNativeDriver: false,
      easing: Easing.out(Easing.cubic)
    }).start();
  }, [progressPercentage]);

  const PixelCard = ({ children, style }) => (
    <View style={[styles.pixelBorder, style]}>
      <View style={styles.pixelCard}>
        {children}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={chapter.themeColor} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: chapter.themeColor }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← BACK</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.chapterTitle}>{chapter.title}</Text>
          <Text style={styles.chapterSubtitle}>{chapter.subtitle}</Text>
        </View>
        <View style={styles.spiritBadge}>
          <Text style={styles.spiritIcon}>{chapter.spirit.icon}</Text>
          <Text style={styles.spiritName}>{chapter.spirit.name}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressBackground}>
          <Animated.View 
            style={[
              styles.progressFill, 
              { 
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%']
                }),
                backgroundColor: chapter.themeColor
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          Scene {currentSceneIndex + 1} of {chapter.scenes.length}
        </Text>
      </View>

      {/* Scrollable Content Area */}
      <View style={styles.contentContainer}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Content */}
          <View style={styles.content}>
            {/* Lottie Animation */}
            <View style={styles.animationContainer}>
              <LottieView
                source={currentScene.animation}
                autoPlay
                loop={currentScene.type !== 'completion'}
                style={styles.animation}
              />
            </View>

            {/* Story Text */}
            <Animated.View 
              style={[
                styles.textContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <PixelCard style={styles.dialogCard}>
                <Text style={styles.sceneTitle}>{currentScene.title}</Text>
                <Text style={styles.storyText}>{currentScene.text}</Text>
                
                {/* Spirit Introduction */}
                {currentScene.type === 'spirit_intro' && (
                  <View style={styles.spiritIntro}>
                    <Text style={styles.spiritSpeech}>"{chapter.spirit.intro}"</Text>
                    <Text style={styles.spiritSignature}>- {chapter.spirit.name}, {chapter.spirit.description}</Text>
                  </View>
                )}
              </PixelCard>
            </Animated.View>

            {/* Choices */}
            {showChoices && currentScene.choices.length > 0 && (
              <Animated.View 
                style={[
                  styles.choicesContainer,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                  }
                ]}
              >
                <Text style={styles.choicesTitle}>What will you do?</Text>
                {currentScene.choices.map((choice, index) => (
                  <TouchableOpacity
                    key={choice.id}
                    style={[styles.choiceButton, { backgroundColor: chapter.themeColor }]}
                    onPress={() => handleChoiceSelect(choice)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.choiceText}>{choice.text}</Text>
                    {choice.impact && (
                      <View style={styles.impactContainer}>
                        {choice.impact.knowledge && (
                          <Text style={styles.impactText}>+{choice.impact.knowledge} Knowledge</Text>
                        )}
                        {choice.impact.airQuality && (
                          <Text style={styles.impactText}>+{choice.impact.airQuality} Air Quality</Text>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </Animated.View>
            )}

            {/* Continue Button for scenes without choices */}
            {showChoices && currentScene.choices.length === 0 && currentScene.id !== 'end' && (
              <Animated.View 
                style={[
                  styles.continueContainer,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                  }
                ]}
              >
                <TouchableOpacity
                  style={[styles.continueButton, { backgroundColor: chapter.themeColor }]}
                  onPress={goToNextScene}
                  activeOpacity={0.8}
                >
                  <Text style={styles.continueText}>
                    {currentSceneIndex < chapter.scenes.length - 1 ? 'CONTINUE →' : 'COMPLETE CHAPTER'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        </ScrollView>
      </View>

      {/* Player Stats - Fixed at bottom */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>KNOWLEDGE</Text>
          <Text style={styles.statValue}>{playerStats.knowledge}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>AIR QUALITY</Text>
          <Text style={styles.statValue}>{playerStats.airQuality}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>WORLD HEALTH</Text>
          <Text style={styles.statValue}>{playerStats.worldHealth}%</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECF0F1',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 4,
    borderBottomColor: '#34495E',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2C3E50',
    letterSpacing: 1,
  },
  headerContent: {
    alignItems: 'center',
    flex: 1,
  },
  chapterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    letterSpacing: 1,
  },
  chapterSubtitle: {
    fontSize: 12,
    color: '#2C3E50',
    opacity: 0.8,
    fontWeight: '600',
  },
  spiritBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)',
    padding: 8,
    borderWidth: 2,
    borderColor: '#34495E',
  },
  spiritIcon: {
    fontSize: 16,
  },
  spiritName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2C3E50',
    letterSpacing: 1,
  },
  progressSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#BDC3C7',
  },
  progressBackground: {
    height: 8,
    backgroundColor: '#ECF0F1',
    borderWidth: 2,
    borderColor: '#34495E',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
  },
  progressText: {
    fontSize: 10,
    color: '#7F8C8D',
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 1,
  },
  // New container for scrollable content
  contentContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20, // Extra padding to ensure content doesn't touch stats bar
  },
  content: {
    flex: 1,
    padding: 16,
    paddingBottom: 30, // Additional padding for safety
  },
  animationContainer: {
    height: height * 0.25, // Slightly reduced to fit better
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    marginBottom: 20,
  },
  dialogCard: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  sceneTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
    letterSpacing: 1,
    textAlign: 'center',
  },
  storyText: {
    fontSize: 14,
    color: '#34495E',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 12,
  },
  spiritIntro: {
    backgroundColor: 'rgba(126, 208, 240, 0.1)',
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#7ED0F0',
    marginTop: 8,
  },
  spiritSpeech: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#2C3E50',
    marginBottom: 4,
  },
  spiritSignature: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#7ED0F0',
    textAlign: 'right',
  },
  choicesContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  choicesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 1,
  },
  choiceButton: {
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#34495E',
  },
  choiceText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  impactContainer: {
    marginTop: 8,
  },
  impactText: {
    fontSize: 10,
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'center',
    fontWeight: '600',
  },
  continueContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  continueButton: {
    padding: 16,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#34495E',
  },
  continueText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderTopWidth: 4,
    borderTopColor: '#34495E',
    // Ensure stats bar stays at bottom
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 8,
    color: '#7F8C8D',
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#27AE60',
  },
  // Pixel Art Components
  pixelBorder: {
    borderWidth: 2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#34495E',
  },
  pixelCard: {
    borderWidth: 2,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomColor: '#BDC3C7',
    borderRightColor: '#BDC3C7',
  },
});

export default ChapterScreen;