import React, { useEffect, useState } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, 
  ScrollView, Image, ActivityIndicator
} from 'react-native';
import Svg, { Path } from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Imported Images
import ArVr from '../assets/ArVr.jpg';
import CommunityWatch from '../assets/CommunityWatch.png';
import EarthHeroes from '../assets/EarthHeroes.jpg';
import PlantDetective from '../assets/PlantDetective.png';

// Default avatar URLs
const defaultAvatars = [
  "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
  "https://cdn-icons-png.flaticon.com/512/4140/4140047.png",
  "https://cdn-icons-png.flaticon.com/512/4333/4333607.png",
];

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      console.log("HomeScreen - User ID:", userId);

      if (!userId) {
        console.log("No user ID found");
        // Set default user data when no userId is found
        const defaultUser = {
          fullName: "User",
          points: 2571,
          rank: 3,
          photo: defaultAvatars[0]
        };
        setUser(defaultUser);
        setLoading(false);
        return;
      }

      const API_URL = `http://10.168.69.133:5000/api/user/${userId}`;
      console.log("HomeScreen - Fetching from:", API_URL);

      const res = await fetch(API_URL);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("HomeScreen - User data:", data);

      // Set default avatar if none exists
      const userData = {
        ...data,
        photo: data.photo || defaultAvatars[0],
        points: data.points || 2571,
        rank: data.rank || 3,
        fullName: data.fullName || "User"
      };

      setUser(userData);
      
      // Store user data locally for quick access
      await AsyncStorage.setItem("userData", JSON.stringify(userData));

    } catch (error) {
      console.log("HomeScreen - Fetch error:", error);
      // Try to get from local storage as fallback
      try {
        const localUser = await AsyncStorage.getItem("userData");
        if (localUser) {
          setUser(JSON.parse(localUser));
        } else {
          // Set default user data if nothing in local storage
          setUser({
            fullName: "User",
            points: 2571,
            rank: 3,
            photo: defaultAvatars[0]
          });
        }
      } catch (localError) {
        console.log("Local storage error:", localError);
        // Set default user data as final fallback
        setUser({
          fullName: "User",
          points: 2571,
          rank: 3,
          photo: defaultAvatars[0]
        });
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchUserData();
    });

    // Initial fetch
    fetchUserData();

    return unsubscribe;
  }, [navigation]);

  // Safe user data with fallbacks
  const userData = user || {
    fullName: "User",
    points: 2571,
    rank: 3,
    photo: defaultAvatars[0]
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>VRIKSHAMITRA</Text>

        <View style={styles.headerRight}>

          <TouchableOpacity
            style={styles.notificationIcon}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("NotificationsScreen")}
          >
            <Text style={styles.bellIcon}>🔔</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileIcon}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("ProfileScreen")}
          >
            {loading ? (
              <View style={[styles.profileImage, styles.loadingProfile]}>
                <ActivityIndicator size="small" color="#3a9322" />
              </View>
            ) : (
              <Image
                source={{
                  uri: userData.photo
                }}
                style={styles.profileImage}
                defaultSource={{ uri: defaultAvatars[0] }}
                onError={(e) => {
                  console.log("Image load error, using default");
                  // Fallback to default avatar if image fails to load
                  e.nativeEvent.target.setNativeProps({
                    source: { uri: defaultAvatars[0] }
                  });
                }}
              />
            )}
          </TouchableOpacity>

        </View>
      </View>

      {/* Main Scroll */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 90 }}
      >

        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.welcomeText}>Welcome,</Text>
            <Text style={styles.userName}>
              {loading ? "Loading..." : userData.fullName}
            </Text>
          </View>

          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>RANK #{userData.rank}</Text>
          </View>

          <Text style={styles.characterEmoji}>🌺</Text>
        </View>

        {/* Level + EcoPoints */}
        <View style={styles.levelContainer}>
          <View style={styles.levelBar}>
            {["Lv 1", "Lv 2", "Lv 3", "Lv 4", "Lv 5"].map((item, index) => (
              <View
                key={index}
                style={[
                  styles.levelItem, 
                  index === 1 && styles.levelActive
                ]}
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
            <View style={[styles.progressFill, { width: '40%' }]} />
          </View>

          <View style={styles.ecoPointsRow}>
            <Text style={styles.coinIcon}>🪙</Text>
            <Text style={styles.ecoPointsText}>
              {userData.points} Eco-Points Collected
            </Text>
          </View>
        </View>

        {/* Learning + Rewards */}
        <View style={styles.moduleCardsContainer}>

          <TouchableOpacity
            style={styles.learningModuleCard}
            onPress={() => navigation.navigate("LearningModuleScreen")}
            activeOpacity={0.8}
          >
            <View style={styles.moduleIcon}>
              <Text style={styles.moduleIconText}>▶️</Text>
            </View>
            <Text style={styles.moduleTitle}>Learning{'\n'}Module</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.rewardsCard}
            onPress={() => navigation.navigate("LeaderboardScreen")}
            activeOpacity={0.8}
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

        {/* Games Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fun and Educational Games</Text>

          <View style={styles.gamesGrid}>

            <TouchableOpacity
              style={styles.gameCard}
              activeOpacity={0.6}
              onPress={() => navigation.navigate("GamesScreen", { game: 'EarthHeroes' })}
            >
              <View style={[styles.gameCardInner, { backgroundColor: '#7FBF7F' }]}>
                <Image source={EarthHeroes} style={styles.gameImage} />
                <Text style={styles.gameCardText}>Earth Heroes</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gameCard}
              activeOpacity={0.6}
              onPress={() => navigation.navigate("GamesScreen", { game: 'PlantDetective' })}
            >
              <View style={[styles.gameCardInner, { backgroundColor: '#6B9B6B' }]}>
                <Image source={PlantDetective} style={styles.gameImage} />
                <Text style={styles.gameCardText}>Plant Detective</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gameCard}
              activeOpacity={0.6}
              onPress={() => navigation.navigate("GamesScreen", { game: 'ArVr' })}
            >
              <View style={[styles.gameCardInner, { backgroundColor: '#5A8A7A' }]}>
                <Image source={ArVr} style={styles.gameImage} />
                <Text style={styles.gameCardText}>AR/VR Explorer</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gameCard}
              activeOpacity={0.6}
              onPress={() => navigation.navigate("GamesScreen", { game: 'CommunityWatch' })}
            >
              <View style={[styles.gameCardInner, { backgroundColor: '#A67C7C' }]}>
                <Image source={CommunityWatch} style={styles.gameImage} />
                <Text style={styles.gameCardText}>Community Watch</Text>
              </View>
            </TouchableOpacity>

          </View>

        </View>

      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>

        <TouchableOpacity
          style={[styles.navItem, styles.navItemActive]}
          onPress={() => navigation.navigate("Home")}
        >
          <Svg width={26} height={26} viewBox="0 0 512 512">
            <Path
              fill="#3a9322"
              d="M277.8 8.6c-12.3-11.4-31.3-11.4-43.5 0l-224 208c-9.6 9-12.8 22.9-8 35.1S18.8 272 32 272h16v176c0 35.3 28.7 64 64 64h288c35.3 0 64-28.7 64-64V272h16c13.2 0 25-8.1 29.8-20.3s1.6-26.2-8-35.1z"
            />
          </Svg>
          <Text style={styles.navTextActiveHome}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("GamesScreen")}
        >
          <Svg width={26} height={26} viewBox="0 0 512 512">
            <Path fill="#000" d="M478 217.9c-13.8-32.4-43.4-53.9-79.3-57.5c-39.1-4-78.5-6.1-117.7-6.1s-78.6 2-117.7 6.1c-35.9 3.7-65.5 25.2-79.3 57.5C63.1 254.7 64 296 80.8 332.5c16 35.2 48.1 59.4 84.9 63.8c2.2.3 4.4.5 6.6.5c12.8 0 24.8-5.9 32.7-15.8l18.9-24c6-7.6 15-12 24.5-12s18.6 4.4 24.5 12l18.9 24c7.9 9.9 19.9 15.8 32.7 15.8c2.2 0 4.4-.2 6.6-.5c36.8-4.4 68.9-28.6 84.9-63.8c16.8-36.5 17.7-77.8 2-114.6z"/>
          </Svg>
          <Text style={styles.navTextInactive}>Games</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("LearningModuleScreen")}
        >
          <Svg width={26} height={26} viewBox="0 0 512 512">
            <Path fill="#000" d="M96 64c-17.7 0-32 14.3-32 32v320c0 17.7 14.3 32 32 32h320c17.7 0 32-14.3 32-32V96c0-17.7-14.3 32-32-32H96zm112 96l160 112l-160 112V160z"/>
          </Svg>
          <Text style={styles.navTextInactive}>Learn</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("ChallengesScreen")}
        >
          <Svg width={26} height={26} viewBox="0 0 512 512">
            <Path fill="#000" d="M256 32C132.3 32 32 132.3 32 256s100.3 224 224 224s224-100.3 224-224S379.7 32 256 32zm0 384c-88.2 0-160-71.8-160-160s71.8-160 160-160s160 71.8 160 160s-71.8 160-160 160zm0-256c-53 0-96 43-96 96s43 96 96 96s96-43 96-96s-43-96-96-96zm0 128c-17.7 0-32-14.3-32-32s14.3-32 32-32s32 14.3 32 32s-14.3 32-32 32z"/>
          </Svg>
          <Text style={styles.navTextInactive}>Challenges</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

// ----------------------- STYLES -----------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    backgroundColor: '#3a9322',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appName: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  notificationIcon: { width: 35, height: 35, justifyContent: 'center', alignItems: 'center' },
  bellIcon: { fontSize: 22 },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileImage: { width: '100%', height: '100%', borderRadius: 20 },
  loadingProfile: { justifyContent: 'center', alignItems: 'center' },
  welcomeCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
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
  progressFill: { height: '100%', backgroundColor: '#FFD700' },
  ecoPointsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
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
  moduleTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', lineHeight: 22 },
  rewardsCard: {
    flex: 1,
    backgroundColor: '#9e13d5',
    borderRadius: 15,
    padding: 20,
  },
  rewardsHeader: { marginBottom: 5 },
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
  rewardsTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', lineHeight: 22 },
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
  gameCard: { width: '47%' },
  gameCardInner: {
    borderRadius: 15,
    padding: 15,
    minHeight: 130,
    alignItems: 'center',
  },
  gameImage: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    marginBottom: 8,
    resizeMode: 'cover',
  },
  gameCardText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navItemActive: {
    backgroundColor: '#adffac',
    borderRadius: 25,
    marginHorizontal: 5,
  },
  navTextActiveHome: {
    fontSize: 11,
    color: '#3a9322',
    fontWeight: '700',
    marginTop: 2,
  },
  navTextInactive: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
});