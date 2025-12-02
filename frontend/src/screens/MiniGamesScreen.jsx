// src/screens/MiniGamesScreen.jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const MiniGamesScreen = ({ navigation }) => {
  const games = [
    { id: 1, name: 'Recycling Sort', emoji: '♻️', color: '#4ECDC4' },
    { id: 2, name: 'Plant Match', emoji: '🌱', color: '#6BCF7F' },
    { id: 3, name: 'Eco Puzzle', emoji: '🧩', color: '#FFD93D' },
    { id: 4, name: 'Water Saver', emoji: '💧', color: '#4D96FF' },
    { id: 5, name: 'Energy Quiz', emoji: '⚡', color: '#FF6B6B' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎮 Mini Games Center</Text>
        <Text style={styles.subtitle}>Fun educational games about the environment!</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Available Games</Text>
        
        {games.map((game) => (
          <TouchableOpacity 
            key={game.id}
            style={[styles.gameCard, { backgroundColor: game.color }]}
            onPress={() => {/* Add game navigation */}}
          >
            <Text style={styles.gameEmoji}>{game.emoji}</Text>
            <Text style={styles.gameName}>{game.name}</Text>
            <Text style={styles.playText}>Play →</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.featuredSection}>
          <Text style={styles.featuredTitle}>Featured Game</Text>
          <View style={styles.featuredCard}>
            <Text style={styles.featuredEmoji}>🌍</Text>
            <View style={styles.featuredContent}>
              <Text style={styles.featuredName}>Planet Protector</Text>
              <Text style={styles.featuredDesc}>
                Help clean up the planet by sorting waste and making eco-friendly choices!
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Back to Map</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FDF4',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#065F46',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#047857',
    marginBottom: 16,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gameEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  gameName: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  playText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
  },
  featuredSection: {
    marginTop: 24,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#047857',
    marginBottom: 12,
  },
  featuredCard: {
    flexDirection: 'row',
    backgroundColor: '#D1FAE5',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  featuredEmoji: {
    fontSize: 40,
    marginRight: 16,
  },
  featuredContent: {
    flex: 1,
  },
  featuredName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#065F46',
    marginBottom: 4,
  },
  featuredDesc: {
    fontSize: 14,
    color: '#047857',
    lineHeight: 20,
  },
  backButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  backButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MiniGamesScreen;