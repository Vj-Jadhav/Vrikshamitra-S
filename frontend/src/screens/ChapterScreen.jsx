// src/screens/ChapterScreen.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Animated,
  ScrollView,
  Easing,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import LottieView from "lottie-react-native";
import Sound from "react-native-sound";

Sound.setCategory("Playback");

const { width, height } = Dimensions.get("window");

const ChapterScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { chapterId } = route.params;

  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [showChoices, setShowChoices] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [playerStats, setPlayerStats] = useState({
    knowledge: 0,
    airQuality: 0,
    progress: 0,
    worldHealth: 50,
    coins: 0,
    superPowers: 0
  });
  const [achievements, setAchievements] = useState([]);
  const [showContinue, setShowContinue] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [currentReward, setCurrentReward] = useState(null);
  const [activePower, setActivePower] = useState(null);
  const [shakeCount, setShakeCount] = useState(0);
  const [isBreathing, setIsBreathing] = useState(false);
  const [secretUnlocked, setSecretUnlocked] = useState(false);

  // Enhanced Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const rewardScale = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;
  const powerGlow = useRef(new Animated.Value(0)).current;
  const breathAnim = useRef(new Animated.Value(0)).current;
  const secretReveal = useRef(new Animated.Value(0)).current;

  // Sound objects
  const bgSound = useRef(null);
  const sfxSound = useRef(null);
  const voiceSound = useRef(null);

  // Shake detection (simplified without Accelerometer)
  const [lastTap, setLastTap] = useState(0);

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap < 300) {
      activateSuperPower();
      setShakeCount(prev => prev + 1);
      if (shakeCount >= 2 && !secretUnlocked) {
        unlockSecretPower();
      }
    }
    setLastTap(now);
  };

  // Enhanced sound function WITHOUT vibration
  const playSound = (refObj, file, loop = false, volume = 1.0) => {
    if (!isSoundEnabled) return;

    try {
      if (refObj.current) {
        refObj.current.stop();
        refObj.current.release();
      }

      const sound = new Sound(file, Sound.MAIN_BUNDLE, (err) => {
        if (err) {
          console.log("Sound load error:", err);
          return;
        }
        sound.setNumberOfLoops(loop ? -1 : 0);
        sound.setVolume(volume);
        sound.play();
        
        // Special effects for certain sounds WITHOUT VIBRATION
        if (file.includes('celebration')) {
          startConfetti();
        }
        if (file.includes('spirit_appear')) {
          // Visual feedback instead of vibration
          animatePowerGlow();
        }
      });

      refObj.current = sound;
    } catch (error) {
      console.log("Sound play error:", error);
    }
  };

  const stopAllSounds = () => {
    [bgSound, sfxSound, voiceSound].forEach(ref => {
      if (ref.current) {
        try {
          ref.current.stop();
          ref.current.release();
          ref.current = null;
        } catch (error) {
          console.log("Sound stop error:", error);
        }
      }
    });
  };

  // Clean up sounds when component unmounts
  useEffect(() => {
    return () => {
      console.log("ChapterScreen unmounting - stopping all sounds");
      stopAllSounds();
    };
  }, []);

  // Visual feedback instead of vibration
  const animatePowerGlow = () => {
    Animated.sequence([
      Animated.timing(powerGlow, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(powerGlow, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      })
    ]).start();
  };

  // BREATHING EXERCISE MINI-GAME
  const startBreathingExercise = () => {
    setIsBreathing(true);
    playSound(sfxSound, "deep_breath.mp3", false, 0.8);
    
    Animated.sequence([
      Animated.timing(breathAnim, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease)
      }),
      Animated.timing(breathAnim, {
        toValue: 0,
        duration: 4000,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease)
      })
    ]).start(() => {
      setIsBreathing(false);
      applyReward({ coins: 25, airQuality: 10, knowledge: 5 });
      // Visual alert instead of vibration
      showVisualAlert("🌬️ Breathing Master!", "You've cleaned the air with your breath! +10 Air Quality!");
    });
  };

  // Visual alert system
  const showVisualAlert = (title, message) => {
    // Create a temporary visual indicator
    const tempAlert = setTimeout(() => {
      // This could be enhanced with a proper alert component
      console.log(title, message);
    }, 100);
    return () => clearTimeout(tempAlert);
  };

  // SUPER POWERS SYSTEM WITHOUT VIBRATION
  const activateSuperPower = () => {
    const powers = [
      {
        name: "AIR WHISPERER",
        effect: "Cleans 15% of pollution",
        color: "#4ECDC4",
        icon: "🌀"
      },
      {
        name: "TREE PLANTER",
        effect: "Instantly plants 3 virtual trees",
        color: "#27AE60",
        icon: "🌳"
      },
      {
        name: "WIND RIDER",
        effect: "Spreads clean air everywhere",
        color: "#3498DB",
        icon: "💨"
      }
    ];

    const randomPower = powers[Math.floor(Math.random() * powers.length)];
    setActivePower(randomPower);
    
    // Enhanced glow animation instead of vibration
    Animated.sequence([
      Animated.timing(powerGlow, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(200),
      Animated.timing(powerGlow, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(powerGlow, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();

    playSound(sfxSound, "magic_spell.mp3", false, 0.9);
    
    // Enhanced visual feedback
    animatePowerGlow();

    // Apply power effects
    setPlayerStats(prev => ({
      ...prev,
      airQuality: prev.airQuality + 15,
      superPowers: prev.superPowers + 1,
      coins: prev.coins + 10
    }));

    setTimeout(() => setActivePower(null), 3000);
  };

  // SECRET EASTER EGG WITHOUT VIBRATION
  const unlockSecretPower = () => {
    setSecretUnlocked(true);
    playSound(sfxSound, "secret_unlock.mp3", false, 1.0);
    
    // Enhanced visual sequence instead of vibration
    Animated.sequence([
      Animated.timing(secretReveal, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.delay(300),
      Animated.timing(powerGlow, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(powerGlow, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();

    showVisualAlert(
      "🎉 SECRET UNLOCKED!",
      "You discovered the TRIPLE TAP POWER! You're now an Air Guardian Master!"
    );

    applyReward({ 
      coins: 100, 
      achievement: "Secret Finder", 
      superPowers: 5,
      knowledge: 25 
    });
  };

  // Enhanced Chapter Data with Interactive Elements
  const chapter = {
    id: "air",
    title: "BREATH OF LIFE",
    subtitle: "Air Pollution Adventure",
    themeColor: "#4ECDC4",
    darkColor: "#44B3AC",
    spirit: {
      name: "BREEZY",
      description: "Air Guardian",
      icon: "💨",
      color: "#4ECDC4",
      secretMessage: "Double-tap anywhere to activate super powers! 🤫"
    },
    scenes: [
      {
        id: "scene1",
        title: "The Mysterious Haze 🌫️",
        animation: require("../assets/animations/air_scene1.json"),
        duration: 6000,
        text: "Look around! A mysterious gray haze covers our beautiful city. Cars puff smoke, factories create clouds, and machines release invisible pollution! Tap the screen twice to reveal a secret power!",
        backgroundMusic: "city_ambience.mp3",
        soundEffect: "factory_sounds.mp3",
        voiceOver: "scene1_voice.mp3",
        choices: [],
        type: "intro",
        reward: { coins: 10, knowledge: 5 },
        interactive: "DOUBLE_TAP_HINT",
        funFact: "🌍 Every breath you take contains 25 sextillion molecules!"
      },
      {
        id: "scene2",
        title: "Meet Breezy! 🌬️",
        animation: require("../assets/animations/air_spirit.json"),
        duration: 7000,
        text: "Hello little hero! I'm Breezy, the Air Guardian! 👋 Our air needs your help! Try the breathing exercise below - it actually helps clean the air in real life too!",
        backgroundMusic: "mystical_air.mp3",
        soundEffect: "spirit_appear.mp3",
        voiceOver: "aura_voice.mp3",
        choices: [],
        type: "spirit_intro",
        reward: { coins: 15, knowledge: 10, airQuality: 5 },
        interactive: "BREATHING_EXERCISE",
        funFact: "🎈 Your lungs have the surface area of a tennis court!"
      },
      {
        id: "scene3",
        title: "Pollution Detectives 🔍",
        animation: require("../assets/animations/air_pollution.json"),
        duration: 8000,
        text: "Time to become Pollution Detectives! 🕵️‍♂️ Let's track down the sneaky air villains. Tap rapidly to activate your detective powers!",
        backgroundMusic: "tense_music.mp3",
        soundEffect: "pollution_sounds.mp3",
        voiceOver: "scene3_voice.mp3",
        choices: [
          {
            id: "choice1",
            text: "🚗 Car Investigation",
            nextScene: "scene4",
            soundEffect: "choice_select.mp3",
            impact: { knowledge: 15, airQuality: 5 },
            reward: { coins: 20 },
            description: "Follow the smoke trails! +5 Air Quality",
            specialEffect: "CAR_HORN"
          },
          {
            id: "choice2",
            text: "🏭 Factory Mystery",
            nextScene: "scene5",
            soundEffect: "choice_select.mp3",
            impact: { knowledge: 15, progress: 10 },
            reward: { coins: 20 },
            description: "Solve the cloud puzzle! +10 Progress",
            specialEffect: "FACTORY_WHISTLE"
          },
        ],
        type: "educational",
        reward: { coins: 25, knowledge: 10 },
        interactive: "SHAKE_DETECTION",
        funFact: "🔍 Pollution particles are so small, 30 could fit on a hair!"
      },
      {
        id: "scene4",
        title: "Car Transformation 🚗→🚲",
        animation: require("../assets/animations/vehicle_pollution.json"),
        duration: 7000,
        text: "AMAZING DISCOVERY! 🎯 Cars can transform! Watch as this car turns into a bicycle! Long press the animation to speed up the transformation!",
        backgroundMusic: "urban_traffic.mp3",
        soundEffect: "car_engine.mp3",
        voiceOver: "scene4_voice.mp3",
        choices: [
          {
            id: "choice3",
            text: "🌀 Activate Clean Transport",
            nextScene: "scene6",
            soundEffect: "transformation.mp3",
            impact: { knowledge: 10, airQuality: 15, worldHealth: 5 },
            reward: { coins: 30 },
            description: "Transformation complete! +15 Air Quality!",
            specialEffect: "TRANSFORMATION"
          }
        ],
        type: "interactive",
        reward: { coins: 20, knowledge: 8 },
        interactive: "LONG_PRESS",
        funFact: "🚲 One bike ride saves enough energy to power a TV for 3 hours!"
      },
      {
        id: "scene5",
        title: "Factory Makeover 🏭✨",
        animation: require("../assets/animations/electric_car.json"),
        duration: 7000,
        text: "INCREDIBLE! Factories are getting a makeover! 🌟 Solar panels are appearing, filters are activating! Swipe left on the factory to clean it faster!",
        backgroundMusic: "industrial_ambience.mp3",
        soundEffect: "factory_machinery.mp3",
        voiceOver: "scene5_voice.mp3",
        choices: [
          {
            id: "choice4",
            text: "🌞 Install Solar Power",
            nextScene: "scene6",
            soundEffect: "solar_power.mp3",
            impact: { knowledge: 10, worldHealth: 10, progress: 15 },
            reward: { coins: 30 },
            description: "Solar activated! +10 World Health!",
            specialEffect: "SOLAR_GLOW"
          }
        ],
        type: "interactive",
        reward: { coins: 20, knowledge: 8 },
        interactive: "SWIPE_CLEAN",
        funFact: "☀️ One hour of sunlight could power Earth for a year!"
      },
      {
        id: "scene6",
        title: "Air Hero Ceremony 🏆",
        animation: require("../assets/animations/clean_air.json"),
        duration: 8000,
        text: "WOW! 🌟 You've reached Air Hero status! The city is celebrating! Touch and hold the celebration to make it even more festive!",
        backgroundMusic: "hopeful_music.mp3",
        soundEffect: "birds_chirping.mp3",
        voiceOver: "scene6_voice.mp3",
        choices: [
          {
            id: "choice5",
            text: "🎊 Launch Celebration",
            nextScene: "end",
            soundEffect: "fireworks.mp3",
            impact: { worldHealth: 20, airQuality: 25, progress: 30, knowledge: 15 },
            reward: { coins: 50 },
            description: "City-wide celebration! +25 Air Quality!",
            specialEffect: "FIREWORKS"
          }
        ],
        type: "celebration",
        reward: { coins: 40, knowledge: 12 },
        interactive: "TOUCH_HOLD",
        funFact: "🎆 Celebrating clean air makes everyone healthier and happier!"
      },
      {
        id: "end",
        title: "Mission: ACCOMPLISHED! 🚀",
        animation: require("../assets/animations/success.json"),
        duration: 9000,
        text: "CONGRATULATIONS, ULTIMATE AIR HERO! 🏆 You've transformed the city! Your super powers are now permanent! Try double-tapping one more time for a final surprise!",
        backgroundMusic: "victory_music.mp3",
        soundEffect: "celebration.mp3",
        voiceOver: "end_voice.mp3",
        choices: [
          {
            id: "final_choice",
            text: "🌍 Continue Adventure",
            nextScene: "home",
            soundEffect: "portal_open.mp3",
            reward: { coins: 100 },
            description: "Your journey continues...",
            specialEffect: "PORTAL"
          }
        ],
        type: "completion",
        reward: { coins: 100, achievement: "Ultimate Air Hero", knowledge: 20, superPowers: 10 },
        interactive: "FINAL_SURPRISE",
        funFact: "🌟 You've inspired real change! Share your knowledge with the world!"
      }
    ]
  };

  const currentScene = chapter.scenes[currentSceneIndex];

  // Enhanced scene audio with interactive triggers
  const playSceneAudio = () => {
    stopAllSounds();

    if (currentScene.backgroundMusic) {
      playSound(bgSound, currentScene.backgroundMusic, true, 0.5);
    }

    if (currentScene.soundEffect) {
      playSound(sfxSound, currentScene.soundEffect, false, 0.8);
    }

    if (currentScene.voiceOver) {
      setIsPlayingVoice(true);
      playSound(voiceSound, currentScene.voiceOver, false, 1.0);
      
      const voiceTimer = setTimeout(() => {
        setIsPlayingVoice(false);
        if (currentScene.choices.length === 0) {
          setShowContinue(true);
        } else {
          setShowChoices(true);
        }
      }, currentScene.duration);
      
      return () => clearTimeout(voiceTimer);
    } else {
      setTimeout(() => {
        if (currentScene.choices.length === 0) {
          setShowContinue(true);
        } else {
          setShowChoices(true);
        }
      }, 1000);
    }
  };

  // CONFETTI EFFECT
  const startConfetti = () => {
    Animated.sequence([
      Animated.timing(confettiAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(confettiAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();
  };

  // REWARD SYSTEM with enhanced effects (NO VIBRATION)
  const showRewardAnimation = (reward) => {
    setCurrentReward(reward);
    setShowReward(true);
    
    Animated.sequence([
      Animated.timing(rewardScale, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.bounce
      }),
      Animated.timing(confettiAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();

    playSound(sfxSound, "achievement.mp3", false, 1.0);
    
    // Enhanced visual feedback instead of vibration
    animatePowerGlow();

    setTimeout(() => {
      Animated.timing(rewardScale, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowReward(false));
    }, 3000);
  };

  const applyReward = (reward) => {
    setPlayerStats(prev => ({
      ...prev,
      ...Object.keys(reward).reduce((acc, key) => {
        if (key !== 'achievement') {
          acc[key] = (prev[key] || 0) + reward[key];
        }
        return acc;
      }, {})
    }));

    if (reward.achievement && !achievements.includes(reward.achievement)) {
      setAchievements(prev => [...prev, reward.achievement]);
      showRewardAnimation(reward);
    } else if (reward.coins > 0 || reward.knowledge > 0) {
      showRewardAnimation(reward);
    }
  };

  // Interactive gesture handlers WITHOUT VIBRATION
  const handleLongPress = () => {
    if (currentScene.interactive === "LONG_PRESS") {
      // Visual feedback instead of vibration
      animatePowerGlow();
      playSound(sfxSound, "speed_up.mp3", false, 0.8);
      applyReward({ coins: 5, knowledge: 2 });
    }
  };

  const handleSwipe = () => {
    if (currentScene.interactive === "SWIPE_CLEAN") {
      // Visual feedback instead of vibration
      animatePowerGlow();
      playSound(sfxSound, "clean_swipe.mp3", false, 0.7);
      applyReward({ coins: 8, airQuality: 3 });
    }
  };

  // Scene management
  useEffect(() => {
    if (isSoundEnabled) {
      playSceneAudio();
    }

    setShowChoices(false);
    setShowContinue(false);

    // Reset animations
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    bounceAnim.setValue(0);

    // Enhanced entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic)
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic)
      }),
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic)
      })
    ]).start();

    if (currentScene.reward) {
      const rewardTimer = setTimeout(() => {
        applyReward(currentScene.reward);
      }, 2000);
      return () => clearTimeout(rewardTimer);
    }
  }, [currentSceneIndex, isSoundEnabled]);

  const goNext = () => {
    animateButtonPress();
    playSound(sfxSound, "button_click.mp3", false, 0.8);
    
    stopAllSounds();
    setShowChoices(false);
    setShowContinue(false);

    if (currentSceneIndex < chapter.scenes.length - 1) {
      setCurrentSceneIndex(prev => prev + 1);
    } else {
      stopAllSounds();
      navigation.goBack();
    }
  };

  const onChoice = (choice) => {
    animateButtonPress();
    
    if (choice.soundEffect) {
      playSound(sfxSound, choice.soundEffect, false, 0.9);
    }

    // Special effects for choices WITHOUT VIBRATION
    if (choice.specialEffect === "FIREWORKS") {
      startConfetti();
      // Visual feedback instead of vibration
      animatePowerGlow();
    }

    if (choice.impact) {
      setPlayerStats(prev => ({
        ...prev,
        ...Object.keys(choice.impact).reduce((acc, key) => {
          acc[key] = (prev[key] || 0) + choice.impact[key];
          return acc;
        }, {})
      }));
    }

    if (choice.reward) {
      applyReward(choice.reward);
    }

    if (choice.nextScene === "home") {
      stopAllSounds();
      navigation.goBack();
    } else {
      const nextIndex = chapter.scenes.findIndex(
        scene => scene.id === choice.nextScene
      );
      if (nextIndex !== -1) {
        stopAllSounds();
        setShowChoices(false);
        setShowContinue(false);
        setCurrentSceneIndex(nextIndex);
      }
    }
  };

  const toggleSound = () => {
    animateButtonPress();
    const newState = !isSoundEnabled;
    setIsSoundEnabled(newState);
    if (!newState) {
      stopAllSounds();
    } else {
      playSceneAudio();
    }
  };

  const handleBackPress = () => {
    animateButtonPress();
    stopAllSounds();
    navigation.goBack();
  };

  const animateButtonPress = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Animation interpolations
  const bounceInterpolate = bounceAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -20, 0]
  });

  const breathScale = breathAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3]
  });

  const glowOpacity = powerGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6]
  });

  // UI Components
  const StatBar = ({ label, value, max = 100, color, icon }) => (
    <View style={styles.statBarContainer}>
      <Text style={styles.statLabel}>{icon}</Text>
      <View style={styles.statBarBackground}>
        <View 
          style={[
            styles.statBarFill, 
            { 
              width: `${Math.min((value / max) * 100, 100)}%`,
              backgroundColor: color
            }
          ]} 
        />
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );

  const PixelCard = ({ children, style }) => (
    <View style={[styles.pixelBorder, style]}>
      <View style={styles.pixelCardInner}>
        {children}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={chapter.themeColor} barStyle="dark-content" />
      
      {/* SECRET POWER INDICATOR */}
      {secretUnlocked && (
        <Animated.View 
          style={[
            styles.secretIndicator,
            { opacity: secretReveal }
          ]}
        >
          <Text style={styles.secretText}>🔓 SECRET POWER UNLOCKED!</Text>
        </Animated.View>
      )}

      {/* ACTIVE POWER DISPLAY */}
      {activePower && (
        <Animated.View 
          style={[
            styles.powerDisplay,
            { backgroundColor: activePower.color, opacity: glowOpacity }
          ]}
        >
          <Text style={styles.powerIcon}>{activePower.icon}</Text>
          <Text style={styles.powerName}>{activePower.name}</Text>
          <Text style={styles.powerEffect}>{activePower.effect}</Text>
        </Animated.View>
      )}

      {/* REWARD POPUP */}
      {showReward && currentReward && (
        <Animated.View 
          style={[
            styles.rewardContainer,
            {
              transform: [{ scale: rewardScale }],
              opacity: rewardScale
            }
          ]}
        >
          <View style={styles.rewardCard}>
            <Text style={styles.rewardTitle}>🎉 POWER UP! 🎉</Text>
            <Text style={styles.rewardSubtitle}>You earned rewards!</Text>
            
            <View style={styles.rewardItems}>
              {currentReward.coins > 0 && (
                <View style={styles.rewardItem}>
                  <Text style={styles.rewardIcon}>🪙</Text>
                  <Text style={styles.rewardText}>+{currentReward.coins} Coins</Text>
                </View>
              )}
              {currentReward.knowledge > 0 && (
                <View style={styles.rewardItem}>
                  <Text style={styles.rewardIcon}>🧠</Text>
                  <Text style={styles.rewardText}>+{currentReward.knowledge} Knowledge</Text>
                </View>
              )}
              {currentReward.superPowers > 0 && (
                <View style={styles.rewardItem}>
                  <Text style={styles.rewardIcon}>⚡</Text>
                  <Text style={styles.rewardText}>+{currentReward.superPowers} Super Powers</Text>
                </View>
              )}
              {currentReward.achievement && (
                <View style={styles.rewardItem}>
                  <Text style={styles.rewardIcon}>🏆</Text>
                  <Text style={styles.rewardText}>{currentReward.achievement}</Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>
      )}
      
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: chapter.themeColor }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.chapterTitle}>{chapter.title}</Text>
          <Text style={styles.chapterSubtitle}>{chapter.subtitle}</Text>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.soundButton}
            onPress={toggleSound}
          >
            <Text style={styles.soundButtonText}>
              {isSoundEnabled ? '🔊' : '🔇'}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.coinContainer}>
            <Text style={styles.coinIcon}>🪙</Text>
            <Text style={styles.coinText}>{playerStats.coins}</Text>
          </View>
        </View>
      </View>

      {/* PROGRESS SECTION */}
      <View style={styles.progressSection}>
        <View style={styles.progressInfo}>
          <View style={styles.spiritBadge}>
            <Text style={styles.spiritIcon}>{chapter.spirit.icon}</Text>
            <Text style={styles.spiritName}>{chapter.spirit.name}</Text>
          </View>
          <Text style={styles.progressText}>
            {currentSceneIndex + 1}/{chapter.scenes.length}
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <Animated.View 
              style={[
                styles.progressBarFill, 
                { 
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%']
                  })
                }
              ]} 
            />
          </View>
        </View>
      </View>

      {/* MAIN CONTENT - INTERACTIVE AREA */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* INTERACTIVE ANIMATION AREA */}
        <TouchableOpacity 
          activeOpacity={1}
          onPress={handleDoubleTap}
          onLongPress={handleLongPress}
        >
          <Animated.View 
            style={[
              styles.animationContainer,
              {
                transform: [{ translateY: bounceInterpolate }]
              }
            ]}
          >
            <LottieView
              source={currentScene.animation}
              autoPlay
              loop={currentScene.type !== "completion"}
              style={styles.animation}
            />
            
            {/* BREATHING EXERCISE OVERLAY */}
            {currentScene.interactive === "BREATHING_EXERCISE" && !isBreathing && (
              <TouchableOpacity 
                style={styles.breathingButton}
                onPress={startBreathingExercise}
              >
                <Text style={styles.breathingText}>🌬️ Tap to Breathe!</Text>
              </TouchableOpacity>
            )}

            {isBreathing && (
              <Animated.View 
                style={[
                  styles.breathingCircle,
                  { transform: [{ scale: breathScale }] }
                ]}
              >
                <Text style={styles.breathingGuide}>Breathe IN... and OUT...</Text>
              </Animated.View>
            )}
          </Animated.View>
        </TouchableOpacity>

        {/* STORY CONTENT */}
        <Animated.View 
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <PixelCard style={styles.dialogCard}>
            <View style={styles.sceneHeader}>
              <Text style={styles.sceneTitle}>{currentScene.title}</Text>
              {isPlayingVoice && (
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <Text style={styles.voiceIndicator}>🎤 {chapter.spirit.name} is speaking...</Text>
                </Animated.View>
              )}
            </View>
            
            <Text style={styles.storyText}>{currentScene.text}</Text>
            
            {/* INTERACTIVE HINT */}
            {currentScene.interactive && (
              <View style={styles.interactiveHint}>
                <Text style={styles.hintIcon}>💡</Text>
                <Text style={styles.hintText}>
                  {currentScene.interactive === "DOUBLE_TAP_HINT" && chapter.spirit.secretMessage}
                  {currentScene.interactive === "BREATHING_EXERCISE" && "Try the breathing exercise above! 🌬️"}
                  {currentScene.interactive === "SHAKE_DETECTION" && "Tap rapidly to activate detective mode! 🔍"}
                  {currentScene.interactive === "LONG_PRESS" && "Long press the animation for turbo boost! 🚀"}
                  {currentScene.interactive === "SWIPE_CLEAN" && "Swipe left on factory to clean faster! ✨"}
                  {currentScene.interactive === "TOUCH_HOLD" && "Touch and hold celebration for extra fun! 🎉"}
                  {currentScene.interactive === "FINAL_SURPRISE" && "Double-tap for one last surprise! 🎁"}
                </Text>
              </View>
            )}
            
            {/* FUN FACT */}
            {currentScene.funFact && (
              <View style={styles.funFactContainer}>
                <Text style={styles.funFactIcon}>💡</Text>
                <Text style={styles.funFactText}>{currentScene.funFact}</Text>
              </View>
            )}
          </PixelCard>

          {/* CHOICES */}
          {showChoices && currentScene.choices.length > 0 && (
            <View style={styles.choicesContainer}>
              <Text style={styles.choicesTitle}>Choose Your Action!</Text>
              {currentScene.choices.map((choice) => (
                <Animated.View
                  key={choice.id}
                  style={{ transform: [{ scale: buttonScale }] }}
                >
                  <TouchableOpacity
                    style={[styles.choiceButton, { backgroundColor: chapter.themeColor }]}
                    onPress={() => onChoice(choice)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.choiceText}>{choice.text}</Text>
                    {choice.description && (
                      <Text style={styles.choiceDescription}>{choice.description}</Text>
                    )}
                    {choice.impact && (
                      <View style={styles.impactContainer}>
                        {choice.impact.knowledge > 0 && (
                          <Text style={styles.impactText}>+{choice.impact.knowledge} 🧠</Text>
                        )}
                        {choice.impact.airQuality > 0 && (
                          <Text style={styles.impactText}>+{choice.impact.airQuality} 💨</Text>
                        )}
                        {choice.impact.worldHealth > 0 && (
                          <Text style={styles.impactText}>+{choice.impact.worldHealth} 🌍</Text>
                        )}
                        {choice.reward?.coins > 0 && (
                          <Text style={styles.coinReward}>+{choice.reward.coins} 🪙</Text>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          )}

          {/* CONTINUE BUTTON */}
          {showContinue && currentScene.choices.length === 0 && currentScene.id !== "end" && (
            <Animated.View 
              style={[
                styles.continueContainer,
                { transform: [{ scale: buttonScale }] }
              ]}
            >
              <TouchableOpacity
                style={[styles.continueButton, { backgroundColor: chapter.themeColor }]}
                onPress={goNext}
                activeOpacity={0.7}
              >
                <Text style={styles.continueText}>
                  {currentSceneIndex < chapter.scenes.length - 1 ? 'Next Adventure →' : 'Mission Complete! 🎊'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* ACHIEVEMENTS */}
          {achievements.length > 0 && (
            <View style={styles.achievementsContainer}>
              <Text style={styles.achievementsTitle}>🏆 Your Super Powers!</Text>
              {achievements.map((achievement, index) => (
                <Text key={index} style={styles.achievementText}>⭐ {achievement}</Text>
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* ENHANCED STATS BAR */}
      <View style={styles.statsBar}>
        <StatBar 
          label="SMARTS" 
          value={playerStats.knowledge} 
          color="#FF9F1C"
          icon="🧠"
        />
        <StatBar 
          label="CLEAN AIR" 
          value={playerStats.airQuality} 
          color="#2EC4B6"
          icon="💨"
        />
        <StatBar 
          label="SUPER POWERS" 
          value={playerStats.superPowers} 
          color="#9B59B6"
          icon="⚡"
        />
        <StatBar 
          label="EARTH POWER" 
          value={playerStats.worldHealth} 
          color="#E71D36"
          icon="🌍"
        />
      </View>
    </View>
  );
};

// ... (styles remain exactly the same as previous version)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  // Secret & Power Styles
  secretIndicator: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: '#FFD700',
    padding: 10,
    zIndex: 1000,
  },
  secretText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  powerDisplay: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  powerIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  powerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  powerEffect: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  // Reward Styles
  rewardContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  rewardCard: {
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  rewardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
  },
  rewardSubtitle: {
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 20,
  },
  rewardItems: {
    alignItems: 'center',
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rewardIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  rewardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  // Interactive Elements
  breathingButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(78, 205, 196, 0.9)',
    padding: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  breathingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  breathingCircle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(78, 205, 196, 0.3)',
    borderWidth: 3,
    borderColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    top: '40%',
  },
  breathingGuide: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4ECDC4',
    textAlign: 'center',
  },
  interactiveHint: {
    backgroundColor: 'rgba(155, 89, 182, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#9B59B6',
    flexDirection: 'row',
    alignItems: 'center',
  },
  hintIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  hintText: {
    fontSize: 12,
    color: '#8E44AD',
    fontWeight: '600',
    flex: 1,
    fontStyle: 'italic',
  },
  // Rest of the styles remain the same...
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  backButton: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  chapterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    letterSpacing: 1,
  },
  chapterSubtitle: {
    fontSize: 12,
    color: '#2C3E50',
    opacity: 0.9,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  soundButton: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  soundButtonText: {
    fontSize: 18,
  },
  coinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 8,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  coinIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  coinText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  progressSection: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    margin: 12,
    marginBottom: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    color: '#6C757D',
    fontWeight: 'bold',
  },
  spiritBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    padding: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4ECDC4',
  },
  spiritIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  spiritName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  progressBarContainer: {
    alignItems: 'center',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E9ECEF',
    width: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 10,
  },
  animationContainer: {
    height: height * 0.3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  pixelBorder: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  pixelCardInner: {
    padding: 20,
    borderRadius: 16,
  },
  dialogCard: {
    marginBottom: 16,
  },
  sceneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sceneTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
  },
  voiceIndicator: {
    fontSize: 10,
    color: '#4ECDC4',
    fontWeight: 'bold',
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    padding: 6,
    borderRadius: 8,
  },
  storyText: {
    fontSize: 16,
    color: '#495057',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 12,
  },
  funFactContainer: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FFC107',
    flexDirection: 'row',
    alignItems: 'center',
  },
  funFactIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  funFactText: {
    fontSize: 12,
    color: '#856404',
    fontWeight: '600',
    flex: 1,
    fontStyle: 'italic',
  },
  choicesContainer: {
    marginBottom: 16,
  },
  choicesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
    textAlign: 'center',
  },
  choiceButton: {
    padding: 16,
    marginBottom: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  choiceText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  choiceDescription: {
    fontSize: 11,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
    opacity: 0.9,
    fontStyle: 'italic',
  },
  impactContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  impactText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  coinReward: {
    fontSize: 10,
    color: '#FFD700',
    fontWeight: 'bold',
    backgroundColor: 'rgba(255,215,0,0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  continueContainer: {
    marginBottom: 16,
  },
  continueButton: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  continueText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  achievementsContainer: {
    backgroundColor: 'rgba(255,215,0,0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFD700',
    marginTop: 8,
  },
  achievementsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 6,
  },
  achievementText: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  statsBar: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBarContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statLabel: {
    fontSize: 16,
    marginBottom: 4,
  },
  statBarBackground: {
    width: '100%',
    height: 6,
    backgroundColor: '#E9ECEF',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 2,
  },
  statBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  statValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
});

export default ChapterScreen;