import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  Animated
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// --- CONFIGURATION ---
const QUESTIONS_PER_CATEGORY = 2;

// SDG Goals mapping
const SDG_GOALS = {
  2: { number: 2, title: "Zero Hunger", color: "#DDA63A" },
  3: { number: 3, title: "Good Health", color: "#4C9F38" },
  4: { number: 4, title: "Quality Education", color: "#C5192D" },
  6: { number: 6, title: "Clean Water", color: "#26BDE2" },
  7: { number: 7, title: "Affordable Energy", color: "#FCC30B" },
  8: { number: 8, title: "Decent Work", color: "#A21942" },
  9: { number: 9, title: "Innovation", color: "#FD6925" },
  11: { number: 11, title: "Sustainable Cities", color: "#F05E22" },
  12: { number: 12, title: "Responsible Consumption", color: "#C09F2D" },
  13: { number: 13, title: "Climate Action", color: "#48773E" },
  14: { number: 14, title: "Life Below Water", color: "#0A97D9" },
  15: { number: 15, title: "Life on Land", color: "#56C02B" }
};

// CATEGORIES structure
const CATEGORIES = {
  SCHOOL: {
    TRANSPORT: { 
      label: "Transport", 
      color: "#3B82F6", 
      icon: "car", 
      sdgs: [11, 13] 
    },
    FOOD: { 
      label: "Food & Diet", 
      color: "#10B981", 
      icon: "food-apple", 
      sdgs: [2, 12, 3] 
    },
    ENERGY: { 
      label: "Energy", 
      color: "#F59E0B", 
      icon: "flash", 
      sdgs: [7, 12] 
    },
    WASTE: { 
      label: "Waste Management", 
      color: "#8B5CF6", 
      icon: "recycle", 
      sdgs: [12, 14] 
    },
  },
  COLLEGE: {
    TRANSPORT: { 
      label: "Transport", 
      color: "#3B82F6", 
      icon: "car", 
      sdgs: [11, 13] 
    },
    FOOD: { 
      label: "Food & Diet", 
      color: "#10B981", 
      icon: "food-apple", 
      sdgs: [2, 12, 13] 
    },
    HOUSING: { 
      label: "Housing", 
      color: "#EF4444", 
      icon: "home", 
      sdgs: [7, 13] 
    },
    CONSUMPTION: { 
      label: "Consumption", 
      color: "#8B5CF6", 
      icon: "shopping", 
      sdgs: [4, 9, 12] 
    },
  },
  WORKPLACE: {
    COMMUTE: { 
      label: "Commute", 
      color: "#3B82F6", 
      icon: "car", 
      sdgs: [8, 11, 13] 
    },
    OFFICE: { 
      label: "Office", 
      color: "#10B981", 
      icon: "desk-lamp", 
      sdgs: [7, 12] 
    },
  },
  HOME: {
    ENERGY: { 
      label: "Energy", 
      color: "#F59E0B", 
      icon: "flash", 
      sdgs: [7, 13] 
    },
  }
};

const QUESTION_POOL = {
  SCHOOL: {
    TRANSPORT: [
      { 
        id: 'st1', 
        text: "How do you get to school usually?", 
        sdgs: [11, 13],
        options: [
          { text: "Walk or Cycle", val: 100, tip: "Perfect! Zero pollution." },
          { text: "School Bus", val: 80, tip: "Great shared transport choice." },
          { text: "Carpool", val: 60, tip: "Better than driving alone." },
          { text: "Parent drives me alone", val: 20, tip: "Try carpooling with a neighbor!" }
        ]
      },
      { 
        id: 'st2', 
        text: "Your school is 10 minutes away. It's a sunny day.", 
        sdgs: [3, 11, 13],
        options: [
          { text: "I walk/bike!", val: 100, tip: "Healthy for you and the planet." },
          { text: "I still get a ride.", val: 20, tip: "Try walking for short trips." }
        ]
      },
      { 
        id: 'st3', 
        text: "What do you do if your school is organizing a field trip?", 
        sdgs: [9, 11],
        options: [
          { text: "Suggest a local destination", val: 90, tip: "Supporting local communities reduces travel emissions." },
          { text: "Join whatever trip is planned", val: 50, tip: "Good participation but consider suggesting eco-friendly options." },
          { text: "Ask for virtual field trip options", val: 80, tip: "Innovative and zero-carbon solution!" }
        ]
      }
    ],
    FOOD: [
      { 
        id: 'sf1', 
        text: "What's in your lunchbox?", 
        sdgs: [12, 2],
        options: [
          { text: "Reusable containers", val: 100, tip: "Zero waste lunch hero!" },
          { text: "Some plastic baggies", val: 50, tip: "Try washing and reusing bags." },
          { text: "Pre-packaged snacks/wrappers", val: 20, tip: "Wrappers stay in landfills forever." }
        ]
      },
      { 
        id: 'sf2', 
        text: "How often do you bring homemade lunch vs. buying?", 
        sdgs: [12, 3],
        options: [
          { text: "Always homemade", val: 100, tip: "Great for health and reducing packaging waste!" },
          { text: "Mostly homemade", val: 80, tip: "Good habit - keep it up!" },
          { text: "50/50", val: 50, tip: "Try to increase homemade meals for better nutrition." },
          { text: "Mostly buy at school", val: 30, tip: "Consider packing lunch to save money and reduce waste." }
        ]
      },
      { 
        id: 'sf3', 
        text: "Do you eat the vegetables served at school?", 
        sdgs: [2, 3],
        options: [
          { text: "Yes, all of them", val: 100, tip: "Excellent! Reducing food waste and getting nutrients." },
          { text: "Some of them", val: 70, tip: "Good effort - try to increase variety." },
          { text: "No, I don't like veggies", val: 30, tip: "Try different preparations - you might find ones you like!" }
        ]
      }
    ],
    ENERGY: [
      { 
        id: 'se1', 
        text: "When you leave the classroom, what do you do with lights and devices?", 
        sdgs: [7, 12],
        options: [
          { text: "Turn everything off", val: 100, tip: "Energy conservation champion!" },
          { text: "Turn off lights but leave devices", val: 60, tip: "Good start - remember devices use energy too." },
          { text: "Leave everything on", val: 10, tip: "Turning things off saves energy and money." }
        ]
      },
      { 
        id: 'se2', 
        text: "How do you feel about solar panels on your school roof?", 
        sdgs: [7, 13],
        options: [
          { text: "Already have them - love it!", val: 100, tip: "Your school is a sustainability leader!" },
          { text: "Would support getting them", val: 80, tip: "Great idea - suggest it to school leadership." },
          { text: "Not sure what they are", val: 30, tip: "Learn about renewable energy - it's our future!" }
        ]
      }
    ],
    WASTE: [
      { 
        id: 'sw1', 
        text: "You finish a juice box. Where does it go?", 
        sdgs: [12, 14],
        options: [
          { text: "Recycling bin", val: 100, tip: "Perfect sorting!" },
          { text: "Compost bin", val: 40, tip: "Juice boxes usually can't be composted - check labels." },
          { text: "Trash can", val: 20, tip: "Try to identify recyclable materials." },
          { text: "Take home to wash and recycle", val: 90, tip: "Extra effort for the planet - well done!" }
        ]
      },
      { 
        id: 'sw2', 
        text: "Your notebook is half-used at year's end. What do you do?", 
        sdgs: [12, 4],
        options: [
          { text: "Use it next year", val: 100, tip: "Resourceful and sustainable!" },
          { text: "Recycle it and get new", val: 60, tip: "Recycling is good, but reusing is better." },
          { text: "Throw it away", val: 10, tip: "Paper comes from trees - try to use every page." }
        ]
      }
    ]
  },
  COLLEGE: {
    TRANSPORT: [
      { 
        id: 'ct1', 
        text: "How do you typically commute to campus?", 
        sdgs: [11, 13],
        options: [
          { text: "Walk/bike/scooter", val: 100, tip: "Zero emission commute - perfect!" },
          { text: "Public transit", val: 85, tip: "Great shared mobility choice." },
          { text: "Carpool with classmates", val: 70, tip: "Good reduction in individual car use." },
          { text: "Drive alone", val: 25, tip: "Consider alternatives to reduce your carbon footprint." },
          { text: "Electric vehicle", val: 90, tip: "Cleaner than gas, but walking/biking is even better!" }
        ]
      },
      { 
        id: 'ct2', 
        text: "You're planning a spring break trip. How do you choose?", 
        sdgs: [12, 13],
        options: [
          { text: "Local eco-tourism", val: 100, tip: "Supporting local economy with minimal travel impact." },
          { text: "Train/bus to nearby city", val: 80, tip: "Lower carbon than flying." },
          { text: "International flight", val: 30, tip: "Air travel has high emissions - consider offsetting." },
          { text: "Staycation or local volunteering", val: 95, tip: "Minimal footprint with meaningful experience." }
        ]
      }
    ],
    FOOD: [
      { 
        id: 'cf1', 
        text: "How often do you eat plant-based meals?", 
        sdgs: [2, 12, 13],
        options: [
          { text: "Vegan/always plant-based", val: 100, tip: "Lowest food carbon footprint!" },
          { text: "Vegetarian or mostly plant-based", val: 85, tip: "Great for health and planet." },
          { text: "Meat with some plant meals", val: 60, tip: "Good balance - try 'Meatless Mondays'." },
          { text: "Meat with every meal", val: 30, tip: "Animal agriculture has high environmental impact." }
        ]
      },
      { 
        id: 'cf2', 
        text: "You're at the campus café. What do you get?", 
        sdgs: [12, 14],
        options: [
          { text: "Water in my reusable bottle", val: 100, tip: "Perfect - saves money and plastic!" },
          { text: "Coffee in reusable mug", val: 90, tip: "Great habit - some shops even give discounts." },
          { text: "Drink in disposable cup", val: 40, tip: "Bring your own cup next time." },
          { text: "Bottled drink", val: 20, tip: "Single-use plastic harms oceans." }
        ]
      }
    ],
    HOUSING: [
      { 
        id: 'ch1', 
        text: "What's your dorm/apartment heating/cooling habit?", 
        sdgs: [7, 13],
        options: [
          { text: "Use minimally, dress appropriately", val: 100, tip: "Energy conservation expert!" },
          { text: "Moderate use with programmable thermostat", val: 75, tip: "Smart energy management." },
          { text: "Keep it running constantly", val: 30, tip: "Try adjusting when you're out or sleeping." },
          { text: "Open windows instead of AC", val: 90, tip: "Natural ventilation saves energy." }
        ]
      },
      { 
        id: 'ch2', 
        text: "How do you do laundry?", 
        sdgs: [6, 12],
        options: [
          { text: "Full loads, cold water, air dry", val: 100, tip: "Maximum efficiency!" },
          { text: "Full loads but use dryer", val: 70, tip: "Good on load size, try air drying sometimes." },
          { text: "Small loads as needed", val: 40, tip: "Wait for full loads to save water and energy." },
          { text: "Hot water and frequent washes", val: 20, tip: "90% of laundry energy heats water - use cold!" }
        ]
      }
    ],
    CONSUMPTION: [
      { 
        id: 'cc1', 
        text: "Need a textbook. What's your approach?", 
        sdgs: [4, 12],
        options: [
          { text: "Library or share with classmates", val: 100, tip: "Zero waste and cost-effective!" },
          { text: "Buy used/rent digital", val: 85, tip: "Great circular economy choice." },
          { text: "Buy new then resell", val: 60, tip: "Better than keeping, but consider used first." },
          { text: "Buy new and keep", val: 30, tip: "Textbooks have high resource footprint." }
        ]
      },
      { 
        id: 'cc2', 
        text: "Your phone is 2 years old and slowing down.", 
        sdgs: [9, 12],
        options: [
          { text: "Repair or factory reset", val: 100, tip: "Extending product life is most sustainable." },
          { text: "Buy refurbished", val: 80, tip: "Good second choice - reduces e-waste." },
          { text: "Buy new but recycle old", val: 50, tip: "Recycling helps but manufacturing new has big impact." },
          { text: "Buy new, keep old in drawer", val: 20, tip: "E-waste contains valuable, recoverable materials." }
        ]
      }
    ]
  },
  WORKPLACE: {
    COMMUTE: [
      { 
        id: 'wc1', 
        text: "What's your primary commute mode?", 
        sdgs: [8, 11, 13],
        options: [
          { text: "Remote work", val: 100, tip: "Zero commute emissions!" },
          { text: "Public transit", val: 85, tip: "Efficient use of infrastructure." },
          { text: "Bike/walk", val: 95, tip: "Healthy and sustainable." },
          { text: "Electric vehicle", val: 70, tip: "Cleaner transport choice." },
          { text: "Gas car alone", val: 25, tip: "Highest carbon footprint - consider alternatives." },
          { text: "Carpool", val: 60, tip: "Better than driving alone." }
        ]
      }
    ],
    OFFICE: [
      { 
        id: 'wo1', 
        text: "Last to leave the office. Do you...", 
        sdgs: [7, 12],
        options: [
          { text: "Turn off all lights and equipment", val: 100, tip: "Office energy hero!" },
          { text: "Turn off some things", val: 60, tip: "Good start - aim for 100% next time." },
          { text: "Leave for cleaning staff", val: 30, tip: "They might not know what can be turned off." },
          { text: "Everything stays on 24/7", val: 10, tip: "Nighttime energy waste is significant." }
        ]
      }
    ]
  },
  HOME: {
    ENERGY: [
      { 
        id: 'he1', 
        text: "What's your home energy source?", 
        sdgs: [7, 13],
        options: [
          { text: "100% renewable (solar/wind)", val: 100, tip: "Climate leader!" },
          { text: "Green energy plan from utility", val: 90, tip: "Supporting renewable energy growth." },
          { text: "Mixed sources", val: 50, tip: "Consider switching to green energy." },
          { text: "Fossil fuels only", val: 20, tip: "Time to explore cleaner options." }
        ]
      }
    ]
  }
};

const shuffleAndSlice = (array, n) => {
  if (!array || array.length === 0) return [];
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  const max = Math.min(n, shuffled.length);
  return shuffled.slice(0, max);
};

// SDG Badge Component
const SDGBadge = ({ sdgNumber }) => {
  const sdg = SDG_GOALS[sdgNumber];
  if (!sdg) return null;
  
  return (
    <View style={[styles.sdgBadge, { backgroundColor: sdg.color }]}>
      <Text style={styles.sdgNumber}>SDG {sdg.number}</Text>
      <Text style={styles.sdgTitle}>{sdg.title}</Text>
    </View>
  );
};

const NatureQuiz = () => {
  const [userType, setUserType] = useState(null);
  const [view, setView] = useState('landing');
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [progressAnim] = useState(new Animated.Value(0));

  const startQuiz = (type) => {
    setUserType(type);
    const pool = QUESTION_POOL[type];
    const userCategories = CATEGORIES[type];
    
    if (!pool || !userCategories) {
      console.error(`No questions found for type: ${type}`);
      return;
    }
    
    let selected = [];
    Object.keys(userCategories).forEach(catKey => {
      const catQuestions = pool[catKey];
      if (catQuestions && catQuestions.length > 0) {
        const subset = shuffleAndSlice(catQuestions, QUESTIONS_PER_CATEGORY);
        const tagged = subset.map(q => ({ 
          ...q, 
          category: catKey,
          categoryData: userCategories[catKey]
        }));
        selected = [...selected, ...tagged];
      }
    });

    setQuizQuestions(shuffleAndSlice(selected, selected.length));
    setAnswers({});
    setCurrentQIndex(0);
    setView('quiz');
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false
    }).start();
  };

  const handleAnswer = (option) => {
    const currentQ = quizQuestions[currentQIndex];
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: { 
        val: option.val, 
        tip: option.tip,
        category: currentQ.category 
      }
    }));

    if (currentQIndex < quizQuestions.length - 1) {
      setTimeout(() => {
        setCurrentQIndex(prev => prev + 1);
        Animated.timing(progressAnim, {
          toValue: (currentQIndex + 1) / quizQuestions.length,
          duration: 250,
          useNativeDriver: false
        }).start();
      }, 250);
    } else {
      setTimeout(() => setView('results'), 500);
    }
  };

  const calculateResults = useMemo(() => {
    if (view !== 'results') return { finalPercent: 0, breakdown: {} };

    let totalScore = 0;
    let totalMax = 0;
    const breakdown = {};

    const userCategories = CATEGORIES[userType];
    if (userCategories) {
      Object.keys(userCategories).forEach(k => breakdown[k] = { score: 0, max: 0 });
    }

    quizQuestions.forEach(q => {
      const ans = answers[q.id];
      if (ans) {
        totalScore += ans.val;
        totalMax += 100;
        if (breakdown[ans.category]) {
          breakdown[ans.category].score += ans.val;
          breakdown[ans.category].max += 100;
        }
      }
    });

    const finalPercent = totalMax === 0 ? 0 : Math.round((totalScore / totalMax) * 100);
    
    return { finalPercent, breakdown };
  }, [view, answers, quizQuestions, userType]);

  // Landing View
  if (view === 'landing') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>
              Green<Text style={styles.titleHighlight}>Score</Text> Calculator
            </Text>
            <Text style={styles.subtitle}>
              Select your level to calculate your personal sustainability score.
            </Text>
          </View>

          <View style={styles.cardsContainer}>
            {/* School Card */}
            <TouchableOpacity 
              style={[styles.typeCard, { borderBottomColor: '#10B981' }]}
              onPress={() => startQuiz('SCHOOL')}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#D1FAE5' }]}>
                <Icon name="school" size={32} color="#059669" />
              </View>
              <Text style={styles.cardTitle}>School Student</Text>
              <Text style={styles.cardDescription}>
                For students in K-12. Questions about school transport, lunch, energy and waste habits.
              </Text>
              <View style={styles.startButton}>
                <Text style={[styles.startButtonText, { color: '#059669' }]}>
                  Start Quiz
                </Text>
                <Icon name="arrow-right" size={20} color="#059669" />
              </View>
            </TouchableOpacity>

            {/* College Card */}
            <TouchableOpacity 
              style={[styles.typeCard, { borderBottomColor: '#3B82F6' }]}
              onPress={() => startQuiz('COLLEGE')}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#DBEAFE' }]}>
                <Icon name="book-education" size={32} color="#2563EB" />
              </View>
              <Text style={styles.cardTitle}>College Student</Text>
              <Text style={styles.cardDescription}>
                For university students. Questions about campus life, housing, food and consumption.
              </Text>
              <View style={styles.startButton}>
                <Text style={[styles.startButtonText, { color: '#2563EB' }]}>
                  Start Quiz
                </Text>
                <Icon name="arrow-right" size={20} color="#2563EB" />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Quiz View
  if (view === 'quiz' && quizQuestions[currentQIndex]) {
    const q = quizQuestions[currentQIndex];
    const category = q.categoryData;
    const progressWidth = progressAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%']
    });

    // Create hex color with opacity for background
    const backgroundColorWithOpacity = `${category.color}20`;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.quizContainer}>
          {/* Header */}
          <View style={styles.quizHeader}>
            <Text style={styles.questionCount}>
              Question {currentQIndex + 1} of {quizQuestions.length}
            </Text>
            <View style={[styles.categoryBadge, { backgroundColor: backgroundColorWithOpacity }]}>
              <Icon name={category.icon} size={16} color={category.color} />
              <Text style={[styles.categoryText, { color: category.color }]}>
                {category.label}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill, 
                { 
                  width: progressWidth,
                  backgroundColor: category.color 
                }
              ]} 
            />
          </View>

          {/* Question Card */}
          <View style={styles.questionCard}>
            <Text style={styles.questionText}>{q.text}</Text>
            
            {/* SDG Tags */}
            {q.sdgs && q.sdgs.length > 0 && (
              <View style={styles.sdgContainer}>
                <Text style={styles.sdgLabel}>Related SDG Goals:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sdgScroll}>
                  {q.sdgs.map((sdgNum) => (
                    <View key={sdgNum} style={styles.sdgTag}>
                      <Text style={styles.sdgTagNumber}>SDG {sdgNum}</Text>
                      <Text style={styles.sdgTagTitle}>
                        {SDG_GOALS[sdgNum]?.title || `Goal ${sdgNum}`}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Options */}
            <View style={styles.optionsContainer}>
              {q.options.map((opt, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.optionButton}
                  onPress={() => handleAnswer(opt)}
                >
                  <Text style={styles.optionText}>{opt.text}</Text>
                  <Icon name="chevron-right" size={20} color="#6B7280" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Results View
  if (view === 'results') {
    const { finalPercent, breakdown } = calculateResults;
    const userCategories = CATEGORIES[userType] || {};
    
    let title = "Eco-Learner";
    let msg = "You're starting your journey. Small changes make a big impact!";
    let color = "#F97316";
    if (finalPercent >= 80) {
      title = "Sustainability Hero";
      msg = "Wow! You are living a very sustainable life. Lead the way!";
      color = "#10B981";
    } else if (finalPercent >= 50) {
      title = "Conscious Citizen";
      msg = "You make good choices, but there is still room to grow.";
      color = "#3B82F6";
    }

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.resultsContainer}>
          {/* Score Card */}
          <View style={styles.scoreCard}>
            <Icon 
              name={finalPercent >= 80 ? "trophy" : "leaf"} 
              size={48} 
              color={color} 
            />
            <Text style={styles.scoreLabel}>Your Green Score</Text>
            <Text style={[styles.scoreValue, { color }]}>{finalPercent}</Text>
            <Text style={styles.scoreTitle}>{title}</Text>
            <Text style={styles.scoreMessage}>{msg}</Text>
          </View>

          {/* Breakdown */}
          {Object.keys(userCategories).length > 0 && (
            <View style={styles.breakdownCard}>
              <View style={styles.breakdownHeader}>
                <Icon name="chart-bar" size={20} color="#374151" />
                <Text style={styles.breakdownTitle}>Breakdown</Text>
              </View>
              {Object.keys(userCategories).map(catKey => {
                const data = breakdown[catKey] || { score: 0, max: 0 };
                const meta = userCategories[catKey];
                const pct = data.max === 0 ? 0 : Math.round((data.score / data.max) * 100);
                const widthPercent = `${pct}%`;
                
                return (
                  <View key={catKey} style={styles.categoryRow}>
                    <View style={styles.categoryInfo}>
                      <Icon name={meta.icon} size={16} color={meta.color} />
                      <Text style={styles.categoryName}>{meta.label}</Text>
                    </View>
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBackground}>
                        <View 
                          style={[
                            styles.progressForeground, 
                            { 
                              width: widthPercent,
                              backgroundColor: meta.color 
                            }
                          ]} 
                        />
                      </View>
                      <Text style={styles.percentage}>{pct}%</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Restart Button */}
          <TouchableOpacity 
            style={styles.restartButton}
            onPress={() => setView('landing')}
          >
            <Icon name="refresh" size={20} color="#FFFFFF" />
            <Text style={styles.restartText}>New Calculation</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  titleHighlight: {
    color: '#10B981',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  cardsContainer: {
    gap: 20,
  },
  typeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderBottomWidth: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 22,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  startButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  quizContainer: {
    flex: 1,
    padding: 16,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    marginBottom: 32,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  questionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 24,
    lineHeight: 32,
  },
  sdgContainer: {
    marginBottom: 24,
  },
  sdgLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
  },
  sdgScroll: {
    flexDirection: 'row',
  },
  sdgTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
    minWidth: 100,
  },
  sdgTagNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  sdgTagTitle: {
    fontSize: 10,
    color: '#1E40AF',
    marginTop: 2,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F3F4F6',
    borderRadius: 16,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  resultsContainer: {
    padding: 16,
    gap: 20,
  },
  scoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderTopWidth: 8,
    borderTopColor: '#1F2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 72,
    fontWeight: '900',
    marginBottom: 16,
  },
  scoreTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  scoreMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  breakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  categoryRow: {
    marginBottom: 16,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressForeground: {
    height: '100%',
    borderRadius: 4,
  },
  percentage: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
    minWidth: 35,
  },
  restartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 16,
  },
  restartText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sdgBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  sdgNumber: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sdgTitle: {
    fontSize: 8,
    color: '#FFFFFF',
    marginTop: 2,
  },
});

export default NatureQuiz;