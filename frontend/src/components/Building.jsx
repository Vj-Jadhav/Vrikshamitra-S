// src/components/Building.jsx
import React, { useRef, useEffect } from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

const Building = ({ type, position, onPress, size = 90, lottieSource }) => {
  const animationRef = useRef(null);

  useEffect(() => {
    if (animationRef.current) {
      animationRef.current.play();
    }
  }, []);

  const getBuildingColor = () => {
    switch (type) {
      case 'store':
        return 'rgba(255, 217, 61, 0.1)'; // Very transparent colors
      case 'minigames':
        return 'rgba(107, 207, 127, 0.1)';
      case 'garden':
        return 'rgba(78, 205, 196, 0.1)';
      case 'recycle':
        return 'rgba(149, 225, 211, 0.1)';
      case 'library':
        return 'rgba(255, 154, 118, 0.1)';
      default:
        return 'rgba(204, 204, 204, 0.1)';
    }
  };

  const handlePressIn = () => {
    if (animationRef.current) {
      animationRef.current.play(30, 60); // Play bounce animation
    }
  };

  const handlePressOut = () => {
    if (animationRef.current) {
      animationRef.current.play(0, 120); // Continue normal animation
    }
  };

  return (
    <Pressable
      style={[
        styles.buildingContainer,
        {
          left: position.x,
          top: position.y,
          width: size,
          height: size,
        }
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {/* Very subtle background glow that blends with environment */}
      <View style={[styles.backgroundGlow, { backgroundColor: getBuildingColor() }]} />
      
      {/* Lottie Animation - the main building visual */}
      {lottieSource && (
        <LottieView
          ref={animationRef}
          source={lottieSource}
          style={styles.lottieAnimation}
          autoPlay={true}
          loop={true}
          resizeMode="contain"
        />
      )}
      
      {/* Interactive area indicator (only visible on press) */}
      <View style={styles.interactiveArea} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  buildingContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    // No border, no background color to blend with environment
  },
  backgroundGlow: {
    position: 'absolute',
    width: '120%',
    height: '120%',
    borderRadius: 25,
    opacity: 0.3,
    zIndex: -1,
  },
  lottieAnimation: {
    width: '100%',
    height: '100%',
    // No borders, no background - pure animation
  },
  interactiveArea: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
    backgroundColor: 'transparent',
    // This creates a touch area but remains invisible
  },
});

export default Building;