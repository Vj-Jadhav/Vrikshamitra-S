import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, TextInput, Alert } from 'react-native';
import Svg, { Path } from "react-native-svg";
import YoutubePlayer from "react-native-youtube-iframe";

export default function LearningModuleScreen({ navigation }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [userStats, setUserStats] = useState({
    completed: 0,
    inProgress: 0,
    totalPoints: 0
  });
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Learning Categories
  const categories = [
    { id: 'all', name: 'All', icon: '🌍' },
    { id: 'climate', name: 'Climate', icon: '🌡️' },
    { id: 'biodiversity', name: 'Biodiversity', icon: '🦋' },
    { id: 'pollution', name: 'Pollution', icon: '🏭' },
    { id: 'conservation', name: 'Conservation', icon: '♻️' },
  ];

  // Dynamic Learning Content with YouTube Videos
  const allLessons = [
    {
      id: 1,
      title: 'Climate Change & Global Warming',
      subtitle: 'Understanding Our Planet\'s Crisis',
      category: 'climate',
      duration: '25 min',
      points: 50,
      color: '#FF6B6B',
      difficulty: 'Intermediate',
      totalLessons: 8,
      youtubeId: 'G9t__9Tmwv4', // Climate Change 101
      quiz: [
        {
          question: 'What is the primary greenhouse gas contributing to climate change?',
          options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen'],
          correctAnswer: 1
        },
        {
          question: 'What is the Paris Agreement?',
          options: [
            'A trade agreement',
            'An international climate treaty',
            'A peace treaty',
            'A cultural exchange program'
          ],
          correctAnswer: 1
        },
        {
          question: 'Which sector contributes most to greenhouse gas emissions?',
          options: ['Transportation', 'Agriculture', 'Energy Production', 'Waste'],
          correctAnswer: 2
        }
      ]
    },
    {
      id: 2,
      title: 'Biodiversity & Ecosystems',
      subtitle: 'Life\'s Amazing Variety',
      category: 'biodiversity',
      duration: '20 min',
      points: 45,
      color: '#4ECDC4',
      difficulty: 'Beginner',
      totalLessons: 6,
      youtubeId: 'GK_vRtHJZu4', // What is Biodiversity?
      quiz: [
        {
          question: 'What does biodiversity refer to?',
          options: [
            'Only plant species',
            'Variety of life in all forms',
            'Only animal species',
            'Only marine life'
          ],
          correctAnswer: 1
        },
        {
          question: 'Which biome has the highest biodiversity?',
          options: ['Desert', 'Tundra', 'Tropical Rainforest', 'Grassland'],
          correctAnswer: 2
        },
        {
          question: 'What is a keystone species?',
          options: [
            'The most abundant species',
            'A species that has a disproportionate effect on its ecosystem',
            'The largest species',
            'An extinct species'
          ],
          correctAnswer: 1
        }
      ]
    },
    {
      id: 3,
      title: 'Ocean Conservation',
      subtitle: 'Protecting Our Blue Planet',
      category: 'conservation',
      duration: '18 min',
      points: 40,
      color: '#4A90E2',
      difficulty: 'Beginner',
      totalLessons: 5,
      youtubeId: 'bHO-z-1xJDY', // Ocean Conservation
      quiz: [
        {
          question: 'What percentage of Earth\'s oxygen comes from the ocean?',
          options: ['10%', '30%', '50%', '70%'],
          correctAnswer: 2
        },
        {
          question: 'What is coral bleaching?',
          options: [
            'Natural coral cleaning',
            'Coral losing symbiotic algae due to stress',
            'Coral growing process',
            'Coral reproduction'
          ],
          correctAnswer: 1
        },
        {
          question: 'What is the main cause of ocean acidification?',
          options: [
            'Plastic pollution',
            'Oil spills',
            'CO2 absorption',
            'Overfishing'
          ],
          correctAnswer: 2
        }
      ]
    },
    {
      id: 4,
      title: 'Plastic Pollution Crisis',
      subtitle: 'Understanding Plastic Impact',
      category: 'pollution',
      duration: '15 min',
      points: 35,
      color: '#FF6B9D',
      difficulty: 'Beginner',
      totalLessons: 4,
      youtubeId: '6jkN50X9gZc', // Plastic Pollution
      quiz: [
        {
          question: 'How long does plastic take to decompose?',
          options: ['10 years', '50 years', '100 years', '450+ years'],
          correctAnswer: 3
        },
        {
          question: 'What is microplastic?',
          options: [
            'Very small plastic particles less than 5mm',
            'Biodegradable plastic',
            'Recycled plastic',
            'Plant-based plastic'
          ],
          correctAnswer: 0
        },
        {
          question: 'Which country produces the most plastic waste?',
          options: ['India', 'China', 'United States', 'Japan'],
          correctAnswer: 2
        }
      ]
    },
    {
      id: 5,
      title: 'Renewable Energy Sources',
      subtitle: 'Power for a Sustainable Future',
      category: 'climate',
      duration: '22 min',
      points: 50,
      color: '#FFD93D',
      difficulty: 'Intermediate',
      totalLessons: 7,
      youtubeId: 'Giek094C_l4', // Renewable Energy
      quiz: [
        {
          question: 'Which is NOT a renewable energy source?',
          options: ['Solar', 'Wind', 'Natural Gas', 'Hydroelectric'],
          correctAnswer: 2
        },
        {
          question: 'What does solar panel convert into electricity?',
          options: ['Heat', 'Light', 'Wind', 'Water'],
          correctAnswer: 1
        },
        {
          question: 'Which country leads in renewable energy production?',
          options: ['USA', 'China', 'Germany', 'Brazil'],
          correctAnswer: 1
        }
      ]
    },
    {
      id: 6,
      title: 'Deforestation & Its Impact',
      subtitle: 'Forests: Earth\'s Lungs in Danger',
      category: 'biodiversity',
      duration: '20 min',
      points: 45,
      color: '#95E1D3',
      difficulty: 'Intermediate',
      totalLessons: 6,
      youtubeId: '-01T9e6VDWU', // Deforestation
      quiz: [
        {
          question: 'What percentage of Earth\'s land was originally covered by forests?',
          options: ['20%', '30%', '50%', '70%'],
          correctAnswer: 2
        },
        {
          question: 'What is the leading cause of deforestation?',
          options: ['Wildfires', 'Agriculture', 'Urbanization', 'Logging'],
          correctAnswer: 1
        },
        {
          question: 'How many species lose their habitat daily due to deforestation?',
          options: ['10', '50', '100', '137'],
          correctAnswer: 3
        }
      ]
    }
  ];

  // Filter lessons based on category
  const filteredLessons = activeCategory === 'all' 
    ? allLessons 
    : allLessons.filter(lesson => lesson.category === activeCategory);

  // Calculate progress for each lesson
  const getLessonProgress = (lessonId) => {
    if (completedLessons.includes(lessonId)) return 100;
    return 0;
  };

  // Handle video state change
  const handleVideoStateChange = (state) => {
    if (state === 'ended') {
      setIsVideoPlaying(false);
      // Auto-show quiz when video ends
      handleVideoComplete();
    }
  };

  // Handle video completion
  const handleVideoComplete = () => {
    setShowQuiz(true);
  };

  // Handle quiz answer selection
  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  // Handle next question
  const handleNextQuestion = () => {
    if (selectedAnswer === null) {
      Alert.alert('Please select an answer', 'You must select an answer before continuing.');
      return;
    }

    const currentQuestion = selectedLesson.quiz[currentQuestionIndex];
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setQuizScore(quizScore + 1);
    }

    if (currentQuestionIndex < selectedLesson.quiz.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      setShowResults(true);
    }
  };

  // Handle lesson completion
  const handleLessonComplete = () => {
    const passingScore = Math.ceil(selectedLesson.quiz.length * 0.6); // 60% to pass
    
    if (quizScore >= passingScore) {
      // Mark lesson as completed
      if (!completedLessons.includes(selectedLesson.id)) {
        setCompletedLessons([...completedLessons, selectedLesson.id]);
        setUserStats({
          completed: userStats.completed + 1,
          inProgress: userStats.inProgress > 0 ? userStats.inProgress - 1 : 0,
          totalPoints: userStats.totalPoints + selectedLesson.points
        });
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
  };

  // Reset quiz
  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setQuizScore(0);
    setShowResults(false);
    setShowQuiz(false);
  };

  // Close lesson
  const closeLesson = () => {
    setSelectedLesson(null);
    setShowQuiz(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setQuizScore(0);
    setShowResults(false);
    setIsVideoPlaying(false);
  };

  // Open lesson
  const openLesson = (lesson) => {
    setSelectedLesson(lesson);
    if (!completedLessons.includes(lesson.id)) {
      // Mark as in progress
      const inProgressLessons = allLessons.filter(l => 
        !completedLessons.includes(l.id) && getLessonProgress(l.id) > 0
      ).length;
      if (inProgressLessons === 0) {
        setUserStats({
          ...userStats,
          inProgress: userStats.inProgress + 1
        });
      }
    }
  };

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

        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* User Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressLeft}>
            <Text style={styles.progressTitle}>Your Learning Journey</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userStats.completed}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userStats.inProgress}</Text>
                <Text style={styles.statLabel}>In Progress</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userStats.totalPoints}</Text>
                <Text style={styles.statLabel}>Points</Text>
              </View>
            </View>
          </View>
          <View style={styles.progressRight}>
            <Text style={styles.treeEmoji}>🌳</Text>
          </View>
        </View>

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
                  activeCategory === category.id && styles.categoryChipActive
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

        {/* Featured Lessons */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📚 Available Lessons</Text>
            <Text style={styles.lessonCount}>{filteredLessons.length} lessons</Text>
          </View>

          {filteredLessons.map((lesson) => {
            const progress = getLessonProgress(lesson.id);
            const isCompleted = completedLessons.includes(lesson.id);

            return (
              <TouchableOpacity 
                key={lesson.id} 
                style={styles.lessonCard}
                onPress={() => openLesson(lesson)}
              >
                <View style={[styles.lessonThumbnail, { backgroundColor: lesson.color }]}>
                  <View style={styles.videoPlaceholder}>
                    <Text style={styles.playIcon}>▶️</Text>
                    <Text style={styles.videoText}>Watch Video</Text>
                  </View>
                  <View style={styles.lessonOverlay}>
                    <Text style={styles.lessonIconLarge}>{lesson.icon}</Text>
                  </View>
                  {isCompleted && (
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedBadgeText}>✓ Completed</Text>
                    </View>
                  )}
                </View>

                <View style={styles.lessonContent}>
                  <View style={styles.lessonHeader}>
                    <Text style={styles.lessonTitle}>{lesson.title}</Text>
                    <View style={styles.difficultyBadge}>
                      <Text style={styles.difficultyText}>{lesson.difficulty}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.lessonSubtitle}>{lesson.subtitle}</Text>

                  <View style={styles.lessonMeta}>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaIcon}>⏱️</Text>
                      <Text style={styles.metaText}>{lesson.duration}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaIcon}>📖</Text>
                      <Text style={styles.metaText}>{lesson.totalLessons} Lessons</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaIcon}>🪙</Text>
                      <Text style={styles.metaText}>{lesson.points} pts</Text>
                    </View>
                  </View>

                  {isCompleted ? (
                    <View style={styles.completedButton}>
                      <Text style={styles.completedButtonText}>✓ Completed</Text>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      style={styles.startButton}
                      onPress={() => openLesson(lesson)}
                    >
                      <Text style={styles.startButtonText}>
                        {progress > 0 ? 'Continue Learning →' : 'Start Learning →'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Achievement Banner */}
        <View style={styles.achievementBanner}>
          <View style={styles.achievementLeft}>
            <Text style={styles.achievementIcon}>🏆</Text>
          </View>
          <View style={styles.achievementRight}>
            <Text style={styles.achievementTitle}>Unlock Achievements!</Text>
            <Text style={styles.achievementText}>
              Complete lessons to earn badges and climb the leaderboard
            </Text>
          </View>
        </View>

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
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={closeLesson} style={styles.closeButton}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{selectedLesson.title}</Text>
              <View style={{ width: 40 }} />
            </View>

            {!showQuiz ? (
              <ScrollView style={styles.modalContent}>
                <View style={styles.videoContainer}>
                  <YoutubePlayer
                    height={300}
                    play={isVideoPlaying}
                    videoId={selectedLesson.youtubeId}
                    onChangeState={handleVideoStateChange}
                    onError={(error) => console.log('YouTube player error:', error)}
                  />
                </View>

                <View style={styles.lessonInfo}>
                  <Text style={styles.lessonInfoTitle}>About this lesson</Text>
                  <Text style={styles.lessonInfoText}>{selectedLesson.subtitle}</Text>
                  
                  <View style={styles.lessonInfoMeta}>
                    <View style={styles.infoMetaItem}>
                      <Text style={styles.infoMetaLabel}>Duration:</Text>
                      <Text style={styles.infoMetaValue}>{selectedLesson.duration}</Text>
                    </View>
                    <View style={styles.infoMetaItem}>
                      <Text style={styles.infoMetaLabel}>Difficulty:</Text>
                      <Text style={styles.infoMetaValue}>{selectedLesson.difficulty}</Text>
                    </View>
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
                    I've Watched the Video - Take Quiz →
                  </Text>
                </TouchableOpacity>
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

                <TouchableOpacity 
                  style={styles.nextButton}
                  onPress={handleNextQuestion}
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
                  <Text style={styles.finishButtonText}>Finish</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </Modal>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation?.navigate?.("Home")}
        >
          <Svg width={26} height={26} viewBox="0 0 512 512">
            <Path
              fill="#000"
              d="M277.8 8.6c-12.3-11.4-31.3-11.4-43.5 0l-224 208c-9.6 9-12.8 22.9-8 35.1S18.8 272 32 272h16v176c0 35.3 28.7 64 64 64h288c35.3 0 64-28.7 64-64V272h16c13.2 0 25-8.1 29.8-20.3s1.6-26.2-8-35.1zM240 320h32c26.5 0 48 21.5 48 48v96H192v-96c0-26.5 21.5-48 48-48"
            />
          </Svg>
          <Text style={styles.navTextInactive}>Home</Text>
        </TouchableOpacity>
      
        <TouchableOpacity style={styles.navItem}>
          <Svg width={26} height={26} viewBox="0 0 512 512">
            <Path
              fill="#000"
              d="M478 217.9c-13.8-32.4-43.4-53.9-79.3-57.5c-39.1-4-78.5-6.1-117.7-6.1s-78.6 2-117.7 6.1c-35.9 3.7-65.5 25.2-79.3 57.5C63.1 254.7 64 296 80.8 332.5c16 35.2 48.1 59.4 84.9 63.8c2.2.3 4.4.5 6.6.5c12.8 0 24.8-5.9 32.7-15.8l18.9-24c6-7.6 15-12 24.5-12s18.6 4.4 24.5 12l18.9 24c7.9 9.9 19.9 15.8 32.7 15.8c2.2 0 4.4-.2 6.6-.5c36.8-4.4 68.9-28.6 84.9-63.8c16.8-36.5 17.7-77.8 2-114.6zM192 288h-32v32h-32v-32H96v-32h32v-32h32v32h32v32zm160 48c-17.7 0-32-14.3-32-32s14.3-32 32-32s32 14.3 32 32s-14.3 32-32 32zm48-64c-17.7 0-32-14.3-32-32s14.3-32 32-32s32 14.3 32 32s-14.3 32-32 32z"
            />
          </Svg>
          <Text style={styles.navTextInactive}>Games</Text>
        </TouchableOpacity>
      
        <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
          <Svg width={26} height={26} viewBox="0 0 512 512">
            <Path
              fill="#3a9322ff"
              d="M96 64c-17.7 0-32 14.3-32 32v320c0 17.7 14.3 32 32 32h320c17.7 0 32-14.3 32-32V96c0-17.7-14.3-32-32-32H96zm112 96l160 112l-160 112V160z"
            />
          </Svg>
          <Text style={styles.navTextInactive}>Learn</Text>
        </TouchableOpacity>
      
        <TouchableOpacity style={styles.navItem}>
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
  searchButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIcon: {
    fontSize: 22,
  },
  progressCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  progressLeft: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
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
    color: '#0d7a5f',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#ddd',
  },
  progressRight: {
    marginLeft: 15,
  },
  treeEmoji: {
    fontSize: 60,
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
    backgroundColor: '#0d7a5f',
    borderColor: '#0d7a5f',
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
    color: '#fff',
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
  playIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  videoText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  lessonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  lessonIconLarge: {
    fontSize: 60,
  },
  completedBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  completedBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  lessonContent: {
    padding: 20,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    marginRight: 10,
  },
  difficultyBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '600',
  },
  lessonSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
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
  achievementBanner: {
    marginHorizontal: 20,
    marginTop: 25,
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  achievementLeft: {
    marginRight: 15,
  },
  achievementIcon: {
    fontSize: 50,
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
    backgroundColor: '#3a9322ff',
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
  },
  modalContent: {
    flex: 1,
  },
  videoContainer: {
    backgroundColor: '#000',
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
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: { 
    flex: 1, 
    alignItems: 'center', 
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  navItemActive: {
    backgroundColor: '#adffacff',
    borderRadius: 25,
    marginHorizontal: 5,
  },
  navTextInactive: { 
    fontSize: 11, 
    color: '#666',
    marginTop: 4,
  },
});