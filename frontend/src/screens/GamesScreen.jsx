// import React, { useState } from "react";
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   TouchableOpacity, 
//   Image, 
//   ScrollView, 
//   Modal,
//   Alert,
//   ActivityIndicator,
//   Dimensions,
//   Animated
// } from "react-native";

// // Imported Images (replace with your actual assets)
// import ArVr from "../assets/ar.png";
// import CommunityWatch from "../assets/CommunityWatch.png";
// import EarthHeroes from "../assets/EarthHeroes.jpg";
// import PlantDetective from "../assets/PlantDetective.png";
// import StorytellingIcon from "../assets/vriksha.png";

// const { width } = Dimensions.get('window');

// export default function GamesScreen({ navigation }) {
//   const [selectedGame, setSelectedGame] = useState(null);
//   const [quizScore, setQuizScore] = useState(0);
//   const [currentQuestion, setCurrentQuestion] = useState(0);
//   const [plantDetectionResult, setPlantDetectionResult] = useState("");
//   const [arVrActive, setArVrActive] = useState(false);
//   const [communityReport, setCommunityReport] = useState("");
//   const [loading, setLoading] = useState(false);

//   const games = [
//     { 
//       title: "Storytelling Game", 
//       image: StorytellingIcon, 
//       bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
//       description: "Interactive environmental storytelling adventure",
//       icon: "📖"
//     },
//     { 
//       title: "Nature Quiz", 
//       image: EarthHeroes, 
//       bg: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
//       description: "Test your knowledge about nature and environment",
//       icon: "❓"
//     },
//     { 
//       title: "Plant Detectives", 
//       image: PlantDetective, 
//       bg: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
//       description: "Identify plants and learn about local flora",
//       icon: "🔍"
//     },
//     { 
//       title: "AR / VR Explorer", 
//       image: ArVr, 
//       bg: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
//       description: "Explore nature through augmented reality",
//       icon: "👓"
//     },
//     { 
//       title: "Community Watch", 
//       image: CommunityWatch, 
//       bg: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
//       description: "Report environmental issues in your community",
//       icon: "👥"
//     },
//   ];

//   const startStorytellingGame = () => {
//     navigation.navigate('StorytellingGame');
//   };

//   const handleGamePress = (gameTitle) => {
//     switch(gameTitle) {
//       case "Storytelling Game":
//         startStorytellingGame();
//         break;
//       case "Nature Quiz":
//         startNatureQuiz();
//         break;
//       case "Plant Detectives":
//         startPlantDetection();
//         break;
//       case "AR / VR Explorer":
//         startARVRExplorer();
//         break;
//       case "Community Watch":
//         startCommunityWatch();
//         break;
//       default:
//         Alert.alert("Coming Soon", "This game is under development!");
//     }
//   };

//   const renderGameModal = () => {
//     if (!selectedGame) return null;

//     switch(selectedGame) {
//       case "Storytelling Game":
//         return (
//           <Modal visible={true} animationType="slide" transparent={true}>
//             <View style={styles.modalOverlay}>
//               <View style={styles.modalContainer}>
//                 <Text style={styles.modalTitle}>Storytelling Game</Text>
//                 <Text style={styles.questionText}>
//                   Launching Environmental Storytelling Adventure...
//                 </Text>
//                 <TouchableOpacity 
//                   style={styles.primaryButton}
//                   onPress={startStorytellingGame}
//                 >
//                   <Text style={styles.primaryButtonText}>Launch Storytelling Game</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity style={styles.secondaryButton} onPress={closeGame}>
//                   <Text style={styles.secondaryButtonText}>Close</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </Modal>
//         );
//       // ... other cases
//     }
//   };

//   const GameCard = ({ game, index }) => (
//     <TouchableOpacity 
//       style={styles.card}
//       onPress={() => handleGamePress(game.title)}
//       activeOpacity={0.8}
//     >
//       <View style={styles.cardInner}>
//         <View style={[styles.cardHeader, { backgroundColor: getCardColor(index) }]}>
//           <Text style={styles.cardIcon}>{game.icon}</Text>
//           <Image source={game.image} style={styles.cardImage} />
//         </View>
        
//         <View style={styles.cardContent}>
//           <Text style={styles.gameTitle}>{game.title}</Text>
//           <Text style={styles.gameDescription}>{game.description}</Text>
          
