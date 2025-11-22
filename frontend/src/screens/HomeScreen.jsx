import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import Svg, { Path } from "react-native-svg";

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

      <ScrollView showsVerticalScrollIndicator={false}>

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
              style={styles.gameCard}
              onPress={() => navigation.navigate("GamesScreen")}
            >
              <View style={[styles.gameCardInner, { backgroundColor: '#7FBF7F' }]}>
                <View style={styles.gameImageContainer}>
                  <Image source={EarthHeroes} style={styles.gameImage} />
                </View>
              </View>
            </TouchableOpacity>

            {/* Game 2 */}
            <TouchableOpacity 
              style={styles.gameCard}
              onPress={() => navigation.navigate("GamesScreen")}
            >
              <View style={[styles.gameCardInner, { backgroundColor: '#6B9B6B' }]}>
                <View style={styles.gameImageContainer}>
                  <Image source={PlantDetective} style={styles.gameImage} />
                </View>
              </View>
            </TouchableOpacity>

            {/* Game 3 */}
            <TouchableOpacity 
              style={styles.gameCard}
              onPress={() => navigation.navigate("GamesScreen")}
            >
              <View style={[styles.gameCardInner, { backgroundColor: '#5A8A7A' }]}>
                <View style={styles.gameImageContainer}>
                  <Image source={ArVr} style={styles.gameImage} />
                </View>
              </View>
            </TouchableOpacity>

            {/* Game 4 */}
            <TouchableOpacity 
              style={styles.gameCard}
              onPress={() => navigation.navigate("GamesScreen")}
            >
              <View style={[styles.gameCardInner, { backgroundColor: '#A67C7C' }]}>
                <View style={styles.gameImageContainer}>
                  <Image source={CommunityWatch} style={styles.gameImage} />
                </View>
              </View>
            </TouchableOpacity>

          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>

        {/* Home */}
        <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
          <Svg width={26} height={26} viewBox="0 0 512 512">
            <Path
              fill="#3a9322ff"
              d="M277.8 8.6c-12.3-11.4-31.3-11.4-43.5 0l-224 208c-9.6 9-12.8 22.9-8 35.1S18.8 272 32 272h16v176c0 35.3 28.7 64 64 64h288c35.3 0 64-28.7 64-64V272h16c13.2 0 25-8.1 29.8-20.3s1.6-26.2-8-35.1zM240 320h32c26.5 0 48 21.5 48 48v96H192v-96c0-26.5 21.5-48 48-48"
            />
          </Svg>
          <Text style={styles.navTextActiveHome}>Home</Text>
        </TouchableOpacity>

        {/* Games */}
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate("GamesScreen")}
        >
          <Svg width={26} height={26} viewBox="0 0 512 512">
            <Path
              fill="#000"
              d="M478 217.9c-13.8-32.4-43.4-53.9-79.3-57.5c-39.1-4-78.5-6.1-117.7-6.1s-78.6 2-117.7 6.1c-35.9 3.7-65.5 25.2-79.3 57.5C63.1 254.7 64 296 80.8 332.5c16 35.2 48.1 59.4 84.9 63.8c2.2.3 4.4.5 6.6.5c12.8 0 24.8-5.9 32.7-15.8l18.9-24c6-7.6 15-12 24.5-12s18.6 4.4 24.5 12l18.9 24c7.9 9.9 19.9 15.8 32.7 15.8c2.2 0 4.4-.2 6.6-.5c36.8-4.4 68.9-28.6 84.9-63.8c16.8-36.5 17.7-77.8 2-114.6z"
            />
          </Svg>
          <Text style={styles.navTextInactive}>Games</Text>
        </TouchableOpacity>

        {/* Learn */}
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate("LearningModuleScreen")}
        >
          <Svg width={26} height={26} viewBox="0 0 512 512">
            <Path
              fill="#000"
              d="M96 64c-17.7 0-32 14.3-32 32v320c0 17.7 14.3 32 32 32h320c17.7 0 32-14.3 32-32V96c0-17.7-14.3-32-32-32H96zm112 96l160 112l-160 112V160z"
            />
          </Svg>
          <Text style={styles.navTextInactive}>Learn</Text>
        </TouchableOpacity>

        {/* Challenges */}
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate("ChallengesScreen")}
        >
          <Svg width={26} height={26} viewBox="0 0 512 512">
            <Path
              fill="#000"
              d="M256 32C132.3 32 32 132.3 32 256s100.3 224 224 224s224-100.3 224-224S379.7 32 256 32zm0 384c-88.2 0-160-71.8-160-160s71.8-160 160-160s160 71.8 160 160s-71.8 160-160 160zm0-256c-53 0-96 43-96 96s43 96 96 96s96-43 96-96s-43-96-96-96zm0 128c-17.7 0-32-14.3-32-32s14.3-32 32-32s32 14.3 32 32s-14.3 32-32 32z"
            />
          </Svg>
          <Text style={styles.navTextInactive}>Challenges</Text>
        </TouchableOpacity>

      </View>

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
    backgroundColor: '#9B30FF',
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

  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 8,
  },

  navItem: { 
    flex: 1, 
    alignItems: 'center', 
    paddingVertical: 8,
  },

  navItemActive: {
    backgroundColor: '#adffacff',
    borderRadius: 25,
    marginHorizontal: 5,
  },

  navTextActiveHome: {
    fontSize: 11,
    color: '#3a9322ff',
    fontWeight: '700',
    marginTop: 2,
  },

  navTextInactive: { fontSize: 11, color: '#666', marginTop: 2 },
});
