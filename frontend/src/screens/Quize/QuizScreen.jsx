// QuizScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  Alert,
  Dimensions,
  BackHandler,
  Easing
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const QuizScreen = ({ route, navigation }) => {
  const { level } = route.params || {};
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);

  // Define questions first
  const questions = [
    {
      id: 1,
      question: "What is the primary cause of global warming?",
      options: [
        "Solar radiation",
        "Greenhouse gas emissions",
        "Ocean currents",
        "Volcanic activity"
      ],
      correctAnswer: 1,
      explanation: "Greenhouse gases like CO2 trap heat in the atmosphere, causing global temperatures to rise significantly. Human activities, especially burning fossil fuels, have increased greenhouse gas concentrations dramatically.",
      points: 10,
      category: "Climate Change"
    },
    {
      id: 2,
      question: "Which of these is a renewable energy source?",
      options: [
        "Coal",
        "Natural Gas",
        "Solar Power",
        "Nuclear Fission"
      ],
      correctAnswer: 2,
      explanation: "Solar power is renewable as it comes from the sun, unlike fossil fuels which are finite resources. Renewable energy sources can be replenished naturally and have lower environmental impact.",
      points: 15,
      category: "Energy"
    },
    {
      id: 3,
      question: "What percentage of Earth's water is freshwater?",
      options: [
        "10%",
        "25%",
        "3%",
        "50%"
      ],
      correctAnswer: 2,
      explanation: "Only about 3% of Earth's water is freshwater, and most of it is trapped in glaciers and ice caps. Less than 1% is readily available for human use.",
      points: 12,
      category: "Water Resources"
    }
  ];

  // Now initialize refs after questions are defined
  const progress = useRef(new Animated.Value(0)).current;
  const timerAnim = useRef(new Animated.Value(1)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const optionAnims = useRef(questions[0].options.map(() => new Animated.Value(0))).current;
  const timerRef = useRef();

  useEffect(() => {
    console.log('QuizScreen mounted with level:', level);
    startAnimations();
    startTimer();

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => {
      backHandler.remove();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    updateProgress();
    if (selectedAnswer !== null) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    }
  }, [currentQuestion, selectedAnswer]);

  useEffect(() => {
    if (timeLeft > 0 && selectedAnswer === null) {
      timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && selectedAnswer === null) {
      handleTimeUp();
    }
  }, [timeLeft, selectedAnswer]);

  const startAnimations = () => {
    Animated.parallel([
      Animated.spring(cardAnim, {
        toValue: 1,
        tension: 60,
        friction: 7,
        useNativeDriver: true,
      }),
      ...optionAnims.map((anim, index) =>
        Animated.spring(anim, {
          toValue: 1,
          delay: index * 100,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        })
      )
    ]).start();
  };

  const startTimer = () => {
    setTimeLeft(15);
    timerAnim.setValue(1);
    Animated.timing(timerAnim, {
      toValue: 0,
      duration: 15000,
      useNativeDriver: false,
      easing: Easing.linear,
    }).start();
  };

  const updateProgress = () => {
    Animated.timing(progress, {
      toValue: (currentQuestion + 1) / questions.length,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  const handleBackPress = () => {
    Alert.alert(
      "Leave Quiz?",
      "Your progress will be lost if you leave the quiz.",
      [
        { text: "Stay", style: "cancel" },
        { 
          text: "Leave", 
          style: "destructive",
          onPress: () => navigation.goBack()
        }
      ]
    );
    return true;
  };

  const handleTimeUp = () => {
    setSelectedAnswer(-1);
    setIsAnswerSubmitted(true);
    setShowExplanation(true);
    
    setTimeout(() => {
      goToNextQuestion();
    }, 3000);
  };

  const handleAnswerSelect = (answerIndex) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    setIsAnswerSubmitted(true);
    
    const isCorrect = answerIndex === questions[currentQuestion].correctAnswer;
    if (isCorrect) {
      setScore(score + questions[currentQuestion].points);
    }

    setQuestionsAnswered(prev => prev + 1);
    setShowExplanation(true);

    setTimeout(() => {
      goToNextQuestion();
    }, 3000);
  };

  const goToNextQuestion = () => {
    setShowExplanation(false);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(15);
      timerAnim.setValue(1);
      resetAnimations();
    } else {
      completeQuiz();
    }
  };

  const resetAnimations = () => {
    cardAnim.setValue(0);
    optionAnims.forEach(anim => anim.setValue(0));
    startAnimations();
  };

  const completeQuiz = () => {
    const correctAnswers = questionsAnswered;
    const totalQuestions = questions.length;
    const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
    const pointsEarned = score;

    Alert.alert(
      "🎉 Quiz Completed!",
      `You scored ${correctAnswers}/${totalQuestions} (${accuracy}% accuracy)\n\nPoints earned: ${pointsEarned}`,
      [
        {
          text: "Play Again",
          onPress: () => resetQuiz(),
        },
        {
          text: "Level Selection",
          onPress: () => navigation.goBack(),
        }
      ]
    );
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setTimeLeft(15);
    setQuestionsAnswered(0);
    setIsAnswerSubmitted(false);
    progress.setValue(0);
    timerAnim.setValue(1);
    resetAnimations();
  };

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const timerWidth = timerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const cardScale = cardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  const getOptionStyle = (index) => {
    if (selectedAnswer === null) return styles.optionButton;
    
    if (index === questions[currentQuestion].correctAnswer) {
      return [styles.optionButton, styles.correctOption];
    }
    
    if (index === selectedAnswer && index !== questions[currentQuestion].correctAnswer) {
      return [styles.optionButton, styles.wrongOption];
    }
    
    if (selectedAnswer === -1 && index === questions[currentQuestion].correctAnswer) {
      return [styles.optionButton, styles.correctOption];
    }
    
    return [styles.optionButton, styles.neutralOption];
  };

  const getTimerColor = () => {
    if (timeLeft > 10) return '#4CAF50';
    if (timeLeft > 5) return '#FF9800';
    return '#f44336';
  };

  // Add safety check for current question
  if (!questions[currentQuestion]) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={level?.color || ['#1E3A8A', '#3B82F6']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <Icon name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.levelName}>{level?.title || 'Quiz'}</Text>
          <Text style={styles.questionCount}>
            {currentQuestion + 1}/{questions.length}
          </Text>
        </View>
        
        <View style={styles.scoreContainer}>
          <Icon name="trophy" size={20} color="#FFD700" />
          <Text style={styles.score}>{score}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Animated.View 
          style={[
            styles.progressBar,
            { width: progressWidth }
          ]} 
        />
      </View>

      {/* Timer */}
      <View style={styles.timerContainer}>
        <View style={styles.timerBackground}>
          <Animated.View 
            style={[
              styles.timerFill,
              { 
                width: timerWidth,
                backgroundColor: getTimerColor()
              }
            ]} 
          />
        </View>
        <Text style={styles.timerText}>{timeLeft}s</Text>
      </View>

      {/* Question Card */}
      <Animated.View 
        style={[
          styles.questionCard,
          {
            transform: [{ scale: cardScale }],
            opacity: cardAnim
          }
        ]}
      >
        <View style={styles.questionHeader}>
          <Text style={styles.questionCategory}>
            {questions[currentQuestion].category}
          </Text>
          <Text style={styles.questionPoints}>
            {questions[currentQuestion].points} pts
          </Text>
        </View>
        <Text style={styles.questionText}>
          {questions[currentQuestion].question}
        </Text>
      </Animated.View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {questions[currentQuestion].options.map((option, index) => {
          const optionAnim = optionAnims[index];
          const translateY = optionAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0],
          });
          const opacity = optionAnim;

          return (
            <Animated.View
              key={index}
              style={[
                { transform: [{ translateY }], opacity }
              ]}
            >
              <TouchableOpacity
                style={getOptionStyle(index)}
                onPress={() => handleAnswerSelect(index)}
                disabled={selectedAnswer !== null}
              >
                <View style={styles.optionContent}>
                  <View style={styles.optionIndicator}>
                    <Text style={styles.optionLetter}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>
                  <Text style={[
                    styles.optionText,
                    selectedAnswer !== null && index === questions[currentQuestion].correctAnswer && styles.correctText,
                    selectedAnswer !== null && selectedAnswer === index && index !== questions[currentQuestion].correctAnswer && styles.wrongText,
                    selectedAnswer === -1 && index === questions[currentQuestion].correctAnswer && styles.correctText
                  ]}>
                    {option}
                  </Text>
                </View>
                
                {selectedAnswer !== null && 
                  index === questions[currentQuestion].correctAnswer && (
                  <Icon name="checkmark-circle" size={24} color="#4CAF50" />
                )}
                {selectedAnswer !== null && 
                  selectedAnswer === index && 
                  index !== questions[currentQuestion].correctAnswer && (
                  <Icon name="close-circle" size={24} color="#f44336" />
                )}
                {selectedAnswer === -1 && 
                  index === questions[currentQuestion].correctAnswer && (
                  <Icon name="time" size={24} color="#4CAF50" />
                )}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      {/* Explanation */}
      {showExplanation && (
        <Animated.View 
          style={[
            styles.explanationContainer,
            {
              transform: [{
                translateY: showExplanation ? 0 : 100
              }]
            }
          ]}
        >
          <Text style={styles.explanationTitle}>
            {selectedAnswer === questions[currentQuestion].correctAnswer ? 
              "✅ Correct!" : selectedAnswer === -1 ? "⏰ Time's Up!" : "❌ Incorrect"}
          </Text>
          <Text style={styles.explanationText}>
            {questions[currentQuestion].explanation}
          </Text>
          <View style={styles.pointsEarned}>
            <Text style={styles.pointsText}>
              {selectedAnswer === questions[currentQuestion].correctAnswer 
                ? `+${questions[currentQuestion].points} points`
                : selectedAnswer === -1
                ? "+0 points (Time's Up)"
                : "+0 points"
              }
            </Text>
          </View>
        </Animated.View>
      )}

      {/* Next Question Indicator */}
      {isAnswerSubmitted && (
        <View style={styles.nextIndicator}>
          <Text style={styles.nextIndicatorText}>
            Next question in 2...
          </Text>
        </View>
      )}
    </LinearGradient>
  );
};

// Keep the same styles as before...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  levelName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  questionCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    marginTop: 2,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  score: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 6,
  },
  progressContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 20,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 15,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  timerBackground: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 12,
  },
  timerFill: {
    height: '100%',
    borderRadius: 3,
  },
  timerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    minWidth: 30,
    textAlign: 'center',
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
    minHeight: 140,
    justifyContent: 'center',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  questionPoints: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF6B35',
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    color: '#1a1a1a',
    lineHeight: 28,
  },
  optionsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionLetter: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3B82F6',
  },
  correctOption: {
    backgroundColor: '#F0F9FF',
    borderColor: '#10B981',
    borderWidth: 2,
  },
  wrongOption: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
    borderWidth: 2,
  },
  neutralOption: {
    opacity: 0.6,
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
    fontWeight: '500',
  },
  correctText: {
    color: '#047857',
    fontWeight: '600',
  },
  wrongText: {
    color: '#DC2626',
    fontWeight: '600',
  },
  explanationContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  explanationTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1a1a1a',
  },
  explanationText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 12,
  },
  pointsEarned: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#047857',
  },
  nextIndicator: {
    alignItems: 'center',
    padding: 16,
  },
  nextIndicatorText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default QuizScreen;