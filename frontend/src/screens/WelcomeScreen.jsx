import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Background with environmental elements */}
      <View style={styles.backgroundElements}>
        <View style={styles.tree1}></View>
        <View style={styles.tree2}></View>
        <View style={styles.bush1}></View>
        <View style={styles.bush2}></View>
        <View style={styles.cloud1}></View>
        <View style={styles.cloud2}></View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Logo/Badge */}
        <View style={styles.ecoBadge}>
          <Text style={styles.badgeText}>🌱</Text>
        </View>

        <Text style={styles.welcome}>Welcome</Text>
        <Text style={styles.title}>
          to <Text style={styles.bold}>VRIKSHAMITRA!</Text>
        </Text>

        <Text style={styles.subtitle}>
          Play, Learn, and Explore with Exciting{"\n"}
          Games, Challenges, Videos, Quizzes!
        </Text>

        {/* Updated Button - Now goes to Register */}
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.buttonText}>Let's Start!</Text>
        </TouchableOpacity>

        {/* Achievement Preview */}
        <View style={styles.achievementPreview}>
          <Text style={styles.achievementTitle}>First Achievements Await!</Text>
          <View style={styles.achievementIcons}>
            <Text style={styles.achievementIcon}>🌿</Text>
            <Text style={styles.achievementIcon}>💧</Text>
            <Text style={styles.achievementIcon}>🐾</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f5c3a'
  },
  backgroundElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  tree1: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    width: 60,
    height: 120,
    backgroundColor: '#2d6a4f',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  tree2: {
    position: 'absolute',
    bottom: 0,
    right: 30,
    width: 50,
    height: 100,
    backgroundColor: '#2d6a4f',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  bush1: {
    position: 'absolute',
    bottom: 0,
    left: '40%',
    width: 80,
    height: 40,
    backgroundColor: '#40916c',
    borderRadius: 20,
  },
  bush2: {
    position: 'absolute',
    bottom: 0,
    right: '30%',
    width: 60,
    height: 35,
    backgroundColor: '#40916c',
    borderRadius: 18,
  },
  cloud1: {
    position: 'absolute',
    top: 80,
    left: 50,
    width: 70,
    height: 30,
    backgroundColor: '#a8dadc',
    borderRadius: 20,
    opacity: 0.8,
  },
  cloud2: {
    position: 'absolute',
    top: 120,
    right: 60,
    width: 90,
    height: 25,
    backgroundColor: '#a8dadc',
    borderRadius: 15,
    opacity: 0.8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  ecoBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffd166',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  badgeText: {
    fontSize: 40,
  },
  welcome: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    marginTop: 5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  bold: {
    fontWeight: 'bold',
    color: '#ffd166',
  },
  subtitle: {
    color: '#e8f4f8',
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  button: {
    backgroundColor: '#FF4D4D',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 40,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold'
  },
  achievementPreview: {
    marginTop: 25,
    alignItems: 'center',
  },
  achievementTitle: {
    color: '#e8f4f8',
    fontSize: 14,
    marginBottom: 10,
    fontWeight: '600',
  },
  achievementIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  achievementIcon: {
    fontSize: 24,
    marginHorizontal: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 20,
  },
});