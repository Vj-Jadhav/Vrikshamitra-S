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
      position: { x: width * 0.15, y: height * 0.25 },
      size: 80,
      lottieSource: require('../assets/lottie/store.json'),
    },
    {
      id: 'minigames',
      type: 'minigames',
      position: { x: width * 0.75, y: height * 0.15 },
      size: 80,
      lottieSource: require('../assets/lottie/arcade.json'),
    },
    {
      id: 'garden',
      type: 'garden',
      position: { x: width * 0.25, y: height * 0.65 },
      size: 80,
      lottieSource: require('../assets/lottie/garden.json'),
    },
    {
      id: 'recycle',
      type: 'recycle',
      position: { x: width * 0.65, y: height * 0.6 },
      size: 80,
      lottieSource: require('../assets/lottie/recycle.json'),
    },
    {
      id: 'library',
      type: 'library',
      position: { x: width * 0.8, y: height * 0.45 },
      size: 80,
      lottieSource: require('../assets/lottie/library.json'),
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
    
    const targetX = building.position.x + building.size / 2 - 30;
    const targetY = building.position.y + building.size / 2 - 40;

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
        {/* Main horizontal path */}
        <View style={[styles.path, { 
          top: height * 0.5, 
          left: width * 0.1, 
          width: width * 0.8, 
          height: 20 
        }]} />
        
        {/* Vertical path */}
        <View style={[styles.path, { 
          top: height * 0.3, 
          left: width * 0.5, 
          width: 20, 
          height: height * 0.4 
        }]} />
        
        {/* Diagonal path to garden */}
        <View style={[styles.path, styles.diagonalPath, { 
          top: height * 0.55, 
          left: width * 0.4, 
          width: 150, 
          transform: [{ rotate: '-30deg' }]
        }]} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/map/farm-city-background.jpg')} // Add your background image
        style={styles.background}
        resizeMode="cover"
      >
        {/* Game Title Header */}
        <View style={styles.header}>
          <Text style={styles.gameTitle}>Eco Adventure World</Text>
          <Text style={styles.gameSubtitle}>Explore, Learn, and Protect Nature!</Text>
        </View>

        {/* Map Container */}
        <View style={styles.mapContainer}>
          {renderPaths()}
          
          {/* Buildings with Lottie Animations */}
          {buildings.map((building) => (
            <Building
              key={building.id}
              type={building.type}
              position={building.position}
              size={building.size}
              lottieSource={building.lottieSource}
              onPress={() => movePlayerToBuilding(building)}
            />
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
              source={require('../assets/lottie/student-walk.json')}
              style={styles.playerAnimation}
              autoPlay={true}
              loop={true}
              resizeMode="cover"
            />
          </Animated.View>

          {/* Decorative Elements */}
          <View style={[styles.tree, { left: width * 0.1, top: height * 0.1 }]} />
          <View style={[styles.tree, { left: width * 0.9, top: height * 0.05 }]} />
          <View style={[styles.tree, { left: width * 0.05, top: height * 0.8 }]} />
          <View style={[styles.tree, { left: width * 0.85, top: height * 0.75 }]} />
          
          {/* Pond */}
          <View style={[styles.pond, { left: width * 0.7, top: height * 0.75 }]} />
        </View>

        {/* Bottom UI */}
        <View style={styles.bottomUI}>
          <View style={styles.instructions}>
            <Text style={styles.instructionText}>Tap on buildings to explore different activities!</Text>
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2D3748',
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
    marginBottom: 8,
  },
  gameSubtitle: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
    fontWeight: '600',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  mapContainer: {
    flex: 1,
  },
  pathsContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  path: {
    position: 'absolute',
    backgroundColor: '#A8E6CF',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#8FD5B0',
  },
  diagonalPath: {
    borderRadius: 5,
  },
  playerContainer: {
    position: 'absolute',
    width: 60,
    height: 80,
    zIndex: 50,
  },
  playerAnimation: {
    width: '100%',
    height: '100%',
  },
  tree: {
    position: 'absolute',
    width: 40,
    height: 60,
    backgroundColor: '#2E8B57',
    borderRadius: 20,
  },
  pond: {
    position: 'absolute',
    width: 80,
    height: 60,
    backgroundColor: '#4ECDC4',
    borderRadius: 40,
    opacity: 0.8,
  },
  bottomUI: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  instructions: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  instructionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    textAlign: 'center',
  },
});

export default HomeMapScreen;