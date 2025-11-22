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
  ActivityIndicator
} from "react-native";

// Imported Images (replace with your actual assets)
import ArVr from "../assets/ArVr.jpg";
import CommunityWatch from "../assets/CommunityWatch.png";
import EarthHeroes from "../assets/EarthHeroes.jpg";
import PlantDetective from "../assets/PlantDetective.png";


export default function GamesScreen() {
  const [selectedGame, setSelectedGame] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [plantDetectionResult, setPlantDetectionResult] = useState("");
  const [arVrActive, setArVrActive] = useState(false);
  const [communityReport, setCommunityReport] = useState("");
  const [loading, setLoading] = useState(false);

  const games = [
    { 
      title: "Nature Quiz", 
      image: EarthHeroes, 
      bg: "#7FBF7F",
      description: "Test your knowledge about nature and environment"
    },
    { 
      title: "Plant Detectives", 
      image: PlantDetective, 
      bg: "#6B9B6B",
      description: "Identify plants and learn about local flora"
    },
    { 
      title: "AR / VR Explorer", 
      image: ArVr, 
      bg: "#5A8A7A",
      description: "Explore nature through augmented reality"
    },
    { 
      title: "Community Watch", 
      image: CommunityWatch, 
      bg: "#A67C7C",
      description: "Report environmental issues in your community"
    },
  ];

  // Nature Quiz Questions
  const quizQuestions = [
    {
      question: "Which tree is known as the 'lungs of our planet'?",
      options: ["Oak Tree", "Amazon Rainforest", "Bamboo", "Pine Tree"],
      correctAnswer: 1
    },
    {
      question: "What percentage of Earth's water is freshwater?",
      options: ["10%", "3%", "25%", "50%"],
      correctAnswer: 1
    },
    {
      question: "Which animal is a key indicator of ecosystem health?",
      options: ["Bear", "Bee", "Lion", "Shark"],
      correctAnswer: 1
    }
  ];

  // Plant Database for Detection Game
  const plantDatabase = [
    { name: "Oak Tree", description: "A large deciduous tree that provides habitat for many species" },
    { name: "Sunflower", description: "Bright yellow flower that follows the sun" },
    { name: "Rose", description: "Fragrant flowering plant with thorns" },
    { name: "Fern", description: "Non-flowering plant that reproduces via spores" },
    { name: "Cactus", description: "Succulent plant adapted to dry environments" }
  ];

  const startNatureQuiz = () => {
    setSelectedGame("Nature Quiz");
    setQuizScore(0);
    setCurrentQuestion(0);
  };

  const handleQuizAnswer = (selectedOption) => {
    if (selectedOption === quizQuestions[currentQuestion].correctAnswer) {
      setQuizScore(quizScore + 1);
    }

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      Alert.alert(
        "Quiz Completed!",
        `Your score: ${quizScore + (selectedOption === quizQuestions[currentQuestion].correctAnswer ? 1 : 0)}/${quizQuestions.length}`,
        [{ text: "OK", onPress: () => setSelectedGame(null) }]
      );
    }
  };

  const startPlantDetection = () => {
    setSelectedGame("Plant Detectives");
    setLoading(true);
    
    // Simulate plant detection process
    setTimeout(() => {
      const randomPlant = plantDatabase[Math.floor(Math.random() * plantDatabase.length)];
      setPlantDetectionResult(`Detected: ${randomPlant.name}\n\n${randomPlant.description}`);
      setLoading(false);
    }, 2000);
  };

  const startARVRExplorer = () => {
    setSelectedGame("AR / VR Explorer");
    setArVrActive(true);
    
    Alert.alert(
      "AR/VR Mode Activated",
      "Point your camera at plants or trees to see interactive information!",
      [{ text: "OK", onPress: () => {
        // Simulate AR experience
        setTimeout(() => {
          Alert.alert("Tree Identified!", "This is an Oak Tree - provides habitat for 500+ species!");
          setArVrActive(false);
        }, 3000);
      }}]
    );
  };

  const startCommunityWatch = () => {
    setSelectedGame("Community Watch");
    Alert.prompt(
      "Community Report",
      "Describe an environmental issue you've noticed:",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Submit", 
          onPress: (report) => {
            if (report) {
              setCommunityReport(report);
              Alert.alert(
                "Thank You!",
                "Your report has been submitted to the community.",
                [{ text: "OK", onPress: () => setSelectedGame(null) }]
              );
            }
          }
        }
      ]
    );
  };

  const handleGamePress = (gameTitle) => {
    switch(gameTitle) {
      case "Nature Quiz":
        startNatureQuiz();
        break;
      case "Plant Detectives":
        startPlantDetection();
        break;
      case "AR / VR Explorer":
        startARVRExplorer();
        break;
      case "Community Watch":
        startCommunityWatch();
        break;
      default:
        Alert.alert("Coming Soon", "This game is under development!");
    }
  };

  const closeGame = () => {
    setSelectedGame(null);
    setLoading(false);
    setArVrActive(false);
  };

  // Game Modal Components
  const renderGameModal = () => {
    if (!selectedGame) return null;

    switch(selectedGame) {
      case "Nature Quiz":
        if (currentQuestion >= quizQuestions.length) return null;
        
        return (
          <Modal visible={true} animationType="slide">
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Nature Quiz</Text>
              <Text style={styles.question}>
                Question {currentQuestion + 1}/{quizQuestions.length}
              </Text>
              <Text style={styles.questionText}>
                {quizQuestions[currentQuestion].question}
              </Text>
              
              <View style={styles.optionsContainer}>
                {quizQuestions[currentQuestion].options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.optionButton}
                    onPress={() => handleQuizAnswer(index)}
                  >
                    <Text style={styles.optionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <TouchableOpacity style={styles.closeButton} onPress={closeGame}>
                <Text style={styles.closeButtonText}>Close Quiz</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        );

      case "Plant Detectives":
        return (
          <Modal visible={true} animationType="slide">
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Plant Detective</Text>
              
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#2e7d32" />
                  <Text style={styles.loadingText}>Scanning plant...</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.resultText}>{plantDetectionResult}</Text>
                  <TouchableOpacity 
                    style={styles.detectAgainButton}
                    onPress={startPlantDetection}
                  >
                    <Text style={styles.detectAgainText}>Detect Another Plant</Text>
                  </TouchableOpacity>
                </>
              )}
              
              <TouchableOpacity style={styles.closeButton} onPress={closeGame}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        );

      case "AR / VR Explorer":
        return (
          <Modal visible={true} animationType="slide">
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>AR/VR Explorer</Text>
              
              {arVrActive ? (
                <View style={styles.arContainer}>
                  <Text style={styles.arText}>📱 Camera Active</Text>
                  <Text style={styles.arInstruction}>
                    Point your camera at plants or trees to identify them!
                  </Text>
                  <View style={styles.cameraPlaceholder}>
                    <Text style={styles.cameraText}>📸 Camera View</Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.arText}>AR session completed!</Text>
              )}
              
              <TouchableOpacity style={styles.closeButton} onPress={closeGame}>
                <Text style={styles.closeButtonText}>Exit AR</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Fun & Educational Games</Text>
      <Text style={styles.subHeader}>Learn about nature through interactive games</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {games.map((game, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.card}
              onPress={() => handleGamePress(game.title)}
              activeOpacity={0.7}
            >
              <View style={[styles.innerCard, { backgroundColor: game.bg }]}>
                <Image source={game.image} style={styles.image} />
                <Text style={styles.gameTitle}>{game.title}</Text>
                <Text style={styles.gameDescription}>{game.description}</Text>
                <TouchableOpacity style={styles.playBtn}>
                  <Text style={styles.playText}>▶ Play</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>Game Features</Text>
          <View style={styles.featuresGrid}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🌱</Text>
              <Text style={styles.featureText}>Plant Identification</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📚</Text>
              <Text style={styles.featureText}>Educational Content</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🏆</Text>
              <Text style={styles.featureText}>Earn Badges</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>👥</Text>
              <Text style={styles.featureText}>Community Features</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {renderGameModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f5f5f5", 
    paddingTop: 20 
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginHorizontal: 20,
    marginBottom: 5,
    color: "#2e7d32",
    textAlign: "center",
  },
  subHeader: {
    fontSize: 16,
    marginHorizontal: 20,
    marginBottom: 25,
    color: "#666",
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  card: { 
    width: "47%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 15,
  },
  innerCard: {
    borderRadius: 15,
    padding: 12,
    minHeight: 220,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: "cover",
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  gameDescription: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 10,
    flex: 1,
  },
  playBtn: {
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingVertical: 6,
    borderRadius: 20,
    width: 70,
    alignItems: "center",
    alignSelf: "flex-start",
  },
  playText: { 
    color: "#fff", 
    fontSize: 13,
    fontWeight: "600",
  },
  featuresSection: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2e7d32",
    marginBottom: 15,
    textAlign: "center",
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featureItem: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  featureText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
    paddingTop: 50,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2e7d32",
    textAlign: "center",
    marginBottom: 20,
  },
  question: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 10,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  optionsContainer: {
    marginBottom: 30,
  },
  optionButton: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  optionText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#666",
  },
  resultText: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 20,
  },
  detectAgainButton: {
    backgroundColor: "#2e7d32",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  detectAgainText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  arContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  arText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  arInstruction: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  cameraPlaceholder: {
    width: 200,
    height: 300,
    backgroundColor: "#ddd",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ccc",
    borderStyle: "dashed",
  },
  cameraText: {
    fontSize: 16,
    color: "#666",
  },
  closeButton: {
    backgroundColor: "#666",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});