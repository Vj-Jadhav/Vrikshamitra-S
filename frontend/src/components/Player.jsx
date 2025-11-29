// src/components/Player.jsx
import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

const Player = ({ position }) => {
  return (
    <Animated.View 
      style={[
        styles.player,
        {
          transform: [
            { translateX: position.x },
            { translateY: position.y }
          ]
        }
      ]}
    >
      <View style={styles.playerHead} />
      <View style={styles.playerBody} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  player: {
    position: 'absolute',
    width: 20,
    height: 30,
    alignItems: 'center',
    zIndex: 100,
  },
  playerHead: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF6B6B',
    marginBottom: 2,
  },
  playerBody: {
    width: 20,
    height: 14,
    backgroundColor: '#4ECDC4',
    borderRadius: 4,
  },
});

export default Player;