// src/components/educational/PersonalConnectionModule.jsx

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Pedometer } from 'expo-sensors';

const PersonalConnectionModule = ({ localAirQuality, onComplete }) => {
  const [breathingExercise, setBreathingExercise] = useState(false);
  const [stepsToday, setStepsToday] = useState(0);
  const [personalExposure, setPersonalExposure] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    startBreathingAwareness();
    trackDailyMovement();
    calculatePersonalExposure();
  }, []);

  const startBreathingAwareness = () => {
    // Guide user through breathing awareness exercise
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start(() => {
      setBreathingExercise(true);
    });
  };

  const trackDailyMovement = async () => {
    // Track how much time user spends in polluted areas
    const { isAvailable } = await Pedometer.isAvailableAsync();
    if (isAvailable) {
      const end = new Date();
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      
      const pedometerResult = await Pedometer.getStepCountAsync(start, end);
      setStepsToday(pedometerResult.steps);
    }
  };

  const calculatePersonalExposure = () => {
    // Calculate user's personal air pollution exposure
    const exposure = {
      indoor: calculateIndoorExposure(),
      commute: calculateCommuteExposure(),
      outdoor: calculateOutdoorExposure(localAirQuality),
      lifetime: calculateLifetimeRisk()
    };
    setPersonalExposure(exposure);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>The Air You Breathe</Text>
      
      {/* Breathing Awareness Exercise */}
      <Animated.View style={[styles.breathingContainer, { opacity: fadeAnim }]}>
        <Text style={styles.breathingText}>
          Take a deep breath. Hold it for 3 seconds. Slowly exhale.
        </Text>
        <Text style={styles.breathingSubtext}>
          You just inhaled approximately {localAirQuality?.pm25 || 'unknown'} μg/m³ of PM2.5 particles
        </Text>
      </Animated.View>

      {/* Personal Exposure Calculator */}
      <View style={styles.exposureCard}>
        <Text style={styles.cardTitle}>Your Daily Air Pollution Exposure</Text>
        
        <View style={styles.exposureMetric}>
          <Text>Indoor: {personalExposure.indoor} μg/m³</Text>
          <Text style={styles.exposureSource}>Home, office, school</Text>
        </View>

        <View style={styles.exposureMetric}>
          <Text>Commute: {personalExposure.commute} μg/m³</Text>
          <Text style={styles.exposureSource}>Transportation exposure</Text>
        </View>

        <View style={styles.exposureMetric}>
          <Text>Outdoor: {personalExposure.outdoor} μg/m³</Text>
          <Text style={styles.exposureSource}>Daily activities</Text>
        </View>

        <View style={styles.healthImpact}>
          <Text style={styles.impactTitle}>Health Impact Estimate</Text>
          <Text>Reduced lung capacity: {calculateLungImpact(personalExposure)}%</Text>
          <Text>Cardiovascular risk: {calculateHeartRisk(personalExposure)}% increase</Text>
        </View>
      </View>

      {/* Real Stories Integration */}
      <View style={styles.storyContainer}>
        <Text style={styles.storyTitle}>Real Impact Stories</Text>
        <TouchableOpacity style={styles.storyCard}>
          <Text style={styles.storyName}>Maria, 14 - Asthma Patient</Text>
          <Text style={styles.storyText}>
            "On bad air days, I can't go to school. The doctor says air pollution makes my asthma worse."
          </Text>
          <Text style={styles.storyStats}>
            Hospital visits: 3x more frequent on high pollution days
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.continueButton} onPress={onComplete}>
        <Text style={styles.buttonText}>Understand the Science</Text>
      </TouchableOpacity>
    </View>
  );
};