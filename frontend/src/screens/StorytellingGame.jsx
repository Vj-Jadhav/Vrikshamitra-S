// src/screens/StorytellingGame.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const StorytellingGame = () => {
  const navigation = useNavigation();

  return (
    <ImageBackground 
      source={require('../assets/bg.png')} // Using your existing bg.png
      style={styles.container}
    >
      <ScrollView style={styles.scrollContainer}>
        {/* Game Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🌍 Eco Chronicles</Text>
          <Text style={styles.subtitle}>Environmental Storytelling Adventure</Text>
        </View>

        {/* Player Progress */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Your Journey Progress</Text>
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Chapters Completed</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Choices Made</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>0%</Text>
              <Text style={styles.statLabel}>World Health</Text>
            </View>
          </View>
        </View>

        {/* Story Chapters */}
        <View style={styles.chaptersSection}>
          <Text style={styles.sectionTitle}>Choose Your Adventure</Text>
          
          {/* Air Pollution Chapter */}
          <TouchableOpacity 
            style={styles.chapterCard}
            onPress={() => navigation.navigate('ChapterScreen', { chapter: 'air' })}
          >
            <View style={[styles.chapterIcon, { backgroundColor: '#87CEEB' }]}>
              <Text style={styles.iconText}>🌬️</Text>
            </View>
            <View style={styles.chapterContent}>
              <Text style={styles.chapterTitle}>Breath of Life</Text>
              <Text style={styles.chapterSubtitle}>Air Pollution Crisis</Text>
              <Text style={styles.chapterDescription}>
                Join Aura the Air Spirit to combat smog and learn about clean air solutions
              </Text>
              <View style={styles.chapterStats}>
                <Text style={styles.statTag}>🌿 5 Scenes</Text>
                <Text style={styles.statTag}>🎯 3 Choices</Text>
                <Text style={styles.statTag}>📚 Educational</Text>
              </View>
            </View>
            <Text style={styles.startButton}>START →</Text>
          </TouchableOpacity>

          {/* Water Pollution Chapter */}
          <TouchableOpacity 
            style={styles.chapterCard}
            onPress={() => navigation.navigate('ChapterScreen', { chapter: 'water' })}
          >
            <View style={[styles.chapterIcon, { backgroundColor: '#1E90FF' }]}>
              <Text style={styles.iconText}>💧</Text>
            </View>
            <View style={styles.chapterContent}>
              <Text style={styles.chapterTitle}>River of Tears</Text>
              <Text style={styles.chapterSubtitle}>Water Conservation</Text>
              <Text style={styles.chapterDescription}>
                Help Ripple the Water Spirit purify rivers and protect marine life
              </Text>
              <View style={styles.chapterStats}>
                <Text style={styles.statTag}>🌊 6 Scenes</Text>
                <Text style={styles.statTag}>🎯 4 Choices</Text>
                <Text style={styles.statTag}>💧 Interactive</Text>
              </View>
            </View>
            <Text style={styles.startButton}>START →</Text>
          </TouchableOpacity>

          {/* Soil Conservation Chapter */}
          <TouchableOpacity 
            style={styles.chapterCard}
            onPress={() => navigation.navigate('ChapterScreen', { chapter: 'soil' })}
          >
            <View style={[styles.chapterIcon, { backgroundColor: '#8B4513' }]}>
              <Text style={styles.iconText}>🌱</Text>
            </View>
            <View style={styles.chapterContent}>
              <Text style={styles.chapterTitle}>Earth's Pain</Text>
              <Text style={styles.chapterSubtitle}>Soil Health & Agriculture</Text>
              <Text style={styles.chapterDescription}>
                Work with Terra the Earth Spirit to heal contaminated soil
              </Text>
              <View style={styles.chapterStats}>
                <Text style={styles.statTag}>🪴 5 Scenes</Text>
                <Text style={styles.statTag}>🎯 3 Choices</Text>
                <Text style={styles.statTag}>🌍 Real Impact</Text>
              </View>
            </View>
            <Text style={styles.startButton}>START →</Text>
          </TouchableOpacity>

          {/* Noise Pollution Chapter */}
          <TouchableOpacity 
            style={styles.chapterCard}
            onPress={() => navigation.navigate('ChapterScreen', { chapter: 'noise' })}
          >
            <View style={[styles.chapterIcon, { backgroundColor: '#9370DB' }]}>
              <Text style={styles.iconText}>🔇</Text>
            </View>
            <View style={styles.chapterContent}>
              <Text style={styles.chapterTitle}>Silent Scream</Text>
              <Text style={styles.chapterSubtitle}>Noise Pollution</Text>
              <Text style={styles.chapterDescription}>
                Assist Echo the Sound Spirit in reducing urban noise pollution
              </Text>
              <View style={styles.chapterStats}>
                <Text style={styles.statTag}>🎵 4 Scenes</Text>
                <Text style={styles.statTag}>🎯 2 Choices</Text>
                <Text style={styles.statTag}>🔊 Audio Learning</Text>
              </View>
            </View>
            <Text style={styles.startButton}>START →</Text>
          </TouchableOpacity>

          {/* Conservation Chapter */}
          <TouchableOpacity 
            style={styles.chapterCard}
            onPress={() => navigation.navigate('ChapterScreen', { chapter: 'conservation' })}
          >
            <View style={[styles.chapterIcon, { backgroundColor: '#32CD32' }]}>
              <Text style={styles.iconText}>🦋</Text>
            </View>
            <View style={styles.chapterContent}>
              <Text style={styles.chapterTitle}>Circle of Life</Text>
              <Text style={styles.chapterSubtitle}>Biodiversity & Conservation</Text>
              <Text style={styles.chapterDescription}>
                Partner with Vita the Life Spirit to protect endangered species
              </Text>
              <View style={styles.chapterStats}>
                <Text style={styles.statTag}>🐾 7 Scenes</Text>
                <Text style={styles.statTag}>🎯 5 Choices</Text>
                <Text style={styles.statTag}>🦜 Wildlife Focus</Text>
              </View>
            </View>
            <Text style={styles.startButton}>START →</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>📚</Text>
              <Text style={styles.actionText}>Learning Library</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>🏆</Text>
              <Text style={styles.actionText}>Achievements</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionText}>Progress Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>👥</Text>
              <Text style={styles.actionText}>Community</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Make choices that impact the virtual world and learn real environmental solutions!
          </Text>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: 'rgba(26, 26, 46, 0.9)',
    padding: 30,
    paddingTop: 50,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    opacity: 0.8,
  },
  progressCard: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: -30,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  chaptersSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  chapterCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chapterIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconText: {
    fontSize: 20,
  },
  chapterContent: {
    flex: 1,
  },
  chapterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  chapterSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  chapterDescription: {
    fontSize: 12,
    color: '#34495e',
    marginBottom: 8,
    lineHeight: 16,
  },
  chapterStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statTag: {
    fontSize: 10,
    color: '#27ae60',
    backgroundColor: '#d5f4e6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 6,
    marginBottom: 4,
  },
  startButton: {
    color: '#27ae60',
    fontWeight: 'bold',
    fontSize: 14,
  },
  quickActions: {
    padding: 20,
    paddingTop: 0,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  footer: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  footerText: {
    fontSize: 12,
    color: '#2c3e50',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default StorytellingGame;