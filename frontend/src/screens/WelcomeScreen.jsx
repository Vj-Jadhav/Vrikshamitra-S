import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ImageBackground } from 'react-native';
import LottieView from 'lottie-react-native';   // ✅ Added

import { useTranslation } from 'react-i18next';

export default function WelcomeScreen({ navigation }) {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>

      {/* Background image */}
      <ImageBackground
        source={require('../assets/welcomebg.webp')}
        style={styles.bg}
        resizeMode="cover"
      />

      {/* Main Content */}
      <View style={styles.content}>

        {/* Badge
        <View style={styles.ecoBadge}>
          <Text style={styles.badgeText}>🌱</Text>
        </View> */}

        {/* Welcome Heading */}
        <Text style={styles.welcome}>{t('welcome_to')}</Text>

        {/* Vrikshamitra Logo */}
        <View style={styles.titleContainer}>
          <Image
            source={require('../assets/vriksha.png')}
            style={styles.titleImage}
            resizeMode="contain"
          />
        </View>

        {/* 🌿 Plant Growing Animation */}
        <LottieView
          source={require('../assets/Energyplant5.json')}
          autoPlay
          loop
          style={{ width: 250, height: 250, marginTop: 10 }}
        />

        {/* Start Button */}
        <TouchableOpacity
          style={styles.gameButton}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.8}
        >
          <Text style={styles.gameButtonText}>{t('lets_start')}</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f5c3a'
  },
  bg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
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
    backgroundColor: '#5b4511ff',
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

  titleContainer: {
    alignItems: 'center',
    marginTop: 1,
    position: 'relative',
  },

  titleImage: {
    width: 540,    // Adjusted size for logo
    height: 100,
  },

  subtitle: {
    color: '#e8f4f8',
    marginTop: 20,
    fontSize: 18,
    textAlign: 'justify',
    lineHeight: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 12,
    overflow: 'hidden',
    width: 250,
    alignSelf: 'center'
  },

  gameButton: {
    marginTop: 100,
    backgroundColor: '#ff4d6d',
    paddingVertical: 10,
    paddingHorizontal: 50,
    borderRadius: 40,
    alignItems: 'center',

    borderTopWidth: 8,
    borderTopColor: '#ff758f',

    borderBottomWidth: 8,
    borderBottomColor: '#c9184a',

    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  gameButtonText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    fontFamily: 'sans-serif',
  },
});