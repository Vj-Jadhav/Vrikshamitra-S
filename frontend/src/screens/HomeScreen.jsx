import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';

// Imported Images
import ArVr from '../assets/ArVr.jpg';
import CommunityWatch from '../assets/CommunityWatch.png';
import EarthHeroes from '../assets/EarthHeroes.jpg';
import PlantDetective from '../assets/PlantDetective.png';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>VRIKSHAMITRA</Text>

        <View style={styles.headerRight}>

          <TouchableOpacity
            style={styles.notificationIcon}
            onPress={() => navigation.navigate("NotificationsScreen")}
          >
            <Text style={styles.bellIcon}>🔔</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileIcon}
            onPress={() => navigation.getParent()?.navigate("ProfileScreen")}
          >
            <Image
              source={{ uri: 'https://via.placeholder.com/40' }}
              style={styles.profileImage}
            />
          </TouchableOpacity>

        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}   // ← Important
      >



        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.welcomeText}>Welcome,</Text>
            <Text style={styles.userName}>Nandini Deshmukh</Text>
          </View>

          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>RANK : 3</Text>
          </View>

          <Text style={styles.characterEmoji}>🌺</Text>
        </View>

        {/* Level Bar */}
        <View style={styles.levelContainer}>
          <View style={styles.levelBar}>
            {["Lv 1", "Lv 2", "Lv 3", "Lv 4", "Lv 5"].map((item, index) => (
              <View
                key={index}
                style={[styles.levelItem, index === 1 && styles.levelActive]}
              >
                <Text
                  style={index === 1 ? styles.levelTextActive : styles.levelTextInactive}
                >
                  {item}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>

          <View style={styles.ecoPointsRow}>
            <Text style={styles.coinIcon}>🪙</Text>
            <Text style={styles.ecoPointsText}>2571 Eco-Points Collected</Text>
          </View>
        </View>

        {/* Learning Module & Rewards Cards */}
        <View style={styles.moduleCardsContainer}>

          <TouchableOpacity
            style={styles.learningModuleCard}
            onPress={() => navigation.navigate("LearningModuleScreen")}
          >
            <View style={styles.moduleIcon}>
              <Text style={styles.moduleIconText}>▶️</Text>
            </View>
            <Text style={styles.moduleTitle}>Learning{'\n'}Module</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.rewardsCard}
            onPress={() => navigation.navigate("LeaderboardScreen")}
          >
            <View style={styles.rewardsHeader}>
              <Text style={styles.starIcon}>⭐⭐</Text>
            </View>

            <View style={styles.rewardsIcon}>
              <Text style={styles.rewardsIconText}>🏆</Text>
            </View>

            <Text style={styles.rewardsTitle}>Rewards &{'\n'}Leaderboard</Text>
          </TouchableOpacity>

        </View>

        {/* Fun and Educational Games */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fun and Educational Games</Text>

          <View style={styles.gamesGrid}>

            {/* Game 1 */}
            <TouchableOpacity
              style={styles.newGameCard}
              onPress={() => navigation.navigate("GamesScreen")}
            >
              <Image source={EarthHeroes} style={styles.newGameImage} />

              <View style={styles.newGameContent}>
                <Text style={styles.newGameTitle}>
                  Explore Nature & solve Challenges!
                </Text>
              </View>
            </TouchableOpacity>

            {/* Game 2 */}
            <TouchableOpacity
              style={styles.newGameCard}
              onPress={() => navigation.navigate("GamesScreen")}
            >
              <Image source={PlantDetective} style={styles.newGameImage} />

              <View style={styles.newGameContent}>
                <Text style={styles.newGameTitle}>
                  Card Hunt, Become a Plant Detective!
                </Text>
              </View>
            </TouchableOpacity>

            {/* Game 3 */}
            <TouchableOpacity
              style={styles.newGameCard}
              onPress={() => navigation.navigate("GamesScreen")}
            >
              <Image source={ArVr} style={styles.newGameImage} />

              <View style={styles.newGameContent}>
                <Text style={styles.newGameTitle}>
                  AR/VR Flora–Fauna Explorer
                </Text>
              </View>
            </TouchableOpacity>

            {/* Game 4 */}
            <TouchableOpacity
              style={styles.newGameCard}
              onPress={() => navigation.navigate("GamesScreen")}
            >
              <Image source={CommunityWatch} style={styles.newGameImage} />

              <View style={styles.newGameContent}>
                <Text style={styles.newGameTitle}>
                  Click photo-file Complaint.
                </Text>
              </View>
            </TouchableOpacity>

          </View>

        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* ✅ BOTTOM NAVIGATION REMOVED - Now handled by MainLayout */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },

  header: {
    backgroundColor: '#3a9322ff',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  appName: { color: '#fff', fontSize: 20, fontWeight: 'bold', letterSpacing: 1 },

  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 15 },

  notificationIcon: { width: 35, height: 35, justifyContent: 'center', alignItems: 'center' },

  bellIcon: { fontSize: 22 },

  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileImage: { width: '100%', height: '100%' },

  welcomeCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },

  welcomeText: { fontSize: 14, color: '#666' },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#000', marginTop: 2 },

  rankBadge: {
    backgroundColor: '#FF9533',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 10,
  },

  rankText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  characterEmoji: { fontSize: 45 },

  levelContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 15,
    padding: 15,
    borderRadius: 15,
  },

  levelBar: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },

  levelItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#e8e8e8',
  },

  levelActive: { backgroundColor: '#4CAF50' },

  levelTextInactive: { fontSize: 12, color: '#666', fontWeight: '600' },
  levelTextActive: { fontSize: 12, color: '#fff', fontWeight: 'bold' },

  progressBar: {
    height: 8,
    backgroundColor: '#ddd',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },

  progressFill: { height: '100%', width: '40%', backgroundColor: '#FFD700' },

  ecoPointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  coinIcon: { fontSize: 20, marginRight: 5 },

  ecoPointsText: { fontSize: 13, color: '#888', fontWeight: '600' },

  moduleCardsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 15,
    marginTop: 20,
  },

  learningModuleCard: {
    flex: 1,
    backgroundColor: '#5DADE2',
    borderRadius: 15,
    padding: 20,
    elevation: 3,
  },

  moduleIcon: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  moduleIconText: { fontSize: 24, color: '#fff' },

  moduleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    lineHeight: 22,
  },

  rewardsCard: {
    flex: 1,
    backgroundColor: '#9e13d5ff',
    borderRadius: 15,
    padding: 20,
    elevation: 3,
  },

  rewardsHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 5,
  },

  starIcon: { fontSize: 16, color: '#fff' },

  rewardsIcon: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  rewardsIconText: { fontSize: 24, color: '#fff' },

  rewardsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    lineHeight: 22,
  },

  section: { marginTop: 20 },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginBottom: 15,
    color: '#000',
  },

  gamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 15,
  },

  gameCard: {
    width: '47%',
  },

  gameCardInner: {
    borderRadius: 15,
    padding: 15,
    minHeight: 130,
    elevation: 3,
  },

  gameImageContainer: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    overflow: 'hidden',
  },

  gameImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  /* NEW GAME CARD UI (like your uploaded design) */
  newGameCard: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 15,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },

  newGameImage: {
    width: "100%",
    height: 140,
    resizeMode: "cover",
  },

  newGameContent: {
    padding: 10,
    backgroundColor: "#fff",
  },

  newGameTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#000",
    lineHeight: 18,
  },

  // ✅ REMOVED: bottomNav, navItem, navItemActive, navTextActiveHome, navTextInactive styles
});