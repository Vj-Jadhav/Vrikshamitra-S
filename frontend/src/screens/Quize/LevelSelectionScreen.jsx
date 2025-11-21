// LevelSelectionScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
  Alert,
  BackHandler
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const LevelSelectionScreen = ({ navigation }) => {
  const [userData, setUserData] = useState({
    totalPoints: 1250,
    completedQuizzes: 23,
    currentLevel: 3
  });

  const levels = [
    {
      id: 1,
      title: 'Seedling',
      description: 'Begin your eco-journey',
      questions: 5,
      difficulty: 'Easy',
      color: ['#2E8B57', '#3CB371'],
      icon: '🌱',
      locked: false,
      score: 5,
      requiredPoints: 0
    },
    {
      id: 2,
      title: 'Sapling',
      description: 'Grow your knowledge',
      questions: 8,
      difficulty: 'Medium',
      color: ['#4169E1', '#6495ED'],
      icon: '🌿',
      locked: false,
      score: 6,
      requiredPoints: 200
    },
    {
      id: 3,
      title: 'Tree',
      description: 'Become an eco-expert',
      questions: 10,
      difficulty: 'Hard',
      color: ['#FF8C00', '#FFA500'],
      icon: '🌳',
      locked: false,
      score: 8,
      requiredPoints: 500
    },
    {
      id: 4,
      title: 'Forest',
      description: 'Master of environment',
      questions: 12,
      difficulty: 'Expert',
      color: ['#9370DB', '#BA55D3'],
      icon: '🌲',
      locked: true,
      score: 0,
      requiredPoints: 1000
    },
    {
      id: 5,
      title: 'Ecosystem',
      description: 'Ultimate challenge',
      questions: 15,
      difficulty: 'Master',
      color: ['#FF4500', '#DC143C'],
      icon: '🌍',
      locked: true,
      score: 0,
      requiredPoints: 1500
    },
    {
      id: 6,
      title: 'Guardian',
      description: 'Environmental protector',
      questions: 20,
      difficulty: 'Legend',
      color: ['#00CED1', '#20B2AA'],
      icon: '🛡️',
      locked: true,
      score: 0,
      requiredPoints: 2000
    }
  ];

  const animatedValues = levels.reduce((acc, level) => {
    acc[level.id] = new Animated.Value(0);
    return acc;
  }, {});

  useEffect(() => {
    // Start animations
    levels.forEach((level, index) => {
      Animated.spring(animatedValues[level.id], {
        toValue: 1,
        delay: index * 150,
        tension: 60,
        friction: 7,
        useNativeDriver: true,
      }).start();
    });

    // Back handler
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, []);

  const handleBackPress = () => {
    Alert.alert(
      'Exit App',
      'Are you sure you want to exit?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Exit', onPress: () => BackHandler.exitApp() }
      ]
    );
    return true;
  };

  const handleLevelPress = (level) => {
    if (level.locked) {
      Alert.alert(
        'Level Locked',
        `You need ${level.requiredPoints - userData.totalPoints} more points to unlock this level!`,
        [{ text: 'OK' }]
      );
      return;
    }
    
    navigation.navigate('QuizScreen', { 
      level
    });
  };

  const getCompletionPercentage = () => {
    const unlockedLevels = levels.filter(level => !level.locked).length;
    return Math.round((unlockedLevels / levels.length) * 100);
  };

  const LevelCard = ({ level, index }) => {
    const scale = animatedValues[level.id].interpolate({
      inputRange: [0, 1],
      outputRange: [0.7, 1],
    });

    const translateY = animatedValues[level.id].interpolate({
      inputRange: [0, 1],
      outputRange: [50, 0],
    });

    const opacity = animatedValues[level.id];

    return (
      <Animated.View
        style={[
          styles.levelCardContainer,
          {
            transform: [{ scale }, { translateY }],
            opacity,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.levelCard}
          onPress={() => handleLevelPress(level)}
          activeOpacity={0.8}
          disabled={level.locked}
        >
          <LinearGradient
            colors={level.locked ? ['#696969', '#808080'] : level.color}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Level Icon */}
            <View style={styles.iconContainer}>
              <Text style={styles.levelIcon}>{level.icon}</Text>
              {level.locked && (
                <View style={styles.lockIcon}>
                  <Icon name="lock-closed" size={16} color="#fff" />
                </View>
              )}
            </View>

            {/* Level Info */}
            <View style={styles.levelInfo}>
              <View style={styles.levelHeader}>
                <Text style={styles.levelTitle}>{level.title}</Text>
                <Text style={styles.levelDifficulty}>{level.difficulty}</Text>
              </View>
              
              <Text style={styles.levelDescription}>{level.description}</Text>
              
              <View style={styles.levelStats}>
                <View style={styles.stat}>
                  <Icon name="help-circle-outline" size={14} color="#fff" />
                  <Text style={styles.statText}>{level.questions} Qs</Text>
                </View>
                <View style={styles.stat}>
                  <Icon name="star-outline" size={14} color="#fff" />
                  <Text style={styles.statText}>{level.requiredPoints} pts</Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBackground}>
                  <View 
                    style={[
                      styles.progressFill,
                      { 
                        width: `${Math.min((level.score / level.questions) * 100, 100)}%`,
                        backgroundColor: level.locked ? '#A9A9A9' : '#FFFFFF'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {level.score}/{level.questions}
                </Text>
              </View>
            </View>

            {/* Action Button */}
            <View style={styles.actionContainer}>
              {level.locked ? (
                <View style={styles.lockedButton}>
                  <Icon name="lock-closed" size={18} color="#fff" />
                </View>
              ) : (
                <View style={[
                  styles.playButton,
                  { backgroundColor: '#FFFFFF' }
                ]}>
                  <IconButton icon="play" size={18} color="#4CAF50" />
                </View>
              )}
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <LinearGradient
        colors={['#1E3A8A', '#3B82F6', '#06B6D4']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Eco Challenge</Text>
          <Text style={styles.headerSubtitle}>Level Up Your Environmental Knowledge</Text>
        </View>

        {/* User Stats */}
        <View style={styles.userStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userData.currentLevel}/{levels.length}</Text>
            <Text style={styles.statLabel}>Levels</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userData.totalPoints}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{getCompletionPercentage()}%</Text>
            <Text style={styles.statLabel}>Complete</Text>
          </View>
        </View>

        {/* Levels List */}
        <ScrollView 
          style={styles.levelsContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.levelsContent}
        >
          {levels.map((level, index) => (
            <LevelCard key={level.id} level={level} index={index} />
          ))}
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigation.navigate('Leaderboard')}
          >
            <Icon name="trophy" size={22} color="#FFFFFF" />
            <Text style={styles.navText}>Leaderboard</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Icon name="person" size={22} color="#FFFFFF" />
            <Text style={styles.navText}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Icon name="settings" size={22} color="#FFFFFF" />
            <Text style={styles.navText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    paddingTop: StatusBar.currentHeight + 10,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
  },
  userStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 25,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    marginVertical: 8,
  },
  levelsContainer: {
    flex: 1,
  },
  levelsContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  levelCardContainer: {
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  levelCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    padding: 18,
    alignItems: 'center',
    minHeight: 100,
  },
  iconContainer: {
    position: 'relative',
    marginRight: 16,
  },
  levelIcon: {
    fontSize: 36,
  },
  lockIcon: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 8,
    padding: 2,
  },
  levelInfo: {
    flex: 1,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  levelDifficulty: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  levelDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 10,
    fontWeight: '500',
  },
  levelStats: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 11,
    color: '#FFFFFF',
    marginLeft: 4,
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBackground: {
    flex: 1,
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 3,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
    minWidth: 35,
  },
  actionContainer: {
    marginLeft: 10,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  lockedButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  bottomNav: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
  },
  navText: {
    color: '#FFFFFF',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default LevelSelectionScreen;