// components/educational/DecisionMakingModule.jsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const DecisionMakingModule = ({ scenario, onDecision }) => {
  const [selectedChoice, setSelectedChoice] = useState(null);

  const handleChoiceSelect = (choice) => {
    setSelectedChoice(choice);
    
    // Show immediate consequence
    Alert.alert(
      'Consequence',
      choice.consequence,
      [
        {
          text: 'Learn More',
          onPress: () => showEducationalContent(choice)
        },
        {
          text: 'Make This Choice',
          onPress: () => finalizeChoice(choice)
        }
      ]
    );
  };

  const showEducationalContent = (choice) => {
    Alert.alert(
      'Educational Insight',
      choice.educationalContent,
      [{ text: 'OK', onPress: () => finalizeChoice(choice) }]
    );
  };

  const finalizeChoice = (choice) => {
    onDecision({
      choice: choice.id,
      impact: choice.impact,
      nextScene: choice.nextScene
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.scenarioTitle}>{scenario.title}</Text>
      <Text style={styles.scenarioDescription}>{scenario.description}</Text>
      
      <View style={styles.contextCard}>
        <Text style={styles.contextTitle}>Current Situation:</Text>
        <Text style={styles.contextText}>{scenario.context}</Text>
      </View>

      <View style={styles.choicesContainer}>
        <Text style={styles.choicesTitle}>Your Options:</Text>
        
        {scenario.choices.map((choice, index) => (
          <TouchableOpacity
            key={choice.id}
            style={[
              styles.choiceCard,
              selectedChoice?.id === choice.id && styles.choiceCardSelected
            ]}
            onPress={() => handleChoiceSelect(choice)}
          >
            <Text style={styles.choiceText}>{choice.text}</Text>
            
            {/* Impact Preview */}
            <View style={styles.impactPreview}>
              {Object.entries(choice.impact).map(([key, value]) => (
                <Text 
                  key={key} 
                  style={[
                    styles.impactText,
                    value > 0 ? styles.impactPositive : styles.impactNegative
                  ]}
                >
                  {key}: {value > 0 ? '+' : ''}{value}
                </Text>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Real-world Connection */}
      <View style={styles.realWorldConnection}>
        <Text style={styles.connectionTitle}>Real World Connection:</Text>
        <Text style={styles.connectionText}>
          {scenario.realWorldExample}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
  },
  scenarioTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10
  },
  scenarioDescription: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 20
  },
  contextCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20
  },
  contextTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#34495e'
  },
  choicesContainer: {
    marginBottom: 20
  },
  choicesTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50'
  },
  choiceCard: {
    backgroundColor: '#ecf0f1',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent'
  },
  choiceCardSelected: {
    borderColor: '#3498db',
    backgroundColor: '#d6eaf8'
  },
  choiceText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#2c3e50'
  },
  impactPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  impactText: {
    fontSize: 12,
    marginRight: 10,
    padding: 2,
    borderRadius: 4
  },
  impactPositive: {
    backgroundColor: '#d5f4e6',
    color: '#27ae60'
  },
  impactNegative: {
    backgroundColor: '#fadbd8',
    color: '#e74c3c'
  },
  realWorldConnection: {
    backgroundColor: '#e8f6f3',
    padding: 15,
    borderRadius: 10
  },
  connectionTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#16a085'
  }
});

export default DecisionMakingModule;