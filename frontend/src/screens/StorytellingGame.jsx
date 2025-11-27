// src/screens/StorytellingGame.jsx
import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Dimensions,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

const StorytellingGame = () => {
  const navigation = useNavigation();

  const chapters = [
    {
      id: 'air',
      title: 'BREATH OF LIFE',
      subtitle: 'Air Pollution Adventure',
      description: 'Help Aura clean the air and make cities fresh again!',
      icon: '💨',
      color: '#4ECDC4',
      pixelColor: '#44B3AC',
      stats: ['5 SCENES', '3 CHOICES', 'FUN LEARNING'],
      animation: require('../assets/animations/air_spirit.json'),
      character: 'Aura'
    },
    {
      id: 'water',
      title: 'RIVER RESCUE',
      subtitle: 'Water Protection',
      description: 'Join Splash to clean rivers and save fish friends!',
      icon: '💧',
      color: '#4A90E2',
      pixelColor: '#357ABD',
      stats: ['6 SCENES', '4 CHOICES', 'WATER HERO'],
      animation: require('../assets/animations/air_spirit.json'), // Using air spirit as fallback
      character: 'Splash'
    },
    {
      id: 'soil',
      title: 'EARTH GARDEN',
      subtitle: 'Soil Health',
      description: 'Help Terra grow happy plants in healthy soil!',
      icon: '🌱',
      color: '#8B7355',
      pixelColor: '#6D5A3F',
      stats: ['5 SCENES', '3 CHOICES', 'PLANT POWER'],
      animation: require('../assets/animations/air_spirit.json'), // Using air spirit as fallback
      character: 'Terra'
    },
    {
      id: 'animals',
      title: 'FOREST FRIENDS',
      subtitle: 'Animal Protection',
      description: 'Protect cute animals with their forest guardian!',
      icon: '🐾',
      color: '#9B59B6',
      pixelColor: '#7D3F98',
      stats: ['4 SCENES', '2 CHOICES', 'ANIMAL HERO'],
      animation: require('../assets/animations/air_spirit.json'), // Using air spirit as fallback
      character: 'Fluffy'
    },
    {
      id: 'energy',
      title: 'POWER HEROES',
      subtitle: 'Clean Energy',
      description: 'Discover amazing clean energy with Sparky!',
      icon: '⚡',
      color: '#FF9F1C',
      pixelColor: '#E67E22',
      stats: ['7 SCENES', '5 CHOICES', 'ENERGY FUN'],
      animation: require('../assets/animations/air_spirit.json'), // Using air spirit as fallback
      character: 'Sparky'
    }
  ];

  const quickActions = [
    { 
      icon: '📚', 
      text: 'STORY LIBRARY', 
      color: '#E74C3C',
      description: 'Read fun stories'
    },
    { 
      icon: '🏆', 
      text: 'MY BADGES', 
      color: '#F39C12',
      description: 'Collect rewards'
    },
    { 
      icon: '⭐', 
      text: 'ACHIEVEMENTS', 
      color: '#3498DB',
      description: 'See your progress'
    },
    { 
      icon: '👨‍👩‍👧‍👦', 
      text: 'FRIENDS', 
      color: '#9B59B6',
      description: 'Play together'
    }
  ];

  const PixelCard = ({ children, style, pixelColor = '#34495E' }) => (
    <View style={[styles.pixelBorder, { borderColor: pixelColor }]}>
      <View style={[styles.pixelCard, style]}>
        {children}
      </View>
    </View>
  );

  const ChapterCard = ({ chapter, index }) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('ChapterScreen', { 
        chapterId: chapter.id
      })}
      activeOpacity={0.8}
      style={styles.chapterCardWrapper}
    >
      <PixelCard pixelColor={chapter.pixelColor} style={styles.chapterCard}>
        <View style={styles.chapterHeader}>
          <View style={styles.chapterLeft}>
            <View style={[styles.chapterIcon, { backgroundColor: chapter.color }]}>
              <Text style={styles.chapterIconText}>{chapter.icon}</Text>
            </View>
            <View>
              <Text style={styles.chapterBadge}>CHAPTER {index + 1}</Text>
              <Text style={styles.characterName}>with {chapter.character}</Text>
            </View>
          </View>
          <View style={styles.chapterAnimation}>
            <LottieView
              source={chapter.animation}
              autoPlay
              loop
              style={styles.miniAnimation}
            />
          </View>
        </View>
        
        <View style={styles.chapterContent}>
          <Text style={styles.chapterTitle}>{chapter.title}</Text>
          <Text style={styles.chapterSubtitle}>{chapter.subtitle}</Text>
          <Text style={styles.chapterDescription}>{chapter.description}</Text>
          
          <View style={styles.statsContainer}>
            {chapter.stats.map((stat, statIndex) => (
              <View key={statIndex} style={[styles.statTag, { backgroundColor: chapter.color }]}>
                <Text style={styles.statTagText}>{stat}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.startSection}>
          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>READY TO PLAY!</Text>
            <View style={[styles.pixelProgress, { backgroundColor: chapter.pixelColor }]}>
              <View style={[styles.progressFill, { backgroundColor: chapter.color, width: '0%' }]} />
            </View>
          </View>
          <View style={[styles.startButton, { backgroundColor: chapter.color }]}>
            <Text style={styles.startText}>PLAY NOW</Text>
            <Text style={styles.startArrow}>🎮</Text>
          </View>
        </View>
      </PixelCard>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4ECDC4" />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>🌍 PLANET HEROES</Text>
            <Text style={styles.heroSubtitle}>Fun Adventures to Save Our Earth!</Text>
            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatNumber}>5</Text>
                <Text style={styles.heroStatLabel}>ADVENTURES</Text>
              </View>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatNumber}>25+</Text>
                <Text style={styles.heroStatLabel}>FUN CHOICES</Text>
              </View>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatNumber}>∞</Text>
                <Text style={styles.heroStatLabel}>SMILES</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Player Stats */}
        <View style={styles.statsSection}>
          <PixelCard style={styles.statsCard}>
            <Text style={styles.statsTitle}>🌟 MY ADVENTURE PROGRESS</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>📖</Text>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>STORIES</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>🎯</Text>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>CHOICES</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>⭐</Text>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>BADGES</Text>
              </View>
            </View>
            <View style={styles.levelContainer}>
              <Text style={styles.levelLabel}>ADVENTURE LEVEL</Text>
              <View style={styles.pixelProgressBar}>
                <View style={styles.progressBarBackground} />
                <View style={[styles.progressBarFill, { width: '30%' }]} />
              </View>
              <Text style={styles.levelText}>NEW EXPLORER</Text>
            </View>
          </PixelCard>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>🎪 FUN ACTIVITIES</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity key={index} style={styles.actionCard} activeOpacity={0.8}>
                <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                  <Text style={styles.actionIconText}>{action.icon}</Text>
                </View>
                <Text style={styles.actionText}>{action.text}</Text>
                <Text style={styles.actionDescription}>{action.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Chapters */}
        <View style={styles.chaptersSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎮 CHOOSE YOUR ADVENTURE</Text>
            <Text style={styles.sectionSubtitle}>Pick a fun story to begin!</Text>
          </View>
          {chapters.map((chapter, index) => (
            <ChapterCard key={chapter.id} chapter={chapter} index={index} />
          ))}
        </View>

        {/* Footer CTA */}
        <View style={styles.footer}>
          <PixelCard style={styles.ctaCard}>
            <Text style={styles.ctaIcon}>🚀</Text>
            <Text style={styles.ctaText}>Ready for Your First Adventure?</Text>
            <Text style={styles.ctaSubtext}>Become a Planet Hero and make Earth happy!</Text>
            <TouchableOpacity 
              style={[styles.ctaButton, { backgroundColor: '#4ECDC4' }]}
              onPress={() => navigation.navigate('ChapterScreen', { chapterId: 'air' })}
              activeOpacity={0.8}
            >
              <Text style={styles.ctaButtonText}>START FIRST ADVENTURE</Text>
              <Text style={styles.ctaButtonIcon}>🎯</Text>
            </TouchableOpacity>
          </PixelCard>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  // Hero Section
  heroSection: {
    backgroundColor: '#4ECDC4',
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  heroContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 15,
    borderRadius: 20,
  },
  heroStat: {
    alignItems: 'center',
  },
  heroStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroStatLabel: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: 1,
  },
  // Stats Section
  statsSection: {
    padding: 20,
    marginTop: -20,
  },
  statsCard: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#7F8C8D',
    fontWeight: '600',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#ECF0F1',
  },
  levelContainer: {
    marginTop: 10,
  },
  levelLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  pixelProgressBar: {
    height: 12,
    backgroundColor: '#ECF0F1',
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#34495E',
    marginBottom: 8,
  },
  progressBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ECF0F1',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 4,
  },
  levelText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4ECDC4',
    textAlign: 'center',
  },
  // Actions Section
  actionsSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIconText: {
    fontSize: 20,
  },
  actionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: 10,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  // Chapters Section
  chaptersSection: {
    padding: 20,
  },
  chapterCardWrapper: {
    marginBottom: 16,
  },
  chapterCard: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  chapterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  chapterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chapterIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  chapterIconText: {
    fontSize: 20,
  },
  chapterBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 2,
  },
  characterName: {
    fontSize: 11,
    color: '#7F8C8D',
    fontStyle: 'italic',
  },
  chapterAnimation: {
    width: 60,
    height: 60,
  },
  miniAnimation: {
    width: '100%',
    height: '100%',
  },
  chapterContent: {
    marginBottom: 16,
  },
  chapterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  chapterSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
    fontWeight: '600',
  },
  chapterDescription: {
    fontSize: 13,
    color: '#34495E',
    lineHeight: 18,
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  statTagText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  startSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressContainer: {
    flex: 1,
  },
  progressLabel: {
    fontSize: 10,
    color: '#7F8C8D',
    fontWeight: '600',
    marginBottom: 4,
  },
  pixelProgress: {
    height: 6,
    backgroundColor: '#ECF0F1',
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#34495E',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginLeft: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  startText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 4,
  },
  startArrow: {
    fontSize: 12,
  },
  // Footer
  footer: {
    padding: 20,
  },
  ctaCard: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  ctaIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  ctaText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaSubtext: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 16,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  ctaButtonIcon: {
    fontSize: 16,
  },
  // Pixel Art Components
  pixelBorder: {
    borderWidth: 2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderRadius: 20,
  },
  pixelCard: {
    borderWidth: 2,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomColor: '#BDC3C7',
    borderRightColor: '#BDC3C7',
    borderRadius: 18,
  },
});

export default StorytellingGame;