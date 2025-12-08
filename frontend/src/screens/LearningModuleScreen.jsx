import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TextInput,
  Animated,
  Dimensions,
  Modal,
  RefreshControl,
  Platform,
  Linking
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import YoutubePlayer from "react-native-youtube-iframe";
import { API_ENDPOINTS } from '../config/config.js';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function LearningModuleScreen({ navigation, route }) {
  const [allLessons, setAllLessons] = useState([]);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [videoLoading, setVideoLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoError, setVideoError] = useState(null);
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const BACKEND_URL = API_ENDPOINTS.LEARNING_MODULES;

  // User stats
  const [userStats, setUserStats] = useState({
    completed: 0,
    inProgress: 0,
    totalPoints: 0,
    streak: 0,
    level: 1
  });

  // Categories
  const categories = [
    { id: 'all', name: 'All', icon: 'earth', color: '#667eea' },
    { id: 'climate', name: 'Climate', icon: 'thermometer', color: '#ff6b6b' },
    { id: 'biodiversity', name: 'Biodiversity', icon: 'butterfly', color: '#4ecdc4' },
    { id: 'pollution', name: 'Pollution', icon: 'factory', color: '#ff9ff3' },
    { id: 'conservation', name: 'Conservation', icon: 'recycle', color: '#feca57' },
    { id: 'sustainability', name: 'Sustainability', icon: 'leaf', color: '#1dd1a1' },
    { id: 'water', name: 'Water', icon: 'water', color: '#54a0ff' },
    { id: 'forest', name: 'Forest', icon: 'tree', color: '#00b894' },
  ];

  // Animation on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Get streak count
  const getStreakCount = useCallback(async () => {
    try {
      const lastCompletion = await AsyncStorage.getItem("lastCompletionDate");
      if (!lastCompletion) return 0;
      
      const lastDate = new Date(lastCompletion);
      const today = new Date();
      const diffTime = Math.abs(today - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays <= 1 ? 3 : 0;
    } catch (error) {
      console.error("Error getting streak:", error);
      return 0;
    }
  }, []);

  // Load completed modules from local storage
  const loadCompletedModules = useCallback(async () => {
    try {
      const data = await AsyncStorage.getItem("completedLessons");
      const completed = data ? JSON.parse(data) : [];
      setCompletedLessons(completed);
      
      // Update user stats
      const totalPoints = allLessons.reduce((sum, lesson) => {
        return completed.includes(lesson.id) ? sum + (lesson.points || 0) : sum;
      }, 0);
      
      const streak = await getStreakCount();
      
      setUserStats(prev => ({
        ...prev,
        completed: completed.length,
        totalPoints,
        inProgress: Math.max(0, allLessons.length - completed.length),
        streak: streak,
        level: Math.floor(totalPoints / 100) + 1
      }));
    } catch (error) {
      console.error("Error loading completed lessons:", error);
    }
  }, [allLessons, getStreakCount]);

  // Fetch modules from backend
  const fetchModules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.get(BACKEND_URL);
      
      if (res.data.success) {
        setAllLessons(res.data.data || []);
      } else {
        setAllLessons([]);
      }
    } catch (err) {
      console.error("Error fetching modules:", err);
      setError("Failed to load learning modules. Please check your connection.");
      Alert.alert("Error", "Failed to load learning modules.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [BACKEND_URL]);

  // Extract YouTube ID from various formats
  const extractYouTubeId = useCallback((url) => {
    if (!url) return null;
    
    // If it's already a video ID (11 characters)
    if (url.length === 11 && !url.includes('/') && !url.includes('?')) {
      return url;
    }
    
    // Extract from various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/watch\?.*v=)([^&?\n]+)/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  }, []);

  // Initial load
  useEffect(() => {
    const init = async () => {
      await fetchModules();
    };
    init();
  }, [fetchModules]);

  // Update stats when lessons or completed lessons change
  useEffect(() => {
    if (allLessons.length > 0) {
      loadCompletedModules();
    }
  }, [allLessons, loadCompletedModules]);

  // Calculate progress percentage
  useEffect(() => {
    if (allLessons.length === 0) return;
    
    const percent = (completedLessons.length / allLessons.length) * 100;
    setProgressPercentage(Math.min(percent.toFixed(1), 100));
  }, [allLessons, completedLessons]);

  // Filter lessons based on category and search
  const filteredLessons = useMemo(() => {
    let filtered = activeCategory === 'all' 
      ? allLessons 
      : allLessons.filter(lesson => lesson.category === activeCategory);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(lesson =>
        lesson.title.toLowerCase().includes(query) ||
        (lesson.subtitle && lesson.subtitle.toLowerCase().includes(query)) ||
        (lesson.description && lesson.description.toLowerCase().includes(query)) ||
        (lesson.tags && lesson.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    return filtered;
  }, [activeCategory, searchQuery, allLessons]);

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchModules();
  }, [fetchModules]);

  // Lesson progress helper
  const getLessonProgress = useCallback((lessonId) => {
    return completedLessons.includes(lessonId) ? 100 : 0;
  }, [completedLessons]);

  // Handle module press
  const handleModulePress = (lesson) => {
    if (lesson.youtubeId) {
      setSelectedLesson(lesson);
      setVideoError(null);
      setVideoLoading(true);
    } else {
      navigation.navigate("LearningDetailScreen", {
        module: lesson,
        onComplete: async () => {
          await markLessonComplete(lesson.id);
        },
      });
    }
  };

  // Mark lesson as complete
  const markLessonComplete = async (lessonId) => {
    if (!completedLessons.includes(lessonId)) {
      const updated = [...new Set([...completedLessons, lessonId])];
      setCompletedLessons(updated);
      await AsyncStorage.setItem("completedLessons", JSON.stringify(updated));
      await AsyncStorage.setItem("lastCompletionDate", new Date().toISOString());
      
      const lesson = allLessons.find(l => l.id === lessonId);
      if (lesson) {
        setUserStats(prev => ({
          ...prev,
          completed: prev.completed + 1,
          totalPoints: prev.totalPoints + (lesson.points || 0),
          inProgress: Math.max(0, prev.inProgress - 1),
          level: Math.floor((prev.totalPoints + (lesson.points || 0)) / 100) + 1
        }));
      }
      
      Alert.alert("🎉 Lesson Complete!", `You earned ${lesson?.points || 0} points!`);
    }
  };

  // Continue button handler
  const handleContinue = () => {
    const nextModule = allLessons.find((lesson) => !completedLessons.includes(lesson.id));
    
    if (nextModule) {
      handleModulePress(nextModule);
    } else {
      Alert.alert("🎉 Congratulations!", "All modules completed!");
    }
  };

  // Video state change handler
  const handleVideoStateChange = useCallback((state) => {
    console.log('Video state:', state);
    
    if (state === 'ended') {
      setIsVideoPlaying(false);
      setVideoLoading(false);
      handleVideoComplete();
    } else if (state === 'playing') {
      setVideoLoading(false);
      setVideoError(null);
    } else if (state === 'paused') {
      setIsVideoPlaying(false);
      setVideoLoading(false);
    } else if (state === 'buffering') {
      setVideoLoading(true);
    } else if (state === 'unstarted') {
      setVideoLoading(true);
    }
  }, []);

  // Video error handler
  const handleVideoError = useCallback((error) => {
    console.error('YouTube player error:', error);
    setVideoError("Failed to load video. Please check your internet connection or try opening in YouTube app.");
    setVideoLoading(false);
  }, []);

  // Open video in YouTube app
  const openInYouTube = useCallback((videoId) => {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    Linking.openURL(url).catch(err => {
      console.error('Failed to open YouTube:', err);
      Alert.alert("Error", "Could not open YouTube. Please install YouTube app.");
    });
  }, []);

  // Video complete handler
  const handleVideoComplete = useCallback(() => {
    if (selectedLesson && selectedLesson.quiz && selectedLesson.quiz.length > 0) {
      setShowQuiz(true);
    } else {
      handleLessonCompleteNoQuiz();
    }
  }, [selectedLesson]);

  // Handle quiz answer selection
  const handleAnswerSelect = useCallback((answerIndex) => {
    setSelectedAnswer(answerIndex);
  }, []);

  // Handle next question
  const handleNextQuestion = useCallback(() => {
    if (selectedAnswer === null) {
      Alert.alert('Please select an answer', 'You must select an answer before continuing.');
      return;
    }

    const currentQuestion = selectedLesson.quiz[currentQuestionIndex];
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setQuizScore(prev => prev + 1);
    }

    if (currentQuestionIndex < selectedLesson.quiz.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      setShowResults(true);
    }
  }, [selectedAnswer, currentQuestionIndex, selectedLesson]);

  // Handle lesson completion with quiz
  const handleLessonComplete = useCallback(async () => {
    const passingScore = Math.ceil(selectedLesson.quiz.length * 0.6);

    if (quizScore >= passingScore) {
      await markLessonComplete(selectedLesson.id);
      Alert.alert(
        '🎉 Congratulations!',
        `You passed with ${quizScore}/${selectedLesson.quiz.length} correct answers!\n\nYou earned ${selectedLesson.points} points!`,
        [{ text: 'OK', onPress: closeLesson }]
      );
    } else {
      Alert.alert(
        'Keep Learning!',
        `You scored ${quizScore}/${selectedLesson.quiz.length}. You need ${passingScore} to pass.\n\nTry watching the video again!`,
        [
          { text: 'Retry', onPress: resetQuiz },
          { text: 'Close', onPress: closeLesson }
        ]
      );
    }
  }, [selectedLesson, quizScore]);

  // Handle lesson completion without quiz
  const handleLessonCompleteNoQuiz = useCallback(async () => {
    await markLessonComplete(selectedLesson.id);
    Alert.alert(
      '🎉 Lesson Complete!',
      `You earned ${selectedLesson.points} points!`,
      [{ text: 'OK', onPress: closeLesson }]
    );
  }, [selectedLesson]);

  // Reset quiz
  const resetQuiz = useCallback(() => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setQuizScore(0);
    setShowResults(false);
    setShowQuiz(false);
    setIsVideoPlaying(true);
  }, []);

  // Close lesson modal
  const closeLesson = useCallback(() => {
    setSelectedLesson(null);
    setShowQuiz(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setQuizScore(0);
    setShowResults(false);
    setIsVideoPlaying(false);
    setVideoLoading(true);
    setVideoError(null);
  }, []);

  // Get active category color
  const getActiveCategoryColor = () => {
    const category = categories.find(cat => cat.id === activeCategory);
    return category ? category.color : '#667eea';
  };

  // Render loading state
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3a9322" />
        <Text style={styles.loadingText}>Loading learning modules...</Text>
      </View>
    );
  }

  // Render error state
  if (error && !loading) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle-outline" size={60} color="#ff6b6b" />
        <Text style={styles.errorTitle}>Unable to Load Modules</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchModules}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack?.()}
        >
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Learning Modules</Text>

        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => setShowSearch(!showSearch)}
        >
          <Icon name="magnify" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      {showSearch && (
        <Animated.View style={[styles.searchContainer, { opacity: fadeAnim }]}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search lessons..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              setShowSearch(false);
            }}
            style={styles.searchClose}
          >
            <Icon name="close" size={20} color="#666" />
          </TouchableOpacity>
        </Animated.View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Progress Card */}
        <Animated.View
          style={[
            styles.progressCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.progressContent}>
            <View style={styles.progressLeft}>
              <Text style={styles.progressTitle}>Your Learning Journey</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{userStats.completed}</Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{progressPercentage}%</Text>
                  <Text style={styles.statLabel}>Progress</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{userStats.streak}</Text>
                  <Text style={styles.statLabel}>Day Streak</Text>
                </View>
              </View>
              <View style={styles.levelContainer}>
                <Text style={styles.levelLabel}>Level {userStats.level}</Text>
                <View style={styles.levelBar}>
                  <View 
                    style={[
                      styles.levelProgress, 
                      { width: `${(userStats.totalPoints % 100) || 0}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.pointsLabel}>{userStats.totalPoints} points</Text>
              </View>
            </View>
            <View style={styles.progressRight}>
              <Icon name="trophy" size={40} color="#fff" />
              <Text style={styles.pointsText}>+{userStats.totalPoints}</Text>
            </View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity onPress={handleContinue} style={styles.continueButton}>
            <Text style={styles.continueButtonText}>
              Continue Learning →
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Categories */}
        <View style={styles.section}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  activeCategory === category.id && [
                    styles.categoryChipActive,
                    { borderColor: category.color }
                  ]
                ]}
                onPress={() => setActiveCategory(category.id)}
              >
                <Icon 
                  name={category.icon} 
                  size={18} 
                  color={activeCategory === category.id ? category.color : '#666'} 
                />
                <Text style={[
                  styles.categoryText,
                  activeCategory === category.id && [
                    styles.categoryTextActive,
                    { color: category.color }
                  ]
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Lessons List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Lessons</Text>
            <Text style={styles.lessonCount}>{filteredLessons.length} lessons</Text>
          </View>

          {filteredLessons.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="book-search-outline" size={50} color="#999" />
              <Text style={styles.emptyStateTitle}>No lessons found</Text>
              <Text style={styles.emptyStateText}>
                {searchQuery ? 'Try a different search term' : 'Try selecting a different category'}
              </Text>
            </View>
          ) : (
            filteredLessons.map((lesson, index) => (
              <LessonCard
                key={lesson.id || index}
                lesson={lesson}
                isCompleted={completedLessons.includes(lesson.id)}
                progress={getLessonProgress(lesson.id)}
                onPress={() => handleModulePress(lesson)}
                categories={categories}
                fadeAnim={fadeAnim}
                slideAnim={slideAnim}
              />
            ))
          )}
        </View>

        {/* Footer Spacer */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Lesson Modal */}
      <Modal
        visible={selectedLesson !== null}
        animationType="slide"
        onRequestClose={closeLesson}
        statusBarTranslucent
      >
        {selectedLesson && (
          <LessonModal
            lesson={selectedLesson}
            showQuiz={showQuiz}
            showResults={showResults}
            currentQuestionIndex={currentQuestionIndex}
            selectedAnswer={selectedAnswer}
            quizScore={quizScore}
            isVideoPlaying={isVideoPlaying}
            videoLoading={videoLoading}
            videoError={videoError}
            onClose={closeLesson}
            onVideoStateChange={handleVideoStateChange}
            onVideoError={handleVideoError}
            onAnswerSelect={handleAnswerSelect}
            onNextQuestion={handleNextQuestion}
            onLessonComplete={handleLessonComplete}
            onVideoComplete={handleVideoComplete}
            onResetQuiz={resetQuiz}
            onOpenInYouTube={openInYouTube}
            extractYouTubeId={extractYouTubeId}
            activeCategoryColor={getActiveCategoryColor()}
          />
        )}
      </Modal>
    </View>
  );
}

// Lesson Card Component
const LessonCard = React.memo(({ lesson, isCompleted, progress, onPress, categories, fadeAnim, slideAnim }) => {
  const category = categories.find(cat => cat.id === lesson.category);
  const lessonColor = lesson.color || '#667eea';

  return (
    <Animated.View
      style={[
        styles.lessonCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <View style={[styles.lessonThumbnail, { backgroundColor: lessonColor }]}>
          <View style={styles.videoPlaceholder}>
            {lesson.imageUrl ? (
              <Image
                source={{ uri: lesson.imageUrl }}
                style={styles.thumbnailImage}
                resizeMode="cover"
              />
            ) : (
              <>
                <Icon name="play-circle-outline" size={50} color="#fff" />
                <Text style={styles.videoText}>Watch Video</Text>
              </>
            )}
          </View>

          <View style={styles.lessonHeaderOverlay}>
            {category && (
              <View style={[styles.categoryTag, { backgroundColor: category.color }]}>
                <Text style={styles.categoryTagText}>{category.name}</Text>
              </View>
            )}
            {isCompleted && (
              <View style={styles.completedBadge}>
                <Icon name="check" size={16} color="#fff" />
              </View>
            )}
          </View>

          {progress > 0 && !isCompleted && (
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress}%` }
                ]}
              />
            </View>
          )}
        </View>

        <View style={styles.lessonContent}>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          {lesson.subtitle && (
            <Text style={styles.lessonSubtitle}>{lesson.subtitle}</Text>
          )}

          <View style={styles.lessonMeta}>
            <View style={styles.metaItem}>
              <Icon name="clock-outline" size={14} color="#666" />
              <Text style={styles.metaText}>{lesson.duration || '10 min'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="star-outline" size={14} color="#666" />
              <Text style={styles.metaText}>{lesson.points || 0} Points</Text>
            </View>
            {lesson.difficulty && (
              <View style={styles.metaItem}>
                <Icon 
                  name={lesson.difficulty === 'Beginner' ? 'flag-outline' : 
                         lesson.difficulty === 'Intermediate' ? 'flag-triangle' : 'flag'} 
                  size={14} 
                  color="#666" 
                />
                <Text style={styles.metaText}>{lesson.difficulty}</Text>
              </View>
            )}
          </View>

          {isCompleted ? (
            <View style={styles.completedButton}>
              <Icon name="check-circle" size={16} color="#4CAF50" />
              <Text style={styles.completedButtonText}>Completed</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.startButton} onPress={onPress}>
              <Text style={styles.startButtonText}>
                {progress > 0 ? 'Continue Learning →' : 'Start Learning →'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

// Lesson Modal Component
const LessonModal = ({
  lesson,
  showQuiz,
  showResults,
  currentQuestionIndex,
  selectedAnswer,
  quizScore,
  isVideoPlaying,
  videoLoading,
  videoError,
  onClose,
  onVideoStateChange,
  onVideoError,
  onAnswerSelect,
  onNextQuestion,
  onLessonComplete,
  onVideoComplete,
  onResetQuiz,
  onOpenInYouTube,
  extractYouTubeId,
  activeCategoryColor
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  
  // Extract YouTube ID
  const youtubeId = extractYouTubeId(lesson.youtubeId);
  const hasValidVideo = youtubeId && youtubeId.length >= 11;

  // Handle play/pause
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <View style={styles.modalContainer}>
      {/* Header */}
      <View style={[styles.modalHeader, { backgroundColor: activeCategoryColor }]}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.modalTitle} numberOfLines={2}>
          {lesson.title}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {!showQuiz ? (
        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {/* Video Section */}
          {hasValidVideo ? (
            <>
              <View style={styles.videoContainer}>
                {/* {videoLoading && (
                  // <View style={styles.videoLoader}>
                  //   <ActivityIndicator size="large" color="#3a9322" />
                  //   <Text style={styles.loadingText}>Loading video...</Text>
                  // </View>
                )}
                 */}
                {videoError ? (
                  <View style={styles.videoErrorContainer}>
                    <Icon name="alert-circle-outline" size={60} color="#ff6b6b" />
                    <Text style={styles.videoErrorText}>{videoError}</Text>
                    <TouchableOpacity
                      style={styles.youtubeButton}
                      onPress={() => onOpenInYouTube(youtubeId)}
                    >
                      <Icon name="youtube" size={20} color="#fff" />
                      <Text style={styles.youtubeButtonText}>Open in YouTube</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <View style={styles.youtubeWrapper}>
                      <YoutubePlayer
                        height={220}
                        play={isPlaying}
                        videoId={youtubeId}
                        onChangeState={onVideoStateChange}
                        onError={onVideoError}
                        webViewStyle={styles.youtubeWebView}
                        webViewProps={{
                          androidLayerType: 'hardware',
                          allowsFullscreenVideo: true,
                          mediaPlaybackRequiresUserAction: false,
                        }}
                      />
                    </View>
                    
                    <View style={styles.videoControls}>
                      <TouchableOpacity onPress={handlePlayPause} style={styles.controlButton}>
                        <Icon name={isPlaying ? "pause" : "play"} size={24} color="#fff" />
                        <Text style={styles.controlText}>{isPlaying ? "Pause" : "Play"}</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.youtubeButton}
                        onPress={() => onOpenInYouTube(youtubeId)}
                      >
                        <Icon name="youtube" size={20} color="#fff" />
                        <Text style={styles.youtubeButtonText}>Open in YouTube</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>

              <View style={styles.lessonInfo}>
                <Text style={styles.lessonInfoTitle}>About this lesson</Text>
                <Text style={styles.lessonInfoText}>
                  {lesson.description || 'Watch the video to learn more about this topic.'}
                </Text>

                <View style={styles.lessonInfoMeta}>
                  <View style={styles.infoMetaItem}>
                    <Text style={styles.infoMetaLabel}>Duration:</Text>
                    <Text style={styles.infoMetaValue}>{lesson.duration || '10 min'}</Text>
                  </View>
                  {lesson.difficulty && (
                    <View style={styles.infoMetaItem}>
                      <Text style={styles.infoMetaLabel}>Difficulty:</Text>
                      <Text style={styles.infoMetaValue}>{lesson.difficulty}</Text>
                    </View>
                  )}
                  <View style={styles.infoMetaItem}>
                    <Text style={styles.infoMetaLabel}>Points:</Text>
                    <Text style={styles.infoMetaValue}>{lesson.points || 0}</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.completeVideoButton}
                onPress={onVideoComplete}
              >
                <Text style={styles.completeVideoButtonText}>
                  {lesson.quiz && lesson.quiz.length > 0
                    ? "I've Watched the Video - Take Quiz →"
                    : "Complete Lesson →"}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.noVideoContainer}>
              <Icon name="video-off" size={60} color="#666" />
              <Text style={styles.noVideoTitle}>No video available</Text>
              <Text style={styles.noVideoText}>
                {lesson.youtubeId 
                  ? "The YouTube video ID is invalid. Please check the module settings."
                  : "No video available for this lesson. Please check back later."}
              </Text>
              <View style={styles.lessonInfo}>
                <Text style={styles.lessonInfoTitle}>About this lesson</Text>
                <Text style={styles.lessonInfoText}>
                  {lesson.description || 'No description available.'}
                </Text>
              </View>
              <TouchableOpacity style={styles.completeVideoButton} onPress={onClose}>
                <Text style={styles.completeVideoButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      ) : !showResults ? (
        <QuizSection
          lesson={lesson}
          currentQuestionIndex={currentQuestionIndex}
          selectedAnswer={selectedAnswer}
          onAnswerSelect={onAnswerSelect}
          onNextQuestion={onNextQuestion}
        />
      ) : (
        <QuizResults
          lesson={lesson}
          quizScore={quizScore}
          onLessonComplete={onLessonComplete}
          onResetQuiz={onResetQuiz}
        />
      )}
    </View>
  );
};

// Quiz Section Component
const QuizSection = ({ lesson, currentQuestionIndex, selectedAnswer, onAnswerSelect, onNextQuestion }) => {
  const currentQuestion = lesson.quiz[currentQuestionIndex];

  return (
    <View style={styles.quizContainer}>
      <View style={styles.quizProgress}>
        <Text style={styles.quizProgressText}>
          Question {currentQuestionIndex + 1} of {lesson.quiz.length}
        </Text>
        <View style={styles.quizProgressBar}>
          <View
            style={[
              styles.quizProgressFill,
              { width: `${((currentQuestionIndex + 1) / lesson.quiz.length) * 100}%` }
            ]}
          />
        </View>
      </View>

      <Text style={styles.quizQuestion}>{currentQuestion.question}</Text>

      <ScrollView
        style={styles.answersScroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.answersContainer}>
          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.answerOption,
                selectedAnswer === index && styles.answerOptionSelected
              ]}
              onPress={() => onAnswerSelect(index)}
            >
              <View style={styles.answerRadio}>
                {selectedAnswer === index && <View style={styles.answerRadioSelected} />}
              </View>
              <Text style={[
                styles.answerText,
                selectedAnswer === index && styles.answerTextSelected
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.nextButton,
          selectedAnswer === null && styles.nextButtonDisabled
        ]}
        onPress={onNextQuestion}
        disabled={selectedAnswer === null}
      >
        <Text style={styles.nextButtonText}>
          {currentQuestionIndex < lesson.quiz.length - 1 ? 'Next Question →' : 'Submit Quiz'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// Quiz Results Component
const QuizResults = ({ lesson, quizScore, onLessonComplete, onResetQuiz }) => {
  const passingScore = Math.ceil(lesson.quiz.length * 0.6);
  const passed = quizScore >= passingScore;

  return (
    <View style={styles.resultsContainer}>
      <Icon 
        name={passed ? "trophy" : "book-open-variant"} 
        size={80} 
        color={passed ? "#FFD700" : "#666"} 
      />
      <Text style={styles.resultsTitle}>
        {passed ? '🎉 Quiz Completed!' : 'Keep Learning!'}
      </Text>
      <Text style={styles.resultsScore}>
        You scored {quizScore} out of {lesson.quiz.length}
      </Text>
      <Text style={styles.resultsPercentage}>
        {Math.round((quizScore / lesson.quiz.length) * 100)}%
      </Text>

      {passed ? (
        <View style={styles.passedContainer}>
          <Text style={styles.passedText}>✓ Passed!</Text>
          <Text style={styles.pointsEarned}>+{lesson.points} points earned</Text>
        </View>
      ) : (
        <View style={styles.failedContainer}>
          <Text style={styles.failedText}>You need {passingScore} correct answers to pass</Text>
          <Text style={styles.failedSubtext}>
            Review the material and try again
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.finishButton} onPress={onLessonComplete}>
        <Text style={styles.finishButtonText}>
          {passed ? 'Continue Learning' : 'Try Again'}
        </Text>
      </TouchableOpacity>
      
      {!passed && (
        <TouchableOpacity style={styles.resetButton} onPress={onResetQuiz}>
          <Text style={styles.resetButtonText}>Review Video</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: '#3a9322',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#3a9322',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
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
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  searchButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 10,
    paddingHorizontal: 15,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
  },
  searchClose: {
    padding: 5,
  },
  progressCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    backgroundColor: '#667eea',
  },
  progressContent: {
    padding: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressLeft: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  levelContainer: {
    marginTop: 10,
  },
  levelLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 5,
  },
  levelBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 5,
  },
  levelProgress: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  pointsLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
  },
  progressRight: {
    marginLeft: 15,
    alignItems: 'center',
  },
  pointsText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 5,
  },
  continueButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    fontWeight: 'bold',
    color: '#667eea',
    fontSize: 15,
  },
  section: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  lessonCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  categoriesScroll: {
    paddingRight: 20,
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    gap: 8,
  },
  categoryChipActive: {
    backgroundColor: '#fff',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  categoryTextActive: {
    color: '#000',
  },
  lessonCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  lessonThumbnail: {
    height: 180,
    position: 'relative',
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  videoText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  lessonHeaderOverlay: {
    position: 'absolute',
    top: 15,
    left: 15,
    right: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  categoryTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryTagText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  completedBadge: {
    backgroundColor: '#4CAF50',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  lessonContent: {
    padding: 20,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  lessonSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  lessonMeta: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 15,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: '#0d7a5f',
    paddingVertical: 12,
    borderRadius: 15,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  completedButton: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 12,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  completedButtonText: {
    color: '#4CAF50',
    fontSize: 15,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 15,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  modalContent: {
    flex: 1,
  },
  videoContainer: {
    backgroundColor: '#000',
  },
  youtubeWrapper: {
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  youtubeWebView: {
    backgroundColor: '#000',
  },
  videoLoader: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  videoErrorContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  videoErrorText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  videoControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  controlText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  youtubeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#FF0000',
    borderRadius: 20,
  },
  youtubeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  noVideoContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noVideoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  noVideoText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  lessonInfo: {
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  lessonInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  lessonInfoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  lessonInfoMeta: {
    gap: 8,
  },
  infoMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoMetaLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
    width: 80,
  },
  infoMetaValue: {
    fontSize: 14,
    color: '#666',
  },
  completeVideoButton: {
    backgroundColor: '#0d7a5f',
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  completeVideoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quizContainer: {
    flex: 1,
    padding: 20,
  },
  quizProgress: {
    marginBottom: 30,
  },
  quizProgressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  quizProgressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  quizProgressFill: {
    height: '100%',
    backgroundColor: '#0d7a5f',
  },
  quizQuestion: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 30,
    lineHeight: 28,
  },
  answersScroll: {
    flex: 1,
  },
  answersContainer: {
    gap: 15,
    marginBottom: 30,
  },
  answerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  answerOptionSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#0d7a5f',
  },
  answerRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#999',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  answerRadioSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0d7a5f',
  },
  answerText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    lineHeight: 20,
  },
  answerTextSelected: {
    color: '#0d7a5f',
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#0d7a5f',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  resultsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 20,
    marginBottom: 10,
  },
  resultsScore: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  resultsPercentage: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#0d7a5f',
    marginBottom: 30,
  },
  passedContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  passedText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  pointsEarned: {
    fontSize: 16,
    color: '#666',
  },
  failedContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  failedText: {
    fontSize: 18,
    color: '#FF9800',
    marginBottom: 10,
    textAlign: 'center',
  },
  failedSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  finishButton: {
    backgroundColor: '#0d7a5f',
    paddingHorizontal: 60,
    paddingVertical: 15,
    borderRadius: 15,
    marginBottom: 20,
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resetButton: {
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#0d7a5f',
    borderRadius: 15,
  },
  resetButtonText: {
    color: '#0d7a5f',
    fontSize: 16,
    fontWeight: 'bold',
  },
});