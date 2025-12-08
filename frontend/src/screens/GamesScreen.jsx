// src/screens/GamesScreen.jsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Alert,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

// Imported Images (replace with your actual assets)
import ArVr from "../assets/ar.png";
import CommunityWatch from "../assets/CommunityWatch.png";
import EarthHeroes from "../assets/EarthHeroes.jpg";
import PlantDetective from "../assets/PlantDetective.png";
import StorytellingIcon from "../assets/vriksha.png";
import OceanGameIcon from "../assets/PlantDetective.png";

const { width } = Dimensions.get("window");

export default function GamesScreen() {
  const navigation = useNavigation();
  const [selectedGame, setSelectedGame] = useState(null);

  const games = [
    {
      title: "Nature Quiz",
      image: EarthHeroes,
      description: "Calculate your green score and learn sustainability",
      icon: "📊",
      isFeatured: true,
      badge: "NEW",
    },
    {
      title: "Storytelling Game",
      image: StorytellingIcon,
      description: "Interactive environmental storytelling adventure",
      icon: "📖",
    },
    {
      title: "Plant Detectives",
      image: PlantDetective,
      description: "Identify plants and learn about local flora",
      icon: "🔍",
    },
    {
      title: "AR / VR Explorer",
      image: ArVr,
      description: "Explore nature through augmented reality",
      icon: "👓",
    },
    {
      title: "Community Watch",
      image: CommunityWatch,
      description: "Report environmental issues in your community",
      icon: "👥",
    },
    {
      title: "Mini Games Center",
      image: CommunityWatch,
      description: "Collection of fun educational mini games",
      icon: "🎮",
    },
  ];

  const handleGamePress = (gameTitle) => {
    switch (gameTitle) {
      case "Storytelling Game":
        navigation.navigate("StorytellingGame");
        break;
      case "Nature Quiz":
        navigation.navigate("NatureQuiz");
        break;
      case "Plant Detectives":
        Alert.alert("Coming Soon", "Plant Detectives is under development!");
        break;
      case "AR / VR Explorer":
        Alert.alert("Coming Soon", "AR/VR Explorer is under development!");
        break;
      case "Community Watch":
        Alert.alert("Coming Soon", "Community Watch is under development!");
        break;
      case "Garbage Sorter":
      case "Eco Popup":
      case "Mini Games Center":
        navigation.navigate("MiniGames"); // All go to MiniGames screen
        break;
      default:
        Alert.alert("Coming Soon", "This game is under development!");
    }
  };

  const renderGameModal = () => {
    if (!selectedGame) return null;

    return (
      <Modal visible={true} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{selectedGame}</Text>
            <Text style={styles.questionText}>Launching {selectedGame}...</Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                setSelectedGame(null);
                if (selectedGame === "Nature Quiz") {
                  navigation.navigate("NatureQuiz");
                } else if (selectedGame === "Garbage Sorter" || selectedGame === "Eco Popup") {
                  navigation.navigate("MiniGames"); // Navigate to MiniGames instead
                } else {
                  navigation.navigate("StorytellingGame");
                }
              }}
            >
              <Text style={styles.primaryButtonText}>Launch Game</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setSelectedGame(null)}
            >
              <Text style={styles.secondaryButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const GameCard = ({ game, index }) => (
    <TouchableOpacity
      style={[
        styles.card,
        game.isFeatured && styles.featuredCard,
        game.title === "Nature Quiz" && styles.natureQuizCard,
        game.title === "Garbage Sorter" && styles.garbageSorterCard,
        game.title === "Eco Popup" && styles.ecoPopupCard,
      ]}
      onPress={() => handleGamePress(game.title)}
      activeOpacity={0.8}
    >
      <View style={styles.cardInner}>
        <View
          style={[
            styles.cardHeader,
            { backgroundColor: getCardColor(index) },
            game.isFeatured && styles.featuredCardHeader,
            game.title === "Garbage Sorter" && styles.garbageSorterHeader,
            game.title === "Eco Popup" && styles.ecoPopupHeader,
          ]}
        >
          <Text style={styles.cardIcon}>{game.icon}</Text>
          {game.badge && (
            <View
              style={[
                styles.badge,
                game.title === "Nature Quiz" && styles.natureQuizBadge,
                game.title === "Garbage Sorter" && styles.garbageSorterBadge,
                game.title === "Eco Popup" && styles.ecoPopupBadge,
              ]}
            >
              <Text style={styles.badgeText}>{game.badge}</Text>
            </View>
          )}
          <Image
            source={game.image}
            style={[
              styles.cardImage,
              game.isFeatured && styles.featuredCardImage,
            ]}
            resizeMode="cover"
          />
        </View>

        <View style={styles.cardContent}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.gameTitle,
                game.isFeatured && styles.featuredGameTitle,
              ]}
              numberOfLines={2}
            >
              {game.title}
            </Text>
            {game.title === "Nature Quiz" && (
              <Text style={styles.quizEmoji}>🌱</Text>
            )}
            {game.title === "Garbage Sorter" && (
              <Text style={styles.garbageSorterEmoji}>♻️</Text>
            )}
            {game.title === "Eco Popup" && (
              <Text style={styles.ecoPopupEmoji}>🎯</Text>
            )}
          </View>
          <Text style={styles.gameDescription} numberOfLines={3}>
            {game.description}
          </Text>

          <View
            style={[
              styles.playButton,
              game.title === "Nature Quiz" && styles.natureQuizButton,
              game.title === "Garbage Sorter" && styles.garbageSorterButton,
              game.title === "Eco Popup" && styles.ecoPopupButton,
            ]}
          >
            <Text
              style={[
                styles.playButtonText,
                game.title === "Nature Quiz" && styles.natureQuizButtonText,
                game.title === "Garbage Sorter" &&
                styles.garbageSorterButtonText,
                game.title === "Eco Popup" && styles.ecoPopupButtonText,
              ]}
            >
              Play Now
            </Text>
            <View
              style={[
                styles.playIcon,
                game.title === "Nature Quiz" && styles.natureQuizPlayIcon,
                game.title === "Garbage Sorter" && styles.garbageSorterPlayIcon,
                game.title === "Eco Popup" && styles.ecoPopupPlayIcon,
              ]}
            >
              <Text
                style={[
                  styles.playIconText,
                  game.title === "Nature Quiz" && styles.natureQuizPlayIconText,
                  game.title === "Garbage Sorter" &&
                  styles.garbageSorterPlayIconText,
                  game.title === "Eco Popup" && styles.ecoPopupPlayIconText,
                ]}
              >
                ▶
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getCardColor = (index) => {
    const colors = [
      "#667eea",
      "#f093fb",
      "#4facfe",
      "#43e97b",
      "#fa709a",
      "#6BCF7F",
      "#FFA726", // Garbage Sorter color
      "#26C6DA", // Eco Popup color
    ];
    return colors[index % colors.length];
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Eco Games</Text>
        <Text style={styles.subHeader}>
          Learn about nature through fun interactive experiences
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.grid}>
          {games.map((game, index) => (
            <GameCard key={index} game={game} index={index} />
          ))}
        </View>

        {/* Featured Game Banner - Nature Quiz */}
        <View style={[styles.featuredBanner, styles.natureQuizBanner]}>
          <View style={styles.featuredContent}>
            <Text
              style={[styles.featuredTitle, styles.natureQuizFeaturedTitle]}
            >
              Featured Game
            </Text>
            <Text
              style={[
                styles.featuredSubtitle,
                styles.natureQuizFeaturedSubtitle,
              ]}
            >
              GreenScore Calculator
            </Text>
            <Text style={styles.featuredDescription}>
              Calculate your sustainability score! Take the Nature Quiz to
              discover how eco-friendly your lifestyle is and learn practical
              tips to improve.
            </Text>
            <TouchableOpacity
              style={[styles.featuredButton, styles.natureQuizFeaturedButton]}
              onPress={() => navigation.navigate("NatureQuiz")}
            >
              <Text style={styles.featuredButtonText}>
                Take the Nature Quiz
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.featuredIcon}>
            <Text style={styles.featuredIconText}>📊</Text>
          </View>
        </View>

        {/* Garbage Sorter Banner */}
        <View style={[styles.featuredBanner, styles.garbageSorterBanner]}>
          <View style={styles.featuredContent}>
            <Text style={[styles.featuredTitle, styles.garbageSorterTitle]}>
              Waste Management
            </Text>
            <Text style={[styles.featuredSubtitle, styles.garbageSorterSubtitle]}>
              Garbage Sorter Game
            </Text>
            <Text style={styles.featuredDescription}>
              Master recycling skills! Learn to sort different types of waste into
              proper categories - organic, recyclable, hazardous, and general waste.
            </Text>
            <TouchableOpacity
              style={[styles.featuredButton, styles.garbageSorterButton]}
              onPress={() => navigation.navigate("MiniGames")}
            >
              <Text style={styles.featuredButtonText}>
                Start Sorting Waste
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.featuredIcon}>
            <Text style={styles.featuredIconText}>🗑️</Text>
          </View>
        </View>

        {/* Eco Popup Banner */}
        <View style={[styles.featuredBanner, styles.ecoPopupBanner]}>
          <View style={styles.featuredContent}>
            <Text style={[styles.featuredTitle, styles.ecoPopupTitle]}>
              Quick Challenges
            </Text>
            <Text style={[styles.featuredSubtitle, styles.ecoPopupSubtitle]}>
              Eco Popup Game
            </Text>
            <Text style={styles.featuredDescription}>
              Test your eco-knowledge with quick daily challenges! Learn about
              environmental facts, conservation tips, and sustainable living in
              bite-sized interactive sessions.
            </Text>
            <TouchableOpacity
              style={[styles.featuredButton, styles.ecoPopupButton]}
              onPress={() => navigation.navigate("MiniGames")}
            >
              <Text style={styles.featuredButtonText}>
                Start Eco Challenge
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.featuredIcon}>
            <Text style={styles.featuredIconText}>🎯</Text>
          </View>
        </View>

        {/* Storytelling Game Banner */}
        <View style={[styles.featuredBanner, styles.storytellingBanner]}>
          <View style={styles.featuredContent}>
            <Text style={[styles.featuredTitle, styles.storytellingTitle]}>
              Storytelling Adventure
            </Text>
            <Text
              style={[styles.featuredSubtitle, styles.storytellingSubtitle]}
            >
              Interactive Eco Stories
            </Text>
            <Text style={styles.featuredDescription}>
              Embark on an exciting journey through different ecosystems and
              learn about environmental conservation through interactive
              stories.
            </Text>
            <TouchableOpacity
              style={[styles.featuredButton, styles.storytellingButton]}
              onPress={() => navigation.navigate("StorytellingGame")}
            >
              <Text style={styles.featuredButtonText}>
                Play Storytelling Game
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.featuredIcon}>
            <Text style={styles.featuredIconText}>🌿</Text>
          </View>
        </View>

        {/* Ocean Game Banner */}
        <View style={[styles.featuredBanner, styles.oceanBanner]}>
          <View style={styles.featuredContent}>
            <Text style={[styles.featuredTitle, styles.oceanTitle]}>
              Ocean Adventure
            </Text>
            <Text style={[styles.featuredSubtitle, styles.oceanSubtitle]}>
              Beach Cleanup Challenge
            </Text>
            <Text style={styles.featuredDescription}>
              Dive into an interactive ocean cleanup game! Sort trash, save
              marine animals, and learn about ocean conservation.
            </Text>
            <TouchableOpacity
              style={[styles.featuredButton, styles.oceanButton]}
              onPress={() => navigation.navigate("OceanGame")}
            >
              <Text style={styles.featuredButtonText}>Start Ocean Cleanup</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.featuredIcon}>
            <Text style={styles.featuredIconText}>🌊</Text>
          </View>
        </View>

        {/* AQI Game Banner */}
        <View style={[styles.featuredBanner, styles.aqiBanner]}>
          <View style={styles.featuredContent}>
            <Text style={[styles.featuredTitle, styles.aqiTitle]}>AQI Adventure</Text>
            <Text style={[styles.featuredSubtitle, styles.aqiSubtitle]}>Air Quality Awareness Game</Text>
            <Text style={styles.featuredDescription}>
              Play an interactive AQI learning game! Identify pollution sources, improve air quality, and discover ways to protect your health.
            </Text>
            <TouchableOpacity
              style={[styles.featuredButton, styles.aqiButton]}
              onPress={() => navigation.navigate('AQIGame')}
            >
              <Text style={styles.featuredButtonText}>Start AQI Mission</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.featuredIcon}>
            <Text style={styles.featuredIconText}>🌬️</Text>
          </View>
        </View>

        {/* Seed Save Game Banner - ADDED THIS SECTION */}
        <View style={[styles.featuredBanner, styles.seedBanner]}>
          <View style={styles.featuredContent}>
            <Text style={[styles.featuredTitle, styles.seedTitle]}>Seed Save Game</Text>
            <Text style={[styles.featuredSubtitle, styles.seedSubtitle]}>Plant Conservation Challenge</Text>
            <Text style={styles.featuredDescription}>
              Collect and save rare seeds! Learn about plant biodiversity, seed banking, and help preserve endangered plant species.
            </Text>
            <TouchableOpacity
              style={[styles.featuredButton, styles.seedButton]}
              onPress={() => navigation.navigate('SeedSaverGameScreen')}
            >
              <Text style={styles.featuredButtonText}>Start Seed Saving</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.featuredIcon}>
            <Text style={styles.featuredIconText}>🌱</Text>
          </View>
        </View>

      </ScrollView>
      {renderGameModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "white",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1a365d",
    marginBottom: 8,
  },
  subHeader: {
    fontSize: 16,
    color: "#718096",
    lineHeight: 22,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  card: {
    width: (width - 48) / 2,
    marginBottom: 16,
    borderRadius: 20,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  natureQuizCard: {
    borderWidth: 2,
    borderColor: "#10B981",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    transform: [{ scale: 1.02 }],
  },
  garbageSorterCard: {
    borderWidth: 2,
    borderColor: "#FFA726",
    shadowColor: "#FFA726",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  ecoPopupCard: {
    borderWidth: 2,
    borderColor: "#26C6DA",
    shadowColor: "#26C6DA",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  featuredCard: {
    borderWidth: 2,
    borderColor: "#fbbf24",
  },
  cardInner: {
    borderRadius: 20,
    overflow: "hidden",
  },
  cardHeader: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  garbageSorterHeader: {
    backgroundColor: "#FFA726",
  },
  ecoPopupHeader: {
    backgroundColor: "#26C6DA",
  },
  featuredCardHeader: {
    height: 130,
  },
  cardIcon: {
    fontSize: 32,
    position: "absolute",
    top: 12,
    left: 12,
    zIndex: 1,
  },
  badge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#ef4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    zIndex: 1,
  },
  natureQuizBadge: {
    backgroundColor: "#10B981",
  },
  garbageSorterBadge: {
    backgroundColor: "#FFA726",
  },
  ecoPopupBadge: {
    backgroundColor: "#26C6DA",
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  featuredCardImage: {
    width: 70,
    height: 70,
  },
  cardContent: {
    padding: 16,
    backgroundColor: "white",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2d3748",
    flex: 1,
    minHeight: 40,
  },
  featuredGameTitle: {
    fontSize: 17,
  },
  quizEmoji: {
    fontSize: 20,
    marginLeft: 8,
  },
  garbageSorterEmoji: {
    fontSize: 20,
    marginLeft: 8,
  },
  ecoPopupEmoji: {
    fontSize: 20,
    marginLeft: 8,
  },
  gameDescription: {
    fontSize: 12,
    color: "#718096",
    lineHeight: 18,
    marginBottom: 16,
    minHeight: 54,
  },
  playButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f7fafc",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  natureQuizButton: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  garbageSorterButton: {
    backgroundColor: "#FFA726",
    borderColor: "#FFA726",
  },
  ecoPopupButton: {
    backgroundColor: "#26C6DA",
    borderColor: "#26C6DA",
  },
  playButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4a5568",
  },
  natureQuizButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  garbageSorterButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  ecoPopupButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  playIcon: {
    backgroundColor: "#48bb78",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  natureQuizPlayIcon: {
    backgroundColor: "white",
  },
  garbageSorterPlayIcon: {
    backgroundColor: "white",
  },
  ecoPopupPlayIcon: {
    backgroundColor: "white",
  },
  playIconText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
    marginLeft: 2,
  },
  natureQuizPlayIconText: {
    color: "#10B981",
  },
  garbageSorterPlayIconText: {
    color: "#FFA726",
  },
  ecoPopupPlayIconText: {
    color: "#26C6DA",
  },
  featuredBanner: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    minHeight: 180,
  },
  natureQuizBanner: {
    backgroundColor: "#f0fdf4",
    borderWidth: 2,
    borderColor: "#bbf7d0",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
  },
  garbageSorterBanner: {
    backgroundColor: "#FFF8E1",
    borderWidth: 2,
    borderColor: "#FFE0B2",
    shadowColor: "#FFA726",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
  },
  ecoPopupBanner: {
    backgroundColor: "#E0F7FA",
    borderWidth: 2,
    borderColor: "#B2EBF2",
    shadowColor: "#26C6DA",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
  },
  storytellingBanner: {
    backgroundColor: "#E8F5E9",
    borderWidth: 2,
    borderColor: "#C8E6C9",
  },
  oceanBanner: {
    backgroundColor: "#e6f7ff",
    borderWidth: 2,
    borderColor: "#91d5ff",
  },
  aqiBanner: {
    backgroundColor: '#f0f9ff',
    borderWidth: 2,
    borderColor: '#d6e4ff',
  },
  seedBanner: {
    backgroundColor: '#f6ffed',
    borderWidth: 2,
    borderColor: '#b7eb8f',
  },
  miniGamesBanner: {
    backgroundColor: '#f0f9ff',
    borderWidth: 2,
    borderColor: "#d6e4ff",
  },
  seedBanner: {
    backgroundColor: "#f6ffed",
    borderWidth: 2,
    borderColor: "#b7eb8f",
  },
  featuredContent: {
    flex: 1,
    marginRight: 16,
    justifyContent: "space-between",
  },
  featuredTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#718096",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  natureQuizFeaturedTitle: {
    color: "#10B981",
  },
  garbageSorterTitle: {
    color: "#FF8F00",
  },
  ecoPopupTitle: {
    color: "#00ACC1",
  },
  storytellingTitle: {
    color: "#388E3C",
  },
  oceanTitle: {
    color: "#1890ff",
  },
  aqiTitle: {
    color: '#597ef7',
  },
  seedTitle: {
    color: '#73d13d',
  },
  miniGamesTitle: {
    color: '#52c41a',
  },
  featuredSubtitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2d3748",
    marginBottom: 8,
    lineHeight: 26,
  },
  natureQuizFeaturedSubtitle: {
    color: "#065f46",
    fontSize: 22,
  },
  garbageSorterSubtitle: {
    color: "#E65100",
    fontSize: 22,
  },
  ecoPopupSubtitle: {
    color: "#00838F",
    fontSize: 22,
  },
  storytellingSubtitle: {
    color: "#2E7D32",
  },
  oceanSubtitle: {
    color: "#096dd9",
  },
  aqiSubtitle: {
    color: '#2f54eb',
  },
  seedSubtitle: {
    color: '#52c41a',
  },
  miniGamesSubtitle: {
    color: '#389e0d',
  },
  featuredDescription: {
    fontSize: 13,
    color: "#718096",
    lineHeight: 20,
    marginBottom: 16,
  },
  featuredButton: {
    backgroundColor: "#48bb78",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: "flex-start",
    shadowColor: "#48bb78",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  natureQuizFeaturedButton: {
    backgroundColor: "#10B981",
    shadowColor: "#10B981",
  },
  garbageSorterButton: {
    backgroundColor: "#FFA726",
    shadowColor: "#FFA726",
  },
  ecoPopupButton: {
    backgroundColor: "#26C6DA",
    shadowColor: "#26C6DA",
  },
  storytellingButton: {
    backgroundColor: "#4CAF50",
    shadowColor: "#4CAF50",
  },
  oceanButton: {
    backgroundColor: "#1890ff",
    shadowColor: "#1890ff",
  },
  aqiButton: {
    backgroundColor: '#597ef7',
    shadowColor: '#597ef7',
  },
  seedButton: {
    backgroundColor: '#73d13d',
    shadowColor: '#73d13d',
  },
  miniGamesButton: {
    backgroundColor: '#52c41a',
    shadowColor: '#52c41a',
  },
  featuredButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  featuredIcon: {
    justifyContent: "center",
    alignItems: "center",
    width: 80,
  },
  featuredIconText: {
    fontSize: 48,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 28,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2d3748",
    marginBottom: 12,
    textAlign: "center",
  },
  questionText: {
    fontSize: 16,
    color: "#718096",
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 24,
  },
  primaryButton: {
    backgroundColor: "#4299e1",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#4299e1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    backgroundColor: "#f7fafc",
  },
  secondaryButtonText: {
    color: "#718096",
    fontSize: 16,
    fontWeight: "600",
  },
});