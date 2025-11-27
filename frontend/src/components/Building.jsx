// src/components/Building.jsx
import React, { useRef, useEffect } from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

const Building = ({ type, position, onPress, size = 80, lottieSource }) => {
  const animationRef = useRef(null);

  useEffect(() => {
    if (animationRef.current) {
      animationRef.current.play();
    }
  }, []);

  const getBuildingInfo = () => {
    switch (type) {
      case 'store':
        return { label: 'Eco Store', color: '#FFD93D' };
      case 'minigames':
        return { label: 'Mini Games', color: '#6BCF7F' };
      case 'garden':
        return { label: 'Plant Lab', color: '#4ECDC4' };
      case 'recycle':
        return { label: 'Recycling Center', color: '#95E1D3' };
      case 'library':
        return { label: 'Learning Library', color: '#FF9A76' };
      default:
        return { label: 'Building', color: '#CCCCCC' };
    }
  };

  const { label, color } = getBuildingInfo();

  const handlePressIn = () => {
    if (animationRef.current) {
      animationRef.current.play(30, 60); // Play bounce animation
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
    >
      <View style={[styles.building, { backgroundColor: color }]}>
        {lottieSource && (
          <LottieView
            ref={animationRef}
            source={lottieSource}
            style={styles.lottieAnimation}
            autoPlay={true}
            loop={true}
            resizeMode="cover"
          />
        )}
        
        <View style={styles.buildingLabelContainer}>
          <Text style={styles.buildingLabel}>{label}</Text>
        </View>
        
        {/* Glow effect */}
        <View style={[styles.glow, { backgroundColor: color }]} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  buildingContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  building: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'hidden',
  },
  lottieAnimation: {
    width: '80%',
    height: '80%',
  },
  buildingLabelContainer: {
    position: 'absolute',
    bottom: -25,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buildingLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2D3748',
    textAlign: 'center',
  },
  glow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 30,
    opacity: 0.2,
    zIndex: -1,
  },
});

export default Building;