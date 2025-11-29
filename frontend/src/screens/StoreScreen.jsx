// src/screens/StoreScreen.jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const StoreScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏪 Eco Store</Text>
        <Text style={styles.subtitle}>Buy eco-friendly items and tools!</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.comingSoon}>Store Features Coming Soon!</Text>
        <Text style={styles.description}>
          This will include eco-items, tools, and rewards for your environmental journey.
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Back to Map</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBEB',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#D97706',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#92400E',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  comingSoon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#B45309',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#78350F',
    textAlign: 'center',
    lineHeight: 24,
  },
  backButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  backButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default StoreScreen;