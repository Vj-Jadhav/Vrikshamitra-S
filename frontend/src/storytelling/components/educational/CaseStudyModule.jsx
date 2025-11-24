// components/educational/CaseStudyModule.jsx
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

const CaseStudyModule = ({ caseData, onComplete }) => {
  const [currentSection, setCurrentSection] = useState('personalStory');

  const sections = {
    personalStory: {
      title: 'Personal Impact',
      content: caseData.personalStory,
      icon: '👤'
    },
    scientificFacts: {
      title: 'Scientific Facts',
      content: caseData.scientificFacts.join('\n\n'),
      icon: '🔬'
    },
    data: {
      title: 'Data & Statistics',
      content: Object.entries(caseData.data).map(([key, value]) => 
        `${key}: ${value}`
      ).join('\n'),
      icon: '📊'
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{caseData.title}</Text>
      
      {/* Section Navigation */}
      <View style={styles.navigation}>
        {Object.entries(sections).map(([key, section]) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.navButton,
              currentSection === key && styles.navButtonActive
            ]}
            onPress={() => setCurrentSection(key)}
          >
            <Text style={styles.navIcon}>{section.icon}</Text>
            <Text style={styles.navText}>{section.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content Display */}
      <ScrollView style={styles.content}>
        <Text style={styles.contentText}>
          {sections[currentSection].content}
        </Text>
        
        {/* Reflection Questions */}
        <View style={styles.reflection}>
          <Text style={styles.reflectionTitle}>Think About It:</Text>
          <Text style={styles.reflectionQuestion}>
            How would this situation affect you or someone you know?
          </Text>
          <Text style={styles.reflectionQuestion}>
            What similar issues exist in your community?
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onComplete({ learned: true })}
        >
          <Text style={styles.actionText}>I Understand - Continue</Text>
        </TouchableOpacity>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center'
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20
  },
  navButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#ecf0f1'
  },
  navButtonActive: {
    backgroundColor: '#3498db'
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 5
  },
  navText: {
    fontSize: 12,
    fontWeight: 'bold'
  },
  content: {
    flex: 1,
    marginBottom: 20
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#34495e'
  },
  reflection: {
    backgroundColor: '#e8f4f8',
    padding: 15,
    borderRadius: 10,
    marginTop: 20
  },
  reflectionTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2980b9'
  },
  reflectionQuestion: {
    fontStyle: 'italic',
    marginBottom: 8,
    color: '#34495e'
  },
  actions: {
    marginTop: 'auto'
  },
  actionButton: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center'
  },
  actionText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  }
});

export default CaseStudyModule;