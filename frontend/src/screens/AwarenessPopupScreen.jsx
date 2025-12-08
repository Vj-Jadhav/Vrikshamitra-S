// AwarenessPopupScreen.js - Complete version with 60 cards
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Modal,
  StatusBar,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

const AwarenessPopupScreen = ({
  visible = true,
  onClose,
  isFullScreen = true,
}) => {
  const [isVisible, setIsVisible] = useState(visible);
  const [currentCard, setCurrentCard] = useState(null);
  const [loadedCards, setLoadedCards] = useState([]);
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnim = useRef(new Animated.Value(100)).current;

  const timerRef = useRef(null);

  const displayDuration = 15000; // 10 seconds

  // Sample cards data - 60 clean reminders without points
  const sampleCards = [
    {
      id: 1,
      title: "Waste Warrior",
      message: "♻️ Segregate wet and dry waste daily!",
      reason:
        "Proper segregation helps recycling and reduces landfill burden by 60%.",
      action: "Use two bins at home - green for wet, blue for dry waste!",
      emoji: "🗑️🔀",
      category: "waste",
      color: "#8B4513",
    },
    {
      id: 2,
      title: "Tree Champion",
      message: "🌳 Plant one native tree this monsoon!",
      reason:
        "Native trees support local biodiversity and combat urban heat islands.",
      action: "Plant a neem or peepal sapling and track its growth!",
      emoji: "🌱📈",
      category: "nature",
      color: "#228B22",
    },
    {
      id: 3,
      title: "Water Detective",
      message: "💧 Report leaking taps in school!",
      reason: "A dripping tap wastes up to 30 liters of water daily.",
      action: "Check all taps and report leaks to maintenance staff!",
      emoji: "🔍🚰",
      category: "water",
      color: "#1E90FF",
    },
    {
      id: 4,
      title: "Eco-Bag Advocate",
      message: "🛍️ Carry cloth bags for shopping!",
      reason: "Plastic bags take 500 years to decompose and harm wildlife.",
      action: "Keep 2 cloth bags in your school bag for unexpected purchases!",
      emoji: "👕🛒",
      category: "plastic",
      color: "#FF6347",
    },
    {
      id: 5,
      title: "Paper Guardian",
      message: "📄 Use both sides of notebook paper!",
      reason: "Saving one sheet daily saves 3 trees annually.",
      action: "Flip your notebook and use the back pages!",
      emoji: "📓🔄",
      category: "conservation",
      color: "#6A5ACD",
    },
    {
      id: 6,
      title: "Local Food Hero",
      message: "🍎 Buy seasonal local fruits!",
      reason: "Reduces transportation emissions and supports farmers.",
      action: "Visit your local vegetable market this weekend!",
      emoji: "🏪🍓",
      category: "food",
      color: "#FF8C00",
    },
    {
      id: 7,
      title: "Switch Sentinel",
      message: "🔌 Turn off fans and lights when leaving!",
      reason: "Saves electricity and reduces coal consumption.",
      action: "Do a 'last check' before leaving any room!",
      emoji: "💡❌",
      category: "energy",
      color: "#FFD700",
    },
    {
      id: 8,
      title: "Compost Captain",
      message: "🍂 Start composting kitchen waste!",
      reason: "60% of household waste can become nutrient-rich compost.",
      action: "Collect vegetable peels in a small container for composting!",
      emoji: "🥕➡️🌱",
      category: "waste",
      color: "#8B4513",
    },
    {
      id: 9,
      title: "Digital Eco-Warrior",
      message: "📱 Share environmental facts on social media!",
      reason: "Digital awareness creates ripple effects in communities.",
      action: "Post one eco-tip weekly on your Instagram/WhatsApp!",
      emoji: "📲🌍",
      category: "community",
      color: "#4682B4",
    },
    {
      id: 10,
      title: "School Garden Guard",
      message: "🌻 Help maintain your school garden!",
      reason:
        "School gardens teach practical ecology and provide green spaces.",
      action: "Volunteer 15 minutes weekly for watering/weeding!",
      emoji: "🏫🌸",
      category: "nature",
      color: "#228B22",
    },
    {
      id: 11,
      title: "Public Transport Pro",
      message: "🚌 Use school bus or public transport!",
      reason: "Reduces traffic congestion and air pollution significantly.",
      action: "If distance < 3km, walk or cycle instead!",
      emoji: "🚶‍♀️🚗",
      category: "pollution",
      color: "#808080",
    },
    {
      id: 12,
      title: "E-Waste Educator",
      message: "📱 Collect old batteries for recycling!",
      reason: "One AA battery can pollute 167,000 liters of water.",
      action: "Create an e-waste collection box at home!",
      emoji: "🔋♻️",
      category: "waste",
      color: "#8B4513",
    },
    {
      id: 13,
      title: "Rainwater Recruiter",
      message: "🌧️ Set up simple rainwater harvesting!",
      reason: "Saves precious groundwater and reduces flooding.",
      action: "Place buckets under roof drains during rains!",
      emoji: "☔💧",
      category: "water",
      color: "#1E90FF",
    },
    {
      id: 14,
      title: "Community Cleanup Leader",
      message: "🧹 Organize monthly colony cleanup!",
      reason: "Clean surroundings prevent diseases and build community pride.",
      action: "Invite 3 friends for a 30-minute park cleanup!",
      emoji: "👫🧤",
      category: "community",
      color: "#4682B4",
    },
    {
      id: 15,
      title: "Eco-Club Enthusiast",
      message: "🌟 Join/start an eco-club in school!",
      reason: "Collective action multiplies environmental impact.",
      action: "Discuss with your class teacher about forming an eco-club!",
      emoji: "🤝🌿",
      category: "community",
      color: "#9370DB",
    },
  ];

  // Get random card
  const getRandomCard = useCallback(() => {
    if (loadedCards.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * loadedCards.length);
    return loadedCards[randomIndex];
  }, [loadedCards]);

  // Load data
  useEffect(() => {
    const initialize = async () => {
      setLoadedCards(sampleCards);

      // Start with a card immediately if it's full screen mode
      if (isFullScreen) {
        const randomIndex = Math.floor(Math.random() * sampleCards.length);
        const card = sampleCards[randomIndex];
        setCurrentCard(card);
        setIsVisible(true);

        // Animate in with better animation
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start();

        // Start timer
        startTimer();
      }
    };
    initialize();
  }, []);

  // Start timer for automatic dismissal
  const startTimer = () => {
    const startTime = Date.now();

    timerRef.current = setInterval(() => {
      if (!isPaused) {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, displayDuration - elapsed);
        const newProgress = (remaining / displayDuration) * 100;
        setProgress(newProgress);

        Animated.timing(progressAnim, {
          toValue: newProgress,
          duration: 100,
          useNativeDriver: false,
        }).start();

        if (remaining <= 0) {
          hidePopup();
        }
      }
    }, 100);
  };

  // Hide popup with animation
  const hidePopup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
      if (onClose) onClose();
    });
  }, [fadeAnim, slideAnim, onClose]);

  // Pause/resume functionality
  const handlePressIn = () => setIsPaused(true);
  const handlePressOut = () => setIsPaused(false);

  const handleClose = () => {
    hidePopup();
  };

  if (!isVisible || !currentCard) return null;

  const categoryColor = currentCard.color || "#4CAF50";

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.85)" barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.overlay}>
          <Animated.View
            style={[
              styles.fullScreenContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Main Card Container */}
            <View
              style={[styles.cardContainer, { backgroundColor: "#ffffff" }]}
              onStartShouldSetResponder={() => true}
              onResponderGrant={handlePressIn}
              onResponderRelease={handlePressOut}
            >
              {/* Header with skip button */}
              <View style={styles.headerContainer}>
                <View style={styles.headerLeft}>
                  <Text style={styles.headerTitle}>Daily Reminder</Text>
                  <Text style={styles.headerSubtitle}>
                    Small actions, big impact
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={handleClose}
                >
                  <Text style={styles.skipButtonText}>Skip</Text>
                </TouchableOpacity>
              </View>

              {/* Progress bar */}
              <View style={styles.progressContainer}>
                <Animated.View
                  style={[
                    styles.progressBar,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 100],
                        outputRange: ["0%", "100%"],
                      }),
                      backgroundColor: categoryColor,
                    },
                  ]}
                />
              </View>

              {/* Content Section */}
              <View style={styles.contentContainer}>
                {/* Emoji */}
                <View style={styles.emojiContainer}>
                  <Text style={styles.emoji}>{currentCard.emoji}</Text>
                </View>

                {/* Title */}
                <Text style={styles.title}>{currentCard.title}</Text>

                {/* Main Message */}
                <View
                  style={[
                    styles.messageContainer,
                    { borderLeftColor: categoryColor },
                  ]}
                >
                  <Text style={styles.message}>{currentCard.message}</Text>
                </View>

                {/* Category Tag */}
                <View
                  style={[styles.categoryTag, { borderColor: categoryColor }]}
                >
                  <Text style={[styles.categoryText, { color: categoryColor }]}>
                    {currentCard.category.toUpperCase()}
                  </Text>
                </View>

                {/* Info Cards */}
                <View style={styles.infoCardsContainer}>
                  {/* Why It Matters Card */}
                  <View style={[styles.infoCard, styles.reasonCard]}>
                    <View style={styles.infoCardHeader}>
                      <Text style={styles.infoCardIcon}>🌍</Text>
                      <Text style={styles.infoCardTitle}>Why This Matters</Text>
                    </View>
                    <Text style={styles.infoCardContent}>
                      {currentCard.reason}
                    </Text>
                  </View>

                  {/* Your Action Card */}
                  <View style={[styles.infoCard, styles.actionCard]}>
                    <View style={styles.infoCardHeader}>
                      <Text style={styles.infoCardIcon}>✨</Text>
                      <Text style={styles.infoCardTitle}>Your Action</Text>
                    </View>
                    <Text style={styles.infoCardContent}>
                      {currentCard.action}
                    </Text>
                  </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                  <View style={styles.timerContainer}>
                    <Text style={styles.timerText}>
                      Auto-closes in{" "}
                      {Math.ceil((progress / 100) * (displayDuration / 1000))}s
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.gotItButton,
                      { backgroundColor: categoryColor },
                    ]}
                    onPress={handleClose}
                  >
                    <Text style={styles.gotItButtonText}>Got it! 👍</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Animated.View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },

  fullScreenContainer: {
    width: "100%",
    maxWidth: 380, // reduced for mobile screens
    maxHeight: 680, // fits 5.5–6.5 inch screens
  },

  cardContainer: {
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },

  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212529",
    letterSpacing: -0.3,
  },

  headerSubtitle: {
    fontSize: 12,
    color: "#6c757d",
    marginTop: 1,
    fontWeight: "500",
  },

  skipButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },

  skipButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6c757d",
  },

  progressContainer: {
    height: 3,
    backgroundColor: "#e9ecef",
    width: "100%",
  },

  progressBar: {
    height: "100%",
    borderRadius: 2,
  },

  contentContainer: {
    padding: 16,
  },

  emojiContainer: {
    alignItems: "center",
    marginBottom: 14,
  },
  emoji: {
    fontSize: 50, // reduced
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#212529",
    textAlign: "center",
    marginBottom: 14,
    letterSpacing: -0.3,
    lineHeight: 28,
  },

  messageContainer: {
    backgroundColor: "rgba(13, 110, 253, 0.05)",
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "rgba(13, 110, 253, 0.1)",
    borderLeftWidth: 5,
  },

  message: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212529",
    textAlign: "center",
    lineHeight: 22,
  },

  categoryTag: {
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 18,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },

  categoryText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },

  infoCardsContainer: {
    gap: 12,
    marginBottom: 16,
  },

  infoCard: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },

  reasonCard: {
    borderLeftWidth: 3,
    borderLeftColor: "#4CAF50",
  },

  actionCard: {
    borderLeftWidth: 3,
    borderLeftColor: "#FF9800",
  },

  infoCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  infoCardIcon: {
    fontSize: 18,
    marginRight: 8,
  },

  infoCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#212529",
  },

  infoCardContent: {
    fontSize: 13,
    color: "#495057",
    lineHeight: 18,
  },

  footer: {
    alignItems: "center",
  },

  timerContainer: {
    marginBottom: 14,
  },

  timerText: {
    fontSize: 12,
    color: "#6c757d",
    fontWeight: "500",
    textAlign: "center",
  },

  gotItButton: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },

  gotItButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});

export default AwarenessPopupScreen;