//           <TouchableOpacity style={styles.playButton}>
//             <Text style={styles.playButtonText}>Play Now</Text>
//             <View style={styles.playIcon}>
//               <Text style={styles.playIconText}>▶</Text>
//             </View>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </TouchableOpacity>
//   );

//   const getCardColor = (index) => {
//     const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];
//     return colors[index % colors.length];
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.headerContainer}>
//         <Text style={styles.header}>Eco Games</Text>
//         <Text style={styles.subHeader}>
//           Learn about nature through fun interactive experiences
//         </Text>
//       </View>

//       <ScrollView 
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.scrollContent}
//       >
//         <View style={styles.grid}>
//           {games.map((game, index) => (
//             <GameCard key={index} game={game} index={index} />
//           ))}
//         </View>
        
//         {/* Featured Game Banner */}
//         <View style={styles.featuredBanner}>
//           <View style={styles.featuredContent}>
//             <Text style={styles.featuredTitle}>Featured Game</Text>
//             <Text style={styles.featuredSubtitle}>Storytelling Adventure</Text>
//             <Text style={styles.featuredDescription}>
//               Embark on an exciting journey through different ecosystems and learn about environmental conservation.
//             </Text>
//             <TouchableOpacity style={styles.featuredButton}>
//               <Text style={styles.featuredButtonText}>Play Featured Game</Text>
//             </TouchableOpacity>
//           </View>
//           <View style={styles.featuredIcon}>
//             <Text style={styles.featuredIconText}>🌿</Text>
//           </View>
//         </View>
//       </ScrollView>
      
//       {renderGameModal()}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8fafc',
//   },
//   headerContainer: {
//     paddingHorizontal: 24,
//     paddingTop: 60,
//     paddingBottom: 20,
//     backgroundColor: 'white',
//     borderBottomLeftRadius: 24,
//     borderBottomRightRadius: 24,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   header: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     color: '#1a365d',
//     marginBottom: 8,
//   },
//   subHeader: {
//     fontSize: 16,
//     color: '#718096',
//     lineHeight: 22,
//   },
//   scrollContent: {
//     padding: 16,
//   },
//   grid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//     marginBottom: 24,
//   },
//   card: {
//     width: (width - 48) / 2,
//     marginBottom: 16,
//     borderRadius: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 12,
//     elevation: 5,
//   },
//   cardInner: {
//     backgroundColor: 'white',
//     borderRadius: 20,
//     overflow: 'hidden',
//   },
//   cardHeader: {
//     height: 100,
//     justifyContent: 'center',
//     alignItems: 'center',
//     position: 'relative',
//   },
//   cardIcon: {
//     fontSize: 32,
//     position: 'absolute',
//     top: 12,
//     left: 12,
//   },
//   cardImage: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//   },
//   cardContent: {
//     padding: 16,
//   },
//   gameTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#2d3748',
//     marginBottom: 6,
//   },
//   gameDescription: {
//     fontSize: 12,
//     color: '#718096',
//     lineHeight: 16,
//     marginBottom: 16,
//   },
//   playButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     backgroundColor: '#f7fafc',
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#e2e8f0',
//   },
//   playButtonText: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: '#4a5568',
//   },
//   playIcon: {
//     backgroundColor: '#48bb78',
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   playIconText: {
//     color: 'white',
//     fontSize: 8,
//     fontWeight: 'bold',
//   },
//   featuredBanner: {
//     flexDirection: 'row',
//     backgroundColor: 'white',
//     borderRadius: 20,
//     padding: 20,
//     marginBottom: 24,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 12,
//     elevation: 5,
//   },
//   featuredContent: {
//     flex: 1,
//     marginRight: 16,
//   },
//   featuredTitle: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#718096',
//     marginBottom: 4,
//   },
//   featuredSubtitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#2d3748',
//     marginBottom: 8,
//   },
//   featuredDescription: {
//     fontSize: 14,
//     color: '#718096',
//     lineHeight: 20,
//     marginBottom: 16,
//   },
//   featuredButton: {
//     backgroundColor: '#48bb78',
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     borderRadius: 12,
//     alignSelf: 'flex-start',
//   },
//   featuredButtonText: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   featuredIcon: {
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   featuredIconText: {
//     fontSize: 48,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   modalContainer: {
//     backgroundColor: 'white',
//     borderRadius: 20,
//     padding: 24,
//     width: '100%',
//     maxWidth: 400,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 20,
//     elevation: 10,
//   },
//   modalTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#2d3748',
//     marginBottom: 16,
//     textAlign: 'center',
//   },
//   questionText: {
//     fontSize: 16,
//     color: '#718096',
//     textAlign: 'center',
//     marginBottom: 24,
//     lineHeight: 22,
//   },
//   primaryButton: {
//     backgroundColor: '#4299e1',
//     paddingVertical: 14,
//     borderRadius: 12,
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   primaryButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   secondaryButton: {
//     paddingVertical: 14,
//     borderRadius: 12,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#e2e8f0',
//   },
//   secondaryButtonText: {
//     color: '#718096',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });


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
import { useNavigation } from '@react-navigation/native';

// Imported Images (replace with your actual assets)
import ArVr from "../assets/ar.png";
import CommunityWatch from "../assets/CommunityWatch.png";
import EarthHeroes from "../assets/EarthHeroes.jpg";
import PlantDetective from "../assets/PlantDetective.png";
import StorytellingIcon from "../assets/vriksha.png";
import OceanGameIcon from "../assets/PlantDetective.png";

const { width } = Dimensions.get('window');

export default function GamesScreen() {
  const navigation = useNavigation();
  const [selectedGame, setSelectedGame] = useState(null);

  const games = [
    { 
      title: "Storytelling Game", 
      image: StorytellingIcon, 
      description: "Interactive environmental storytelling adventure",
      icon: "📖"
    },
    { 
      title: "Nature Quiz", 
      image: EarthHeroes, 
      description: "Test your knowledge about nature and environment",
      icon: "❓"
    },
    { 
      title: "Plant Detectives", 
      image: PlantDetective, 
      description: "Identify plants and learn about local flora",
      icon: "🔍"
    },
    { 
      title: "AR / VR Explorer", 
      image: ArVr, 
      description: "Explore nature through augmented reality",
      icon: "👓"
    },
    { 
      title: "Community Watch", 
      image: CommunityWatch, 
      description: "Report environmental issues in your community",
      icon: "👥"
    },
    { 
      title: "Mini Games Center", 
      image: CommunityWatch,
      description: "Collection of fun educational mini games",
      icon: "🎮"
    },
  ];

  const handleGamePress = (gameTitle) => {
    switch(gameTitle) {
      case "Storytelling Game":
        navigation.navigate('StorytellingGame');
        break;
      case "Nature Quiz":
        Alert.alert("Coming Soon", "Nature Quiz is under development!");
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
      case "Mini Games Center":
        navigation.navigate('MiniGames');
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
            <Text style={styles.questionText}>
              Launching {selectedGame}...
            </Text>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => {
                setSelectedGame(null);
                navigation.navigate('StorytellingGame');
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
      style={styles.card}
      onPress={() => handleGamePress(game.title)}
      activeOpacity={0.8}
    >
      <View style={styles.cardInner}>
        <View style={[styles.cardHeader, { backgroundColor: getCardColor(index) }]}>
          <Text style={styles.cardIcon}>{game.icon}</Text>
          <Image source={game.image} style={styles.cardImage} resizeMode="cover" />
        </View>
        
        <View style={styles.cardContent}>
          <Text style={styles.gameTitle} numberOfLines={2}>{game.title}</Text>
          <Text style={styles.gameDescription} numberOfLines={3}>{game.description}</Text>
          
          <View style={styles.playButton}>
            <Text style={styles.playButtonText}>Play Now</Text>
            <View style={styles.playIcon}>
              <Text style={styles.playIconText}>▶</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getCardColor = (index) => {
    const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#6BCF7F'];
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
        
        {/* Featured Game Banner - Storytelling */}
        <View style={styles.featuredBanner}>
          <View style={styles.featuredContent}>
            <Text style={styles.featuredTitle}>Featured Game</Text>
            <Text style={styles.featuredSubtitle}>Storytelling Adventure</Text>
            <Text style={styles.featuredDescription}>
              Embark on an exciting journey through different ecosystems and learn about environmental conservation.
            </Text>
            <TouchableOpacity 
              style={styles.featuredButton}
              onPress={() => navigation.navigate('StorytellingGame')}
            >
              <Text style={styles.featuredButtonText}>Play Storytelling Game</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.featuredIcon}>
            <Text style={styles.featuredIconText}>🌿</Text>
          </View>
        </View>

        {/* Ocean Game Banner */}
        <View style={[styles.featuredBanner, styles.oceanBanner]}>
          <View style={styles.featuredContent}>
            <Text style={[styles.featuredTitle, styles.oceanTitle]}>Ocean Adventure</Text>
            <Text style={[styles.featuredSubtitle, styles.oceanSubtitle]}>Beach Cleanup Challenge</Text>
            <Text style={styles.featuredDescription}>
              Dive into an interactive ocean cleanup game! Sort trash, save marine animals, and learn about ocean conservation.
            </Text>
            <TouchableOpacity 
              style={[styles.featuredButton, styles.oceanButton]}
              onPress={() => navigation.navigate('OceanGame')}
            >
              <Text style={styles.featuredButtonText}>Start Ocean Cleanup</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.featuredIcon}>
            <Text style={styles.featuredIconText}>🌊</Text>
          </View>
        </View>

        {/* Mini Games Banner */}
        <View style={[styles.featuredBanner, styles.miniGamesBanner]}>
          <View style={styles.featuredContent}>
            <Text style={[styles.featuredTitle, styles.miniGamesTitle]}>Quick Play</Text>
            <Text style={[styles.featuredSubtitle, styles.miniGamesSubtitle]}>Mini Games Collection</Text>
            <Text style={styles.featuredDescription}>
              Explore a variety of quick eco-games designed to teach and entertain!
            </Text>
            <TouchableOpacity 
              style={[styles.featuredButton, styles.miniGamesButton]}
              onPress={() => navigation.navigate('MiniGames')}
            >
              <Text style={styles.featuredButtonText}>Explore Mini Games</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.featuredIcon}>
            <Text style={styles.featuredIconText}>🎮</Text>
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
    backgroundColor: '#f8fafc',
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 8,
  },
  subHeader: {
    fontSize: 16,
    color: '#718096',
    lineHeight: 22,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  card: {
    width: (width - 48) / 2,
    marginBottom: 16,
    borderRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardInner: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardHeader: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cardIcon: {
    fontSize: 32,
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 1,
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cardContent: {
    padding: 16,
    backgroundColor: 'white',
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 6,
    minHeight: 40,
  },
  gameDescription: {
    fontSize: 12,
    color: '#718096',
    lineHeight: 18,
    marginBottom: 16,
    minHeight: 54,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f7fafc',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  playButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4a5568',
  },
  playIcon: {
    backgroundColor: '#48bb78',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  featuredBanner: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    minHeight: 180,
  },
  oceanBanner: {
    backgroundColor: '#e6f7ff',
    borderWidth: 2,
    borderColor: '#91d5ff',
  },
  miniGamesBanner: {
    backgroundColor: '#f0f9ff',
    borderWidth: 2,
    borderColor: '#b5f5d1',
  },
  featuredContent: {
    flex: 1,
    marginRight: 16,
    justifyContent: 'space-between',
  },
  featuredTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#718096',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  oceanTitle: {
    color: '#1890ff',
  },
  miniGamesTitle: {
    color: '#52c41a',
  },
  featuredSubtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 8,
    lineHeight: 26,
  },
  oceanSubtitle: {
    color: '#096dd9',
  },
  miniGamesSubtitle: {
    color: '#389e0d',
  },
  featuredDescription: {
    fontSize: 13,
    color: '#718096',
    lineHeight: 20,
    marginBottom: 16,
  },
  featuredButton: {
    backgroundColor: '#48bb78',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
    shadowColor: '#48bb78',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  oceanButton: {
    backgroundColor: '#1890ff',
    shadowColor: '#1890ff',
  },
  miniGamesButton: {
    backgroundColor: '#52c41a',
    shadowColor: '#52c41a',
  },
  featuredButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  featuredIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  featuredIconText: {
    fontSize: 48,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 12,
    textAlign: 'center',
  },
  questionText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 24,
  },
  primaryButton: {
    backgroundColor: '#4299e1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#4299e1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#f7fafc',
  },
  secondaryButtonText: {
    color: '#718096',
    fontSize: 16,
    fontWeight: '600',
  },
});