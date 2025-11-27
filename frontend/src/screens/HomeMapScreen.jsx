// src/screens/HomeMapScreen.jsx
import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Alert,
  Animated,
  ImageBackground,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';

import Building from '../components/Building';

const { width, height } = Dimensions.get('window');

const HomeMapScreen = () => {
  const navigation = useNavigation();
  
  // Start player at center instead of bottom center
  const playerPosition = useRef(new Animated.ValueXY({ 
    x: width / 2 - 30, 
    y: height / 2 - 40 
  })).current;

  const [isMoving, setIsMoving] = useState(false);
  const playerAnimation = useRef(null);

  const buildings = [
    {
      id: 'store',
      type: 'store',
      position: { x: width * 0.03, y: height * 0.68 },
      size: 190,
      lottieSource: require('../assets/lottie/Solar.json'),
      title: 'Eco Store',
      
    },
    {
      id: 'minigames',
      type: 'minigames',
      position: { x: width * 0.17, y: height * 0.38 },
      size: 160,
      lottieSource: require('../assets/lottie/arcade.json'),
      title: 'Mini Games',
     
    },
    // {
    //   id: 'garden',
    //   type: 'garden',
    //   position: { x: width * 0.65, y: height * 0.8 },
    //   size: 90,
    //   lottieSource: require('../assets/lottie/garden.json'),
    //   title: 'Plant Lab',
      
    // },
    {
      id: 'recycle',
      type: 'recycle',
      position: { x: width * 0.62, y: height * 0.52 },
      size: 130,
      lottieSource: require('../assets/lottie/store.json'),
      title: 'Seed Saver',
      
    },
    {
      id: 'library',
      type: 'library',
      position: { x: width * 0.55, y: height * 0.71},
      size: 155,
      lottieSource: require('../assets/lottie/House2.json'),
      title: 'Quizzes',
    
    },
  ];

  useEffect(() => {
    if (playerAnimation.current) {
      playerAnimation.current.play();
    }
  }, []);

  const movePlayerToBuilding = (building) => {
    if (isMoving) return;

    setIsMoving(true);
    
    // Move to building position (slightly offset for better visual)
    const targetX = building.position.x;
    const targetY = building.position.y ; // Stop near the building, not exactly on it

    // Start walking animation
    if (playerAnimation.current) {
      playerAnimation.current.play(0, 75); // Play walking frames
    }

    Animated.timing(playerPosition, {
      toValue: { x: targetX, y: targetY },
      duration: 2000,
      useNativeDriver: true,
    }).start(() => {
      setIsMoving(false);
      // Return to idle animation
      if (playerAnimation.current) {
        playerAnimation.current.play(0, 0); // Return to first frame (idle)
      }
      navigateToBuilding(building.type);
    });
  };

  const navigateToBuilding = (buildingType) => {
    switch (buildingType) {
      case 'store':
        navigation.navigate('Store');
        break;
      case 'minigames':
        navigation.navigate('MiniGames');
        break;
      case 'garden':
        navigation.navigate('Garden');
        break;
      case 'recycle':
        navigation.navigate('Recycle');
        break;
      case 'library':
        navigation.navigate('Learning');
        break;
      default:
        Alert.alert('Error', 'Building not found!');
    }
  };

  const renderPaths = () => {
    return (
      <View style={styles.pathsContainer}>
        {/* Main horizontal path - more natural looking */}
        {/* <View style={[styles.path, { 
          top: height * 0.5, 
          left: width * 0.1, 
          width: width * 0.8, 
          height: 15 
        }]} /> */}
        
        {/* Vertical path - more natural looking */}
        {/* <View style={[styles.path, { 
          top: height * 0.3, 
          left: width * 0.5, 
          width: 15, 
          height: height * 0.4 
        }]} /> */}
        
        {/* Curved path to garden */}
        {/* <View style={[styles.path, styles.curvedPath, { 
          top: height * 0.55, 
          left: width * 0.4, 
          width: 120, 
          height: 15,
          transform: [{ rotate: '-25deg' }]
        }]} /> */}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/map/farm-city-background.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        {/* Game Title Header */}
        <View style={styles.header}>
          <Text style={styles.gameTitle}>Eco Adventure World</Text>
          
        </View>

        {/* Map Container */}
        <View style={styles.mapContainer}>
          {renderPaths()}
          
          {/* Buildings with Lottie Animations */}
          {buildings.map((building) => (
            <View key={building.id} style={styles.buildingWrapper}>
              {/* Building Title */}
              <View style={[styles.buildingTitleContainer, { 
                left: building.position.x - (-60), 
                top: building.position.y - (-2)
              }]}>
                <Text style={styles.buildingTitle}>{building.title}</Text>
                {/* <Text style={styles.buildingSubtitle}>{building.subtitle}</Text> */}
              </View>
              
              {/* Building Component */}
              <Building
                type={building.type}
                position={building.position}
                size={building.size}
                lottieSource={building.lottieSource}
                onPress={() => movePlayerToBuilding(building)}
              />
            </View>
          ))}

          {/* Player with Lottie Animation */}
          <Animated.View 
            style={[
              styles.playerContainer,
              {
                transform: [
                  { translateX: playerPosition.x },
                  { translateY: playerPosition.y }
                ]
              }
            ]}
          >
            <LottieView
              ref={playerAnimation}
              source={require('../assets/lottie/Boy.json')}
              style={styles.playerAnimation}
              autoPlay={true}
              loop={true}
              resizeMode="cover"
            />
          </Animated.View>

          {/* Natural Decorative Elements */}
          {/* <View style={[styles.tree, { left: width * 0.08, top: height * 0.12 }]} />
          <View style={[styles.tree, { left: width * 0.92, top: height * 0.08 }]} />
          <View style={[styles.tree, { left: width * 0.03, top: height * 0.78 }]} />
          <View style={[styles.tree, { left: width * 0.88, top: height * 0.72 }]} /> */}
          
          {/* Small bushes */}
          {/* <View style={[styles.bush, { left: width * 0.2, top: height * 0.1 }]} />
          <View style={[styles.bush, { left: width * 0.85, top: height * 0.15 }]} />
          <View style={[styles.bush, { left: width * 0.1, top: height * 0.7 }]} /> */}
          
          {/* Pond */}
          {/* <View style={[styles.pond, { left: width * 0.72, top: height * 0.78 }]} /> */}
          
          {/* Rocks */}
          {/* <View style={[styles.rock, { left: width * 0.35, top: height * 0.8 }]} />
          <View style={[styles.rock, { left: width * 0.6, top: height * 0.85 }]} />/// */}
        </View>

        {/* Bottom UI */}
        <View style={styles.bottomUI}>
          <View style={styles.instructions}>
            <Text style={styles.instructionText}>🚀 Tap on buildings to start your eco-adventure!</Text>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEEB',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
    paddingHorizontal: 20,
  },
gameTitle: {
  fontSize: 22,
  fontWeight: '900',
  fontFamily: 'monospace',
  color: '#FFFFFF',
  textAlign: 'center',
  textShadowColor: '#000',
  textShadowOffset: { width: 4, height: 4 },
  textShadowRadius: 0,
  marginBottom: 8,
  letterSpacing: 1,
  textTransform: 'uppercase',
  // Pixel perfect style
  backgroundColor: '#E74C3C',
  paddingHorizontal: 16,
  paddingVertical: 10,
  borderRadius: 4,
  borderWidth: 4,
  borderColor: '#000',
  borderTopColor: '#C0392B',
  borderLeftColor: '#C0392B',
  borderBottomColor: '#922B21',
  borderRightColor: '#922B21',
},
  
  mapContainer: {
    flex: 1,
  },
  buildingWrapper: {
    position: 'absolute',
  },
 buildingTitleContainer: {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  paddingHorizontal: 5,
  paddingVertical: 6,
  borderRadius: 6,
  borderWidth: 2,
  borderColor: '#F59E0B',
  borderBottomWidth: 5,
  borderBottomColor: '#D97706',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 6,
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 25,
  minWidth: 120,
},

buildingTitle: {
  fontSize: 14,
  fontFamily: 'monospace',
  fontWeight: '900',
  color: '#DC2626',
  textAlign: 'center',
  textShadow: '1px 1px 0 #000',
  letterSpacing: 0.5,
  lineHeight: 16,
  textTransform: 'uppercase',
},
  pathsContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  path: {
    position: 'absolute',
    backgroundColor: '#A8D5BA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8BBF9F',
    opacity: 0.8,
  },
  curvedPath: {
    borderRadius: 4,
    opacity: 0.7,
  },
  playerContainer: {
    position: 'absolute',
    width: 70,
    height: 90,
    zIndex: 50,
  },
 playerAnimation: {
  width: 70,
  height: 70,
}
,
  tree: {
    position: 'absolute',
    width: 45,
    height: 70,
    backgroundColor: '#2E8B57',
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
 

  bottomUI: {
  position: 'absolute',
  top: 120,
  left: 0,
  right: 0,
  alignItems: 'center',
  paddingHorizontal: 29,
  // Subtle gamification
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 5 },
  shadowOpacity: 0.3,
  shadowRadius: 10,
  elevation: 8,
  zIndex: 100,
},
  instructions: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  instructionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3748',
    textAlign: 'center',
  },
});

export default HomeMapScreen;