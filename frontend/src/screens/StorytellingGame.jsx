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

const { width, height } = Dimensions.get('window');

const StorytellingGame = () => {
  const navigation = useNavigation();

  const chapters = [
    {
      id: 'air',
      title: 'BREATH OF LIFE',
      subtitle: 'Air Pollution Crisis',
      description: 'Join Aura the Air Spirit to combat smog',
      icon: '🌬️',
      color: '#7ED0F0',
      pixelColor: '#5BA8D8',
      stats: ['5 SCENES', '3 CHOICES', 'EDUCATIONAL'],
    },
    {
      id: 'water',
      title: 'RIVER OF TEARS',
      subtitle: 'Water Conservation',
      description: 'Help Ripple purify rivers and protect marine life',
      icon: '💧',
      color: '#4A90E2',
      pixelColor: '#357ABD',
      stats: ['6 SCENES', '4 CHOICES', 'INTERACTIVE'],
    },
    {
      id: 'soil',
      title: 'EARTH\'S PAIN',
      subtitle: 'Soil Health',
      description: 'Work with Terra to heal contaminated soil',
      icon: '🌱',
      color: '#8B7355',
      pixelColor: '#6D5A3F',
      stats: ['5 SCENES', '3 CHOICES', 'REAL IMPACT'],
    },
    {
      id: 'noise',
      title: 'SILENT SCREAM',
      subtitle: 'Noise Pollution',
      description: 'Assist Echo in reducing urban noise',
      icon: '🔇',
      color: '#9B59B6',
      pixelColor: '#7D3F98',
      stats: ['4 SCENES', '2 CHOICES', 'AUDIO'],
    },
    {
      id: 'conservation',
      title: 'CIRCLE OF LIFE',
      subtitle: 'Biodiversity',
      description: 'Protect endangered species with Vita',
      icon: '🦋',
      color: '#27AE60',
      pixelColor: '#1E8449',
      stats: ['7 SCENES', '5 CHOICES', 'WILDLIFE'],
    }
  ];

  const quickActions = [
    { icon: '📚', text: 'LIBRARY', color: '#E74C3C' },
    { icon: '🏆', text: 'BADGES', color: '#F39C12' },
    { icon: '📊', text: 'STATS', color: '#3498DB' },
    { icon: '👥', text: 'FRIENDS', color: '#9B59B6' }
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
      activeOpacity={0.9}
    >
      <PixelCard pixelColor={chapter.pixelColor} style={styles.chapterCard}>
        <View style={styles.chapterHeader}>
          <View style={[styles.chapterIcon, { backgroundColor: chapter.color }]}>
            <Text style={styles.chapterIconText}>{chapter.icon}</Text>
          </View>
          <View style={styles.chapterBadge}>
            <Text style={styles.chapterBadgeText}>CH.{index + 1}</Text>
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
          <View style={[styles.pixelProgress, { backgroundColor: chapter.pixelColor }]}>
            <View style={[styles.progressFill, { backgroundColor: chapter.color, width: '0%' }]} />
          </View>
          <Text style={styles.startText}>START →</Text>
        </View>
      </PixelCard>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ECF0F1" />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>🌍 ECO CHRONICLES</Text>
            <Text style={styles.subtitle}>PIXEL ENVIRONMENT ADVENTURE</Text>
          </View>
          <View style={styles.pixelDivider} />
        </View>

        {/* Player Stats */}
        <View style={styles.statsSection}>
          <PixelCard style={styles.statsCard}>
            <Text style={styles.statsTitle}>ADVENTURE STATS</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>CHAPTERS</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>CHOICES</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>0%</Text>
                <Text style={styles.statLabel}>PROGRESS</Text>
              </View>
            </View>
            <View style={styles.pixelProgressBar}>
              <View style={styles.progressBarBackground} />
              <View style={[styles.progressBarFill, { width: '30%' }]} />
            </View>
          </PixelCard>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>QUICK MENU</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity key={index} style={styles.actionCard}>
                <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                  <Text style={styles.actionIconText}>{action.icon}</Text>
                </View>
                <Text style={styles.actionText}>{action.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Chapters */}
        <View style={styles.chaptersSection}>
          <Text style={styles.sectionTitle}>SELECT CHAPTER</Text>
          {chapters.map((chapter, index) => (
            <ChapterCard key={chapter.id} chapter={chapter} index={index} />
          ))}
        </View>

        {/* Footer CTA */}
        <View style={styles.footer}>
          <PixelCard style={styles.ctaCard}>
            <Text style={styles.ctaText}>READY TO SAVE THE PLANET?</Text>
            <TouchableOpacity 
              style={[styles.pixelButton, { backgroundColor: '#27AE60' }]}
              onPress={() => navigation.navigate('ChapterScreen', { chapterId: 'air' })}
            >
              <Text style={styles.pixelButtonText}>BEGIN JOURNEY</Text>
            </TouchableOpacity>
            <Text style={styles.ctaSubtext}>Make choices that impact both virtual and real worlds!</Text>
          </PixelCard>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECF0F1',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 4,
    borderBottomColor: '#34495E',
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '600',
    letterSpacing: 2,
  },
  pixelDivider: {
    height: 4,
    backgroundColor: '#34495E',
    marginTop: 16,
    width: '80%',
    alignSelf: 'center',
  },
  statsSection: {
    padding: 16,
  },
  statsCard: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27AE60',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#7F8C8D',
    fontWeight: '600',
    letterSpacing: 1,
  },
  statDivider: {
    width: 2,
    height: 20,
    backgroundColor: '#BDC3C7',
  },
  pixelProgressBar: {
    height: 8,
    backgroundColor: '#ECF0F1',
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#34495E',
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
    backgroundColor: '#27AE60',
  },
  actionsSection: {
    padding: 16,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
    letterSpacing: 1,
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
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#34495E',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#34495E',
  },
  actionIconText: {
    fontSize: 16,
  },
  actionText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2C3E50',
    letterSpacing: 1,
  },
  chaptersSection: {
    padding: 16,
  },
  chapterCard: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  chapterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  chapterIcon: {
    width: 40,
    height: 40,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#34495E',
  },
  chapterIconText: {
    fontSize: 16,
  },
  chapterBadge: {
    backgroundColor: '#34495E',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chapterBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  chapterContent: {
    marginBottom: 12,
  },
  chapterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
    letterSpacing: 1,
  },
  chapterSubtitle: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 8,
    fontWeight: '600',
  },
  chapterDescription: {
    fontSize: 11,
    color: '#34495E',
    lineHeight: 14,
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statTag: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginRight: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#34495E',
  },
  statTagText: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  startSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pixelProgress: {
    flex: 1,
    height: 6,
    backgroundColor: '#ECF0F1',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#34495E',
  },
  progressFill: {
    height: '100%',
  },
  startText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#27AE60',
    letterSpacing: 1,
  },
  footer: {
    padding: 16,
  },
  ctaCard: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 1,
  },
  ctaSubtext: {
    fontSize: 10,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  // Pixel Art Components
  pixelBorder: {
    borderWidth: 2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  pixelCard: {
    borderWidth: 2,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomColor: '#BDC3C7',
    borderRightColor: '#BDC3C7',
  },
  pixelButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#34495E',
    alignItems: 'center',
  },
  pixelButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});

export default StorytellingGame;