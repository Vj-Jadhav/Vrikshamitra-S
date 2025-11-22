import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';

export default function LeaderboardScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('college');

  // Top 3 Winners Data
  const topThree = [
    {
      rank: 2,
      name: 'Priya',
      points: 6500,
      avatar: 'https://i.pravatar.cc/150?img=5',
      color: '#FF9533',
    },
    {
      rank: 1,
      name: 'Rahul',
      points: 7120,
      avatar: 'https://i.pravatar.cc/150?img=12',
      color: '#FF5252',
    },
    {
      rank: 3,
      name: 'Amit',
      points: 4800,
      avatar: 'https://i.pravatar.cc/150?img=33',
      color: '#26C6DA',
    },
  ];

  // Rest of leaderboard data
  const leaderboardData = [
    { rank: 4, name: 'Sneha Sharma', points: 3920, avatar: 'https://i.pravatar.cc/150?img=9', trend: 'up' },
    { rank: 5, name: 'Arjun Patel', points: 3584, avatar: 'https://i.pravatar.cc/150?img=13', trend: 'down' },
    { rank: 6, name: 'Kavya Singh', points: 3448, avatar: 'https://i.pravatar.cc/150?img=23', trend: 'up' },
    { rank: 7, name: 'Rohan Verma', points: 3280, avatar: 'https://i.pravatar.cc/150?img=14', trend: 'up' },
    { rank: 8, name: 'Ananya Desai', points: 3180, avatar: 'https://i.pravatar.cc/150?img=24', trend: 'down' },
    { rank: 9, name: 'Vikram Reddy', points: 2990, avatar: 'https://i.pravatar.cc/150?img=15', trend: 'up' },
    { rank: 10, name: 'Pooja Gupta', points: 2845, avatar: 'https://i.pravatar.cc/150?img=25', trend: 'down' },
  ];

  return (
    <View style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Leaderboard</Text>

        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuIcon}>⋯</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Content Container */}
        <View style={styles.contentContainer}>
          
          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'college' && styles.tabActive]}
              onPress={() => setActiveTab('college')}
            >
              <Text style={[styles.tabText, activeTab === 'college' && styles.tabTextActive]}>
                College{'\n'}Level
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.tab, activeTab === 'state' && styles.tabActive]}
              onPress={() => setActiveTab('state')}
            >
              <Text style={[styles.tabText, activeTab === 'state' && styles.tabTextActive]}>
                State{'\n'}Level
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.tab, activeTab === 'national' && styles.tabActive]}
              onPress={() => setActiveTab('national')}
            >
              <Text style={[styles.tabText, activeTab === 'national' && styles.tabTextActive]}>
                National{'\n'}Level
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.rewardsTab}>
              <Text style={styles.rewardsIcon}>🎁</Text>
              <Text style={styles.rewardsText}>Rewards</Text>
            </TouchableOpacity>
          </View>

          {/* Top 3 Podium */}
          <View style={styles.podiumContainer}>
            
            {/* 2nd Place */}
            <View style={styles.podiumItem}>
              <View style={styles.pointsBadge}>
                <Text style={styles.pointsIcon}>🪙</Text>
                <Text style={styles.pointsText}>{topThree[0].points}</Text>
              </View>
              <View style={styles.podiumBlock2}>
                <Image 
                  source={{ uri: topThree[0].avatar }} 
                  style={styles.podiumAvatar}
                />
                <View style={[styles.podiumRank, { backgroundColor: topThree[0].color }]}>
                  <Text style={styles.podiumRankText}>2</Text>
                </View>
                <Text style={styles.podiumName}>{topThree[0].name}</Text>
              </View>
            </View>

            {/* 1st Place */}
            <View style={styles.podiumItem}>
              <Text style={styles.crownIcon}>👑</Text>
              <View style={styles.pointsBadge}>
                <Text style={styles.pointsIcon}>🪙</Text>
                <Text style={styles.pointsText}>{topThree[1].points}</Text>
              </View>
              <View style={styles.podiumBlock1}>
                <Image 
                  source={{ uri: topThree[1].avatar }} 
                  style={styles.podiumAvatar}
                />
                <View style={[styles.podiumRank, { backgroundColor: topThree[1].color }]}>
                  <Text style={styles.podiumRankText}>1</Text>
                </View>
                <Text style={styles.podiumName}>{topThree[1].name}</Text>
              </View>
            </View>

            {/* 3rd Place */}
            <View style={styles.podiumItem}>
              <View style={styles.pointsBadge}>
                <Text style={styles.pointsIcon}>🪙</Text>
                <Text style={styles.pointsText}>{topThree[2].points}</Text>
              </View>
              <View style={styles.podiumBlock3}>
                <Image 
                  source={{ uri: topThree[2].avatar }} 
                  style={styles.podiumAvatar}
                />
                <View style={[styles.podiumRank, { backgroundColor: topThree[2].color }]}>
                  <Text style={styles.podiumRankText}>3</Text>
                </View>
                <Text style={styles.podiumName}>{topThree[2].name}</Text>
              </View>
            </View>
          </View>

          {/* Leaderboard List */}
          <View style={styles.leaderboardList}>
            {leaderboardData.map((item, index) => (
              <View key={index} style={styles.leaderboardItem}>
                <Text style={styles.rankNumber}>{String(item.rank).padStart(2, '0')}</Text>
                
                <Image 
                  source={{ uri: item.avatar }} 
                  style={styles.avatarSmall}
                />

                <View style={styles.leaderboardInfo}>
                  <Text style={styles.leaderboardName}>{item.name}</Text>
                  <Text style={styles.leaderboardPoints}>{item.points} points</Text>
                </View>

                <View style={[
                  styles.trendIndicator,
                  { backgroundColor: item.trend === 'up' ? '#4CAF50' : '#FF5252' }
                ]}>
                  <Text style={styles.trendIcon}>
                    {item.trend === 'up' ? '↑' : '↓'}
                  </Text>
                </View>
              </View>
            ))}
          </View>

        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ✅ BOTTOM NAVIGATION REMOVED - Now handled by MainLayout */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5',
  },

  header: {
    backgroundColor: '#3a9322ff',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  backIcon: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },

  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },

  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  menuIcon: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },

  contentContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 20,
    borderRadius: 25,
    padding: 20,
    paddingBottom: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },

  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    padding: 5,
    gap: 5,
  },

  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
  },

  tabActive: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#0d7a5f',
    borderStyle: 'dashed',
  },

  tabText: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    lineHeight: 14,
    fontWeight: '600',
  },

  tabTextActive: {
    color: '#0d7a5f',
    fontWeight: 'bold',
  },

  rewardsTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  rewardsIcon: {
    fontSize: 20,
    marginBottom: 2,
  },

  rewardsText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
  },

  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginTop: 30,
    marginBottom: 30,
    paddingHorizontal: 10,
  },

  podiumItem: {
    flex: 1,
    alignItems: 'center',
  },

  crownIcon: {
    fontSize: 32,
    marginBottom: 5,
  },

  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  pointsIcon: {
    fontSize: 14,
    marginRight: 4,
  },

  pointsText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },

  podiumBlock1: {
    width: '100%',
    backgroundColor: '#FF5252',
    borderRadius: 15,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingTop: 15,
    paddingBottom: 20,
    alignItems: 'center',
    minHeight: 180,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  podiumBlock2: {
    width: '100%',
    backgroundColor: '#FF9533',
    borderRadius: 15,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingTop: 15,
    paddingBottom: 20,
    alignItems: 'center',
    minHeight: 150,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  podiumBlock3: {
    width: '100%',
    backgroundColor: '#26C6DA',
    borderRadius: 15,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingTop: 15,
    paddingBottom: 20,
    alignItems: 'center',
    minHeight: 130,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  podiumAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#fff',
    marginBottom: 50,
  },

  podiumRank: {
    position: 'absolute',
    bottom: 35,
    width: 45,
    height: 45,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },

  podiumRankText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },

  podiumName: {
    position: 'absolute',
    bottom: 10,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },

  leaderboardList: {
    gap: 12,
  },

  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 15,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },

  rankNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    width: 35,
  },

  avatarSmall: {
    width: 45,
    height: 45,
    borderRadius: 23,
    marginRight: 15,
  },

  leaderboardInfo: {
    flex: 1,
  },

  leaderboardName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 3,
  },

  leaderboardPoints: {
    fontSize: 13,
    color: '#888',
  },

  trendIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  trendIcon: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },

  // ✅ REMOVED: bottomNav, navItem, navItemActive, navTextInactive styles
});