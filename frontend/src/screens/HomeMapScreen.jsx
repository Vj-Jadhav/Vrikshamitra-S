// src/screens/HomeMapScreen.jsx
import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Alert,
  Animated,
  ImageBackground,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import Sound from 'react-native-sound';

import Building from '../components/Building';

const { width, height } = Dimensions.get('window');

// Enable audio in silent mode
Sound.setCategory('Playback');

const HomeMapScreen = () => {
  const navigation = useNavigation();

  // All hooks must be called unconditionally at the top level
  const playerPosition = useRef(
    new Animated.ValueXY({ x: width / 2 - 30, y: height / 2 - 40 })
  ).current;

  const [isMoving, setIsMoving] = useState(false);
  const [isNarrationPlaying, setIsNarrationPlaying] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  const playerAnimation = useRef(null);
  const bgMusic = useRef(null);
  const clickSound = useRef(null);
  const narrationSound = useRef(null);
  const musicPosition = useRef(0);
  const isScreenFocused = useRef(false);
  const isUnmounting = useRef(false);

  const buildings = [
    {
      id: 'store',
      type: 'store',
      position: { x: width * 0.03, y: height * 0.68 },
      size: 190,
      lottieSource: require('../assets/lottie/Solar.json'),
      title: 'Storytelling',
    },
    {
      id: 'minigames',
      type: 'minigames',
      position: { x: width * 0.17, y: height * 0.38 },
      size: 160,
      lottieSource: require('../assets/lottie/arcade.json'),
      title: 'Mini Games',
    },
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
      position: { x: width * 0.55, y: height * 0.71 },
      size: 155,
      lottieSource: require('../assets/lottie/House2.json'),
      title: 'Quizzes',
    },
  ];

  // Safe sound play function
  const safePlaySound = useCallback((soundRef, onSuccess) => {
    if (soundRef.current && !isUnmounting.current) {
      soundRef.current.play((success) => {
        if (success && onSuccess) {
          onSuccess();
        } else if (!success) {
          console.log('Sound playback failed');
        }
      });
    }
  }, []);

  // Safe sound stop function
  const safeStopSound = useCallback((soundRef) => {
    if (soundRef.current && !isUnmounting.current) {
      soundRef.current.stop();
    }
  }, []);

  // Initialize sounds - useCallback with empty dependency array
  const initializeSounds = useCallback(() => {
    if (isUnmounting.current) return;
    
    try {
      // Initialize background music only if not already loaded
      if (!bgMusic.current) {
        const bgMusicCallback = (error) => {
          if (!error && !isUnmounting.current) {
            bgMusic.current.setVolume(0.5);
            bgMusic.current.setNumberOfLoops(-1);
            setAudioLoaded(true);
            console.log('Background music loaded successfully');
          } else if (error) {
            console.log('Failed to load bgMusic', error);
            if (!isUnmounting.current) {
              setAudioLoaded(false);
            }
          }
        };

        bgMusic.current = Platform.OS === 'android'
          ? new Sound('mapbg.mp3', Sound.MAIN_BUNDLE, bgMusicCallback)
          : new Sound(require('../assets/audio/mapbg.mp3'), bgMusicCallback);
      }

      // Initialize click sound only if not already loaded
      if (!clickSound.current) {
        const clickSoundCallback = (error) => {
          if (error) console.log('Failed to load clickSound', error);
        };

        clickSound.current = Platform.OS === 'android'
          ? new Sound('menu_select.mp3', Sound.MAIN_BUNDLE, clickSoundCallback)
          : new Sound(require('../assets/audio/menu_select.mp3'), clickSoundCallback);
      }

      // Initialize narration sound only if not already loaded
      if (!narrationSound.current) {
        const narrationCallback = (error) => {
          if (error) console.log('Failed to load narrationSound', error);
        };

        narrationSound.current = Platform.OS === 'android'
          ? new Sound('tap.m4a', Sound.MAIN_BUNDLE, narrationCallback)
          : new Sound(require('../assets/audio/tap.m4a'), narrationCallback);
      }

    } catch (error) {
      console.log('Error initializing sounds:', error);
      if (!isUnmounting.current) {
        setAudioLoaded(false);
      }
    }
  }, []);

  // Play background music from current position
  const playBackgroundMusic = useCallback(() => {
    if (bgMusic.current && audioLoaded && !isMusicPlaying && isScreenFocused.current && !isUnmounting.current) {
      // If we have a saved position, seek to it before playing
      if (musicPosition.current > 0) {
        console.log('Resuming music from position:', musicPosition.current);
        bgMusic.current.setCurrentTime(musicPosition.current);
      } else {
        console.log('Starting music from beginning');
      }
      
      safePlaySound(bgMusic, () => {
        if (!isUnmounting.current) {
          setIsMusicPlaying(true);
          console.log('Music started playing');
        }
      });
    }
  }, [audioLoaded, isMusicPlaying, safePlaySound]);

  // Pause background music and save current position
  const pauseBackgroundMusic = useCallback(() => {
    if (bgMusic.current && isMusicPlaying && !isUnmounting.current) {
      // Get current position before pausing
      bgMusic.current.getCurrentTime((seconds) => {
        if (!isUnmounting.current) {
          musicPosition.current = seconds;
          console.log('Music paused at position:', seconds);
        }
      });
      safeStopSound(bgMusic);
      if (!isUnmounting.current) {
        setIsMusicPlaying(false);
      }
      console.log('Music paused');
    }
  }, [isMusicPlaying, safeStopSound]);

  // Stop all sounds completely
  const stopAllSounds = useCallback(() => {
    console.log('Stopping all sounds');
    
    if (bgMusic.current) {
      bgMusic.current.stop();
    }
    if (clickSound.current) {
      clickSound.current.stop();
    }
    if (narrationSound.current) {
      narrationSound.current.stop();
    }
    
    if (!isUnmounting.current) {
      setIsMusicPlaying(false);
      setIsNarrationPlaying(false);
    }
  }, []);

  // Release all sound resources
  const releaseAllSounds = useCallback(() => {
    console.log('Releasing all sound resources');
    
    if (bgMusic.current) {
      bgMusic.current.stop();
      bgMusic.current.release();
      bgMusic.current = null;
    }
    if (clickSound.current) {
      clickSound.current.stop();
      clickSound.current.release();
      clickSound.current = null;
    }
    if (narrationSound.current) {
      narrationSound.current.stop();
      narrationSound.current.release();
      narrationSound.current = null;
    }
    
    if (!isUnmounting.current) {
      setAudioLoaded(false);
      setIsMusicPlaying(false);
      setIsNarrationPlaying(false);
    }
  }, []);

  // Initialize player animation
  useEffect(() => {
    if (playerAnimation.current && !isUnmounting.current) {
      playerAnimation.current.play();
    }
  }, []);

  // Handle screen focus - play music when screen is focused
  useFocusEffect(
    useCallback(() => {
      console.log('HomeMapScreen focused');
      isScreenFocused.current = true;
      isUnmounting.current = false;
      
      // Initialize sounds when screen comes into focus
      initializeSounds();
      
      // Play background music after a short delay to ensure it's loaded
      const musicTimer = setTimeout(() => {
        console.log('Playing/resuming background music');
        playBackgroundMusic();
      }, 300);

      return () => {
        console.log('HomeMapScreen unfocused - stopping all sounds');
        isScreenFocused.current = false;
        
        // Cleanup when screen loses focus
        clearTimeout(musicTimer);
        stopAllSounds();
      };
    }, [initializeSounds, playBackgroundMusic, stopAllSounds])
  );

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      console.log('HomeMapScreen unmounting - releasing all resources');
      isUnmounting.current = true;
      releaseAllSounds();
    };
  }, [releaseAllSounds]);

  const playClickSound = useCallback(() => {
    safeStopSound(clickSound);
    safePlaySound(clickSound);
  }, [safePlaySound, safeStopSound]);

  const playNarration = useCallback(() => {
    if (narrationSound.current && !isNarrationPlaying && !isUnmounting.current) {
      setIsNarrationPlaying(true);
      safeStopSound(narrationSound);
      safePlaySound(narrationSound, () => {
        if (!isUnmounting.current) {
          setIsNarrationPlaying(false);
        }
      });
    }
  }, [isNarrationPlaying, safePlaySound, safeStopSound]);

  const stopNarration = useCallback(() => {
    if (narrationSound.current && isNarrationPlaying) {
      safeStopSound(narrationSound);
      if (!isUnmounting.current) {
        setIsNarrationPlaying(false);
      }
    }
  }, [isNarrationPlaying, safeStopSound]);

  const movePlayerToBuilding = useCallback((building) => {
    if (isMoving || isUnmounting.current) return;

    playClickSound();
    setIsMoving(true);

    const targetX = building.position.x;
    const targetY = building.position.y;

    if (playerAnimation.current) playerAnimation.current.play(0, 75);

    Animated.timing(playerPosition, {
      toValue: { x: targetX, y: targetY },
      duration: 2000,
      useNativeDriver: true,
    }).start(() => {
      if (isUnmounting.current) return;
      
      setIsMoving(false);
      if (playerAnimation.current) playerAnimation.current.play(0, 0);
      
      console.log('Navigating to building - stopping all sounds');
      // Stop all sounds when navigating to building
      stopAllSounds();
      
      // Navigate immediately after stopping sounds
      navigateToBuilding(building.type);
    });
  }, [isMoving, playClickSound, stopAllSounds, playerPosition]);

  const navigateToBuilding = useCallback((type) => {
    if (isUnmounting.current) return;
    
    console.log('Navigating to:', type);
    switch (type) {
      case 'store': 
        navigation.navigate('StorytellingGame'); 
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
  }, [navigation]);

  const renderPaths = () => <View style={styles.pathsContainer} />;

  // Render audio status text conditionally in the JSX, not in hooks
  const renderAudioStatus = () => {
    if (!audioLoaded) {
      return <Text style={styles.audioStatus}>🔇 Audio Loading...</Text>;
    }
    if (isMusicPlaying) {
      return <Text style={styles.audioStatus}>🎵 Music Playing...</Text>;
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/map/farm-city-background.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.header}>
          <Text style={styles.gameTitle}>Eco Adventure World</Text>
          {renderAudioStatus()}
        </View>

        <View style={styles.mapContainer}>
          {renderPaths()}

          {buildings.map((building) => (
            <View key={building.id} style={styles.buildingWrapper}>
              <View style={[styles.buildingTitleContainer, {
                left: building.position.x - (-60),
                top: building.position.y - (-2),
              }]}>
                <Text style={styles.buildingTitle}>{building.title}</Text>
              </View>

              <Building
                type={building.type}
                position={building.position}
                size={building.size}
                lottieSource={building.lottieSource}
                onPress={() => movePlayerToBuilding(building)}
              />
            </View>
          ))}

          <Animated.View style={[
            styles.playerContainer,
            { transform: [
              { translateX: playerPosition.x },
              { translateY: playerPosition.y }
            ]}
          ]}>
            <LottieView
              ref={playerAnimation}
              source={require('../assets/lottie/Boy.json')}
              style={styles.playerAnimation}
              autoPlay
              loop
            />
          </Animated.View>
        </View>

        <View style={styles.bottomUI}>
          <TouchableOpacity
            style={styles.instructions}
            onPress={playNarration}
            onLongPress={stopNarration}
          >
            <Text style={styles.instructionText}>
              {audioLoaded ? '🎧' : '🔇'} Tap on buildings to start your eco-adventure!
              {isNarrationPlaying ? ' 🔈' : ' 🔊'}
            </Text>
            <Text style={styles.narrationHint}>
              {isNarrationPlaying 
                ? 'Playing... (Long press to stop)' 
                : 'Tap to hear instructions'
              }
            </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#87CEEB' },
  background: { flex: 1, width: '100%', height: '100%' },
  header: { 
    position: 'absolute', 
    top: 50, 
    left: 0, 
    right: 0, 
    alignItems: 'center', 
    zIndex: 100, 
    paddingHorizontal: 20 
  },
  gameTitle: {
    fontSize: 22, fontWeight: '900', fontFamily: 'monospace', color: '#FFF', textAlign: 'center',
    textShadowColor: '#000', textShadowOffset: { width: 4, height: 4 }, textShadowRadius: 0,
    marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase',
    backgroundColor: '#E74C3C', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 4,
    borderWidth: 4, borderColor: '#000', borderTopColor: '#C0392B', borderLeftColor: '#C0392B',
    borderBottomColor: '#922B21', borderRightColor: '#922B21'
  },
  audioStatus: {
    fontSize: 12,
    color: '#FFF',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 5,
  },
  mapContainer: { flex: 1 },
  buildingWrapper: { position: 'absolute' },
  buildingTitleContainer: {
    position: 'absolute', top: '50%', left: '50%',
    transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
    backgroundColor: 'rgba(255,255,255,0.95)', paddingHorizontal: 5, paddingVertical: 6,
    borderRadius: 6, borderWidth: 2, borderColor: '#F59E0B', borderBottomWidth: 5, borderBottomColor: '#D97706',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 4,
    elevation: 6, alignItems: 'center', justifyContent: 'center', zIndex: 25, minWidth: 120
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
  pathsContainer: { ...StyleSheet.absoluteFillObject },
  playerContainer: { position: 'absolute', width: 70, height: 90, zIndex: 50 },
  playerAnimation: { width: 70, height: 70 },
  bottomUI: { 
    position: 'absolute', 
    top: 120, 
    left: 0, 
    right: 0, 
    alignItems: 'center', 
    paddingHorizontal: 29, 
    zIndex: 100 
  },
  instructions: {
    backgroundColor: 'rgba(255,255,255,0.95)', 
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
    alignItems: 'center'
  },
  instructionText: { 
    fontSize: 15, 
    fontWeight: '700', 
    color: '#2D3748', 
    textAlign: 'center', 
    marginBottom: 4 
  },
  narrationHint: { 
    fontSize: 12, 
    color: '#666', 
    fontStyle: 'italic', 
    textAlign: 'center' 
  },
});

export default HomeMapScreen;