import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image
} from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#1b5e20" />
      <ScrollView style={styles.container}>
        
        {/* Profile Header Section */}
        <View style={styles.profileHeader}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatar}>🌿</Text>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>Lvl 5</Text>
              </View>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>Nandini Deshmukh</Text>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>350</Text>
                  <Text style={styles.statLabel}>Points</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>12</Text>
                  <Text style={styles.statLabel}>Streak</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>8</Text>
                  <Text style={styles.statLabel}>Badges</Text>
                </View>
              </View>
            </View>
          </View>
          
          {/* Progress Bar */}
          <View style={styles.xpContainer}>
            <Text style={styles.xpText}>XP: 350/500</Text>
            <View style={styles.xpBar}>
              <View style={styles.xpFill} />
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* App Title */}
        <View style={styles.appTitleContainer}>
          <Text style={styles.appTitle}>VRIKSHAMITRA</Text>
        </View>

        {/* Recent Activities Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RECENT ACTIVITIES</Text>
          
          {/* Global Warning Card */}
          <View style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <Text style={styles.activityMainTitle}>GLOBAL WARNING</Text>
              <View style={styles.tag}>
                <Text style={styles.tagText}>CLORAL WARNING</Text>
              </View>
            </View>
            
            <View style={styles.activityContent}>
              <Text style={styles.learnText}>Learn:</Text>
              <Text style={styles.description}>
                What is Global Warming & how to save earth?
              </Text>
              
              <View style={styles.details}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailIcon}>⭐</Text>
                  <Text style={styles.detailText}>3 points</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailIcon}>⏱️</Text>
                  <Text style={styles.detailText}>15 min</Text>
                </View>
              </View>
              
              <TouchableOpacity style={styles.learnButton}>
                <Text style={styles.learnButtonText}>Start Learning</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sinister Seeds Card */}
          <View style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <Text style={styles.activityMainTitle}>SINISTER SEEDS</Text>
              <View style={[styles.tag, styles.gameTag]}>
                <Text style={styles.tagText}>CARD HUNT GAME</Text>
              </View>
            </View>
            
            <View style={styles.activityContent}>
              <Text style={styles.gameDescription}>
                Hunt for invasive plant species in your area
              </Text>
              
              <View style={styles.gameRewards}>
                <View style={styles.rewardItem}>
                  <Text style={styles.rewardIcon}>🏆</Text>
                  <Text style={styles.rewardText}>50 XP</Text>
                </View>
                <View style={styles.rewardItem}>
                  <Text style={styles.rewardIcon}>🪙</Text>
                  <Text style={styles.rewardText}>Eco Coins</Text>
                </View>
              </View>
              
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>CLICK PHOTO FILE COMPLAINT</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* AR/VR Game Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AR/VR GAME</Text>
          
          <View style={styles.gameCard}>
            <View style={styles.gameHeader}>
              <Text style={styles.gameTitle}>FLORA, FANA EXPLORE</Text>
              <View style={styles.vrBadge}>
                <Text style={styles.vrBadgeText}>VR</Text>
              </View>
            </View>
            
            <Text style={styles.gameSubtitle}>Explore nature in Virtual Reality</Text>
            
            <View style={styles.navigationGrid}>
              <TouchableOpacity style={styles.navButton}>
                <Text style={styles.navButtonIcon}>🏠</Text>
                <Text style={styles.navButtonText}>Home</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.navButton}>
                <Text style={styles.navButtonIcon}>🎮</Text>
                <Text style={styles.navButtonText}>Games</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.navButton}>
                <Text style={styles.navButtonIcon}>📚</Text>
                <Text style={styles.navButtonText}>Learn</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.navButton}>
                <Text style={styles.navButtonIcon}>⚡</Text>
                <Text style={styles.navButtonText}>Challenges</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpace} />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileHeader: {
    padding: 20,
    paddingTop: 15,
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    fontSize: 50,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#e8f5e9',
    textAlign: 'center',
    lineHeight: 70,
    borderWidth: 3,
    borderColor: '#4caf50',
  },
  levelBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff9800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  levelText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1b5e20',
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1b5e20',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#dee2e6',
    marginHorizontal: 5,
  },
  xpContainer: {
    marginTop: 10,
  },
  xpText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    fontWeight: '600',
  },
  xpBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    width: '70%',
    backgroundColor: '#4caf50',
    borderRadius: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 20,
    marginVertical: 10,
  },
  appTitleContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1b5e20',
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1b5e20',
    marginBottom: 15,
    letterSpacing: 0.5,
  },
  activityCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 6,
    borderLeftColor: '#1b5e20',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  activityMainTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1b5e20',
    flex: 1,
  },
  tag: {
    backgroundColor: '#ffeb3b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fbc02d',
  },
  gameTag: {
    backgroundColor: '#4caf50',
    borderColor: '#388e3c',
  },
  tagText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  activityContent: {
    // Content styling
  },
  learnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  description: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
    lineHeight: 22,
  },
  gameDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  gameRewards: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  rewardIcon: {
    fontSize: 14,
    marginRight: 5,
  },
  rewardText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  learnButton: {
    backgroundColor: '#2196f3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
  },
  learnButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionButton: {
    backgroundColor: '#1b5e20',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  gameCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gameTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1b5e20',
  },
  vrBadge: {
    backgroundColor: '#9c27b0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  vrBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  gameSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  navigationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  navButton: {
    width: '48%',
    backgroundColor: '#e8f5e9',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#c5e1a5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  navButtonIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1b5e20',
  },
  bottomSpace: {
    height: 30,
  },
});