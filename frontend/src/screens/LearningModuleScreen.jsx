// frontend/src/screens/LearningModuleScreen.jsx

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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import YoutubePlayer from "react-native-youtube-iframe";
import { API_ENDPOINTS } from '../config/config.js';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function LearningModuleScreen({ navigation }) {
  const [allLessons, setAllLessons] = useState([]);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [loadingLessons, setLoadingLessons] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [userStats, setUserStats] = useState({
    completed: 0,
    inProgress: 0,
    totalPoints: 0,
    streak: 3
  });

  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  // 🚀 1. FETCH ALL MODULES FROM DATABASE
  const BACKEND_URL = API_ENDPOINTS.LEARNING_MODULES;

  useEffect(() => {
    // Animate on mount
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

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoadingLessons(true);
        const res = await axios.get(BACKEND_URL);
        setAllLessons(res.data); // Array of lessons from DB
      } catch (err) {
        console.log(err);
        Alert.alert("Error", "Failed to load learning modules.");
      } finally {
        setLoadingLessons(false);
      }
    };

    fetchModules();
  }, []);

  // 🚀 2. LOAD COMPLETED MODULES FROM LOCAL STORAGE
  useEffect(() => {
    const loadCompletedModules = async () => {
      try {
        const data = await AsyncStorage.getItem("completedLessons");
        const completed = data ? JSON.parse(data) : [];
        setCompletedLessons(completed);

        // Update user stats
        setUserStats(prev => ({
          ...prev,
          completed: completed.length,
        }));
      } catch (error) {
        console.error("Error loading completed lessons:", error);
      }
    };
    loadCompletedModules();
  }, []);

  // 🚀 3. CALCULATE PROGRESS
  useEffect(() => {
    if (allLessons.length === 0) return;

    const percent = (completedLessons.length / allLessons.length) * 100;
    setProgressPercentage(Math.min(percent.toFixed(1), 100));

    // Calculate total points
    const totalPoints = completedLessons.reduce((sum, lessonId) => {
      const lesson = allLessons.find(l => l.id === lessonId);
      return sum + (lesson?.points || 0);
    }, 0);

    setUserStats(prev => ({
      ...prev,
      totalPoints,
      completed: completedLessons.length,
    }));
  }, [allLessons, completedLessons]);

  // Learning Categories
  const categories = [
    { id: 'all', name: 'All', icon: '🌍', color: '#667eea' },
    { id: 'climate', name: 'Climate', icon: '🌡', color: '#ff6b6b' },
    { id: 'biodiversity', name: 'Biodiversity', icon: '🦋', color: '#4ecdc4' },
    { id: 'pollution', name: 'Pollution', icon: '🏭', color: '#ff9ff3' },
    { id: 'conservation', name: 'Conservation', icon: '♻', color: '#feca57' },
  ];

  // Filter and search lessons
  const filteredLessons = useMemo(() => {
    let filtered = activeCategory === 'all'
      ? allLessons
      : allLessons.filter(lesson => lesson.category === activeCategory);

    if (searchQuery) {
      filtered = filtered.filter(lesson =>
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lesson.subtitle && lesson.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (lesson.description && lesson.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered;
  }, [activeCategory, searchQuery, allLessons]);

  // Calculate progress for each lesson
  const getLessonProgress = useCallback((lessonId) => {
    return completedLessons.includes(lessonId) ? 100 : 0;
  }, [completedLessons]);

  // 🚀 4. GO TO MODULE
  const handleModulePress = (lesson) => {
    // Check if lesson has video (youtubeId) - open modal
    if (lesson.youtubeId) {
      openLesson(lesson);
    } else {
      // Legacy navigation for lessons without video
      navigation.navigate("LearningScreen", {
        moduleDetails: lesson,
        onComplete: async () => {
          const updated = [...new Set([...completedLessons, lesson.id])];
          setCompletedLessons(updated);
          await AsyncStorage.setItem(
            "completedLessons",
            JSON.stringify(updated)
          );
        },
      });
    }
  };

  // 🚀 5. CONTINUE BUTTON
  const handleContinue = () => {
    const nextModule = allLessons.find((lesson) => !completedLessons.includes(lesson.id));

    if (nextModule) {
      handleModulePress(nextModule);
    } else {
      Alert.alert("🎉 Congratulations!", "All modules completed!");
    }
  };

  // Handle video state change
  const handleVideoStateChange = useCallback((state) => {
    if (state === 'ended') {
      setIsVideoPlaying(false);
      setVideoLoading(false);
      handleVideoComplete();
    } else if (state === 'playing') {
      setVideoLoading(false);
    } else if (state === 'buffering') {
      setVideoLoading(true);
    }
  }, []);

  // Handle video completion
  const handleVideoComplete = useCallback(() => {
    if (selectedLesson && selectedLesson.quiz && selectedLesson.quiz.length > 0) {
      setShowQuiz(true);
    } else {
      // If no quiz, mark as complete
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

  // Handle lesson completion (with quiz)
  const handleLessonComplete = useCallback(async () => {
    const passingScore = Math.ceil(selectedLesson.quiz.length * 0.6);

    if (quizScore >= passingScore) {
      if (!completedLessons.includes(selectedLesson.id)) {
        const updated = [...new Set([...completedLessons, selectedLesson.id])];
        setCompletedLessons(updated);
        await AsyncStorage.setItem("completedLessons", JSON.stringify(updated));

        setUserStats(prev => ({
          ...prev,
          completed: prev.completed + 1,
          inProgress: prev.inProgress > 0 ? prev.inProgress - 1 : 0,
          totalPoints: prev.totalPoints + selectedLesson.points,
          streak: prev.streak + 1
        }));
      }
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
  }, [selectedLesson, quizScore, completedLessons]);

  // Handle lesson completion (no quiz)
  const handleLessonCompleteNoQuiz = useCallback(async () => {
    if (!completedLessons.includes(selectedLesson.id)) {
      const updated = [...new Set([...completedLessons, selectedLesson.id])];
      setCompletedLessons(updated);
      await AsyncStorage.setItem("completedLessons", JSON.stringify(updated));

      setUserStats(prev => ({
        ...prev,
        completed: prev.completed + 1,
        totalPoints: prev.totalPoints + selectedLesson.points,
      }));
    }
    Alert.alert(
      '🎉 Lesson Complete!',
      `You earned ${selectedLesson.points} points!`,
      [{ text: 'OK', onPress: closeLesson }]
    );
  }, [selectedLesson, completedLessons]);

  // Reset quiz
  const resetQuiz = useCallback(() => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setQuizScore(0);
    setShowResults(false);
    setShowQuiz(false);
  }, []);

  // Close lesson
  const closeLesson = useCallback(() => {
    setSelectedLesson(null);
    setShowQuiz(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setQuizScore(0);
    setShowResults(false);
    setIsVideoPlaying(false);
    setVideoLoading(false);
  }, []);

  // Open lesson
  const openLesson = useCallback((lesson) => {
    setSelectedLesson(lesson);
    if (!completedLessons.includes(lesson.id)) {
      setUserStats(prev => ({
        ...prev,
        inProgress: prev.inProgress + (getLessonProgress(lesson.id) === 0 ? 1 : 0)
      }));
    }
  }, [completedLessons, getLessonProgress]);

  // Get active category color
  const getActiveCategoryColor = () => {
    const category = categories.find(cat => cat.id === activeCategory);
    return category ? category.color : '#667eea';
  };

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search lessons..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor="#999"
      />
      <TouchableOpacity
        style={styles.searchClose}
        onPress={() => {
          setShowSearch(false);
          setSearchQuery('');
        }}
      >
        <Text style={styles.searchCloseText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLessonCard = (lesson, index) => {
    const progress = getLessonProgress(lesson.id);
    const isCompleted = completedLessons.includes(lesson.id);
    const category = categories.find(cat => cat.id === lesson.category);
    const lessonColor = lesson.color || '#667eea';

    return (
      <Animated.View
        key={lesson.id}
        style={[
          styles.lessonCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        <TouchableOpacity onPress={() => handleModulePress(lesson)} activeOpacity={0.9}>
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
                  <Text style={styles.playIcon}>▶</Text>
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
                  <Text style={styles.completedBadgeText}>✓</Text>
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
                <Text style={styles.metaIcon}>⏱</Text>
                <Text style={styles.metaText}>{lesson.duration}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>🪙</Text>
                <Text style={styles.metaText}>{lesson.points} Points</Text>
              </View>
            </View>

            {lesson.difficulty && (
              <View style={styles.difficultyContainer}>
                <View style={[
                  styles.difficultyBadge,
                  { backgroundColor: lesson.difficulty === 'Beginner' ? '#E8F5E9' : '#FFF3E0' }
                ]}>
                  <Text style={[
                    styles.difficultyText,
                    { color: lesson.difficulty === 'Beginner' ? '#4CAF50' : '#FF9800' }
                  ]}>
                    {lesson.difficulty}
                  </Text>
                </View>
              </View>
            )}

            {isCompleted ? (
              <View style={styles.completedButton}>
                <Text style={styles.completedButtonText}>✓ Completed</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.startButton}
                onPress={() => handleModulePress(lesson)}
              >
                <Text style={styles.startButtonText}>
                  {progress > 0 ? 'Continue Learning →' : 'Start Learning →'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // 🚀 SHOW LOADER WHILE FETCHING FROM DATABASE
  if (loadingLessons) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3a9322" />
        <Text style={styles.loadingText}>Loading learning modules...</Text>
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
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Learning Module</Text>

        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => setShowSearch(!showSearch)}
        >
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      {showSearch && renderSearchBar()}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Progress Card */}
        <Animated.View
          style={[
            styles.progressCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
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
            </View>
            <View style={styles.progressRight}>
              <Text style={styles.treeEmoji}>🌳</Text>
              <Text style={styles.pointsText}>+{userStats.totalPoints} pts</Text>
            </View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            onPress={handleContinue}
            style={styles.continueButton}
          >
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
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={[
                  styles.categoryText,
                  activeCategory === category.id && styles.categoryTextActive
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
            <Text style={styles.sectionTitle}>📚 Available Lessons</Text>
            <Text style={styles.lessonCount}>{filteredLessons.length} lessons</Text>
          </View>

          {filteredLessons.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🔍</Text>
              <Text style={styles.emptyStateTitle}>No lessons found</Text>
              <Text style={styles.emptyStateText}>
                Try adjusting your search or filter criteria
              </Text>
            </View>
          ) : (
            filteredLessons.map((lesson, index) =>
              renderLessonCard(lesson, index)
            )
          )}
        </View>

        {/* Achievement Banner */}
        <Animated.View
          style={[
            styles.achievementBanner,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <View style={styles.achievementContent}>
            <View style={styles.achievementLeft}>
              <Text style={styles.achievementIcon}>🏆</Text>
            </View>
            <View style={styles.achievementRight}>
              <Text style={styles.achievementTitle}>Unlock Achievements!</Text>
              <Text style={styles.achievementText}>
                Complete 5 lessons to earn the "Eco Warrior" badge
              </Text>
            </View>
          </View>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Lesson Modal */}
      <Modal
        visible={selectedLesson !== null}
        animationType="slide"
        onRequestClose={closeLesson}
      >
        {selectedLesson && (
          <View style={styles.modalContainer}>
            <View style={[styles.modalHeader, { backgroundColor: getActiveCategoryColor() }]}>
              <TouchableOpacity onPress={closeLesson} style={styles.closeButton}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle} numberOfLines={2}>
                {selectedLesson.title}
              </Text>
              <View style={{ width: 40 }} />
            </View>

            {!showQuiz ? (
              <ScrollView style={styles.modalContent}>
                {selectedLesson.youtubeId ? (
                  <>
                    <View style={styles.videoContainer}>
                      {videoLoading && (
                        <View style={styles.videoLoader}>
                          <ActivityIndicator size="large" color="#3a9322" />
                          <Text style={styles.loadingText}>Loading video...</Text>
                        </View>
                      )}
                      <YoutubePlayer
                        height={300}
                        play={isVideoPlaying}
                        videoId={selectedLesson.youtubeId}
                        onChangeState={handleVideoStateChange}
                        onError={(error) => {
                          console.log('YouTube player error:', error);
                          setVideoLoading(false);
                          Alert.alert('Error', 'Failed to load video. Please check your connection.');
                        }}
                      />
                    </View>

                    <View style={styles.lessonInfo}>
                      <Text style={styles.lessonInfoTitle}>About this lesson</Text>
                      <Text style={styles.lessonInfoText}>
                        {selectedLesson.description || 'Watch the video to learn more about this topic.'}
                      </Text>

                      <View style={styles.lessonInfoMeta}>
                        <View style={styles.infoMetaItem}>
                          <Text style={styles.infoMetaLabel}>Duration:</Text>
                          <Text style={styles.infoMetaValue}>{selectedLesson.duration}</Text>
                        </View>
                        {selectedLesson.difficulty && (
                          <View style={styles.infoMetaItem}>
                            <Text style={styles.infoMetaLabel}>Difficulty:</Text>
                            <Text style={styles.infoMetaValue}>{selectedLesson.difficulty}</Text>
                          </View>
                        )}
                        <View style={styles.infoMetaItem}>
                          <Text style={styles.infoMetaLabel}>Points:</Text>
                          <Text style={styles.infoMetaValue}>{selectedLesson.points}</Text>
                        </View>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.completeVideoButton}
                      onPress={handleVideoComplete}
                    >
                      <Text style={styles.completeVideoButtonText}>
                        {selectedLesson.quiz && selectedLesson.quiz.length > 0
                          ? "I've Watched the Video - Take Quiz →"
                          : "Complete Lesson →"}
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={styles.noVideoContainer}>
                    <Text style={styles.noVideoText}>
                      No video available for this lesson. Please check back later.
                    </Text>
                    <TouchableOpacity
                      style={styles.completeVideoButton}
                      onPress={closeLesson}
                    >
                      <Text style={styles.completeVideoButtonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            ) : !showResults ? (
              <View style={styles.quizContainer}>
                <View style={styles.quizProgress}>
                  <Text style={styles.quizProgressText}>
                    Question {currentQuestionIndex + 1} of {selectedLesson.quiz.length}
                  </Text>
                  <View style={styles.quizProgressBar}>
                    <View
                      style={[
                        styles.quizProgressFill,
                        { width: `${((currentQuestionIndex + 1) / selectedLesson.quiz.length) * 100}%` }
                      ]}
                    />
                  </View>
                </View>

                <Text style={styles.quizQuestion}>
                  {selectedLesson.quiz[currentQuestionIndex].question}
                </Text>

                <ScrollView
                  style={styles.answersScroll}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.answersContainer}>
                    {selectedLesson.quiz[currentQuestionIndex].options.map((option, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.answerOption,
                          selectedAnswer === index && styles.answerOptionSelected
                        ]}
                        onPress={() => handleAnswerSelect(index)}
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
                  onPress={handleNextQuestion}
                  disabled={selectedAnswer === null}
                >
                  <Text style={styles.nextButtonText}>
                    {currentQuestionIndex < selectedLesson.quiz.length - 1 ? 'Next Question →' : 'Submit Quiz'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.resultsContainer}>
                <Text style={styles.resultsIcon}>
                  {quizScore >= Math.ceil(selectedLesson.quiz.length * 0.6) ? '🎉' : '📚'}
                </Text>
                <Text style={styles.resultsTitle}>Quiz Completed!</Text>
                <Text style={styles.resultsScore}>
                  You scored {quizScore} out of {selectedLesson.quiz.length}
                </Text>
                <Text style={styles.resultsPercentage}>
                  {Math.round((quizScore / selectedLesson.quiz.length) * 100)}%
                </Text>

                {quizScore >= Math.ceil(selectedLesson.quiz.length * 0.6) ? (
                  <View style={styles.passedContainer}>
                    <Text style={styles.passedText}>✓ Passed!</Text>
                    <Text style={styles.pointsEarned}>+{selectedLesson.points} points earned</Text>
                  </View>
                ) : (
                  <View style={styles.failedContainer}>
                    <Text style={styles.failedText}>Keep Learning!</Text>
                    <Text style={styles.failedSubtext}>
                      You need {Math.ceil(selectedLesson.quiz.length * 0.6)} correct answers to pass
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.finishButton}
                  onPress={handleLessonComplete}
                >
                  <Text style={styles.finishButtonText}>
                    {quizScore >= Math.ceil(selectedLesson.quiz.length * 0.6) ? 'Continue Learning' : 'Try Again'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </Modal>
    </View>
  );
}

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
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#3a9322',
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
  searchButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIcon: {
    fontSize: 22,
    color: '#fff',
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
  searchCloseText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
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
  progressRight: {
    marginLeft: 15,
    alignItems: 'center',
  },
  treeEmoji: {
    fontSize: 40,
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
  categoryIcon: {
    fontSize: 18,
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
  playIcon: {
    fontSize: 50,
    color: '#fff',
    marginBottom: 10,
  },
  videoText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  completedBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
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
  metaIcon: {
    fontSize: 14,
  },
  metaText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  difficultyContainer: {
    marginBottom: 15,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 11,
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
  emptyStateIcon: {
    fontSize: 50,
    marginBottom: 15,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  achievementBanner: {
    marginHorizontal: 20,
    marginTop: 25,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    backgroundColor: '#ff9a9e',
  },
  achievementContent: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementLeft: {
    marginRight: 15,
  },
  achievementIcon: {
    fontSize: 40,
  },
  achievementRight: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  achievementText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    paddingTop: 50,
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
  closeIcon: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
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
    position: 'relative',
  },
  videoLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  noVideoContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noVideoText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
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
  resultsIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 10,
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
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});