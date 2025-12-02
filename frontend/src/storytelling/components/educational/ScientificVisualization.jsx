// src/components/educational/ScientificVisualization.jsx

import React, { useState } from 'react';
import { View, Text, Dimensions, TouchableOpacity } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';

const ScientificVisualization = ({ airQualityData, onComplete }) => {
  const [currentVisualization, setCurrentVisualization] = useState('pm25');

  const screenWidth = Dimensions.get('window').width;

  const visualizationData = {
    pm25: {
      chartData: {
        labels: ['1950', '1970', '1990', '2010', '2023'],
        datasets: [{
          data: [45, 68, 52, 38, 32],
          color: () => '#ff6b6b',
        }]
      },
      explanation: "PM2.5 trends show improvement in developed nations but worsening in developing urban areas"
    },
    healthImpact: {
      chartData: {
        labels: ['Lung Cancer', 'Heart Disease', 'Stroke', 'Asthma', 'COPD'],
        datasets: [{
          data: [17, 24, 25, 43, 36]
        }]
      },
      explanation: "Percentage increase in disease risk per 10 μg/m³ PM2.5 increase"
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>The Science Behind Air Pollution</Text>

      {/* Interactive Particle Size Visualization */}
      <View style={styles.particleComparison}>
        <Text style={styles.comparisonTitle}>Particle Size Comparison</Text>
        
        <View style={styles.particleRow}>
          <View style={[styles.particle, styles.pm10]} />
          <Text style={styles.particleLabel}>PM10 (Dust, Pollen)</Text>
          <Text style={styles.particleSize}>≤10μm - Can reach lungs</Text>
        </View>

        <View style={styles.particleRow}>
          <View style={[styles.particle, styles.pm25]} />
          <Text style={styles.particleLabel}>PM2.5 (Combustion, Chemicals)</Text>
          <Text style={styles.particleSize}>≤2.5μm - Enters bloodstream</Text>
        </View>

        <View style={styles.particleRow}>
          <View style={[styles.particle, styles.humanHair]} />
          <Text style={styles.particleLabel}>Human Hair</Text>
          <Text style={styles.particleSize}>50-70μm - For scale comparison</Text>
        </View>
      </View>

      {/* Historical Data Visualization */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Global PM2.5 Trends</Text>
        <LineChart
          data={visualizationData.pm25.chartData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
            style: {
              borderRadius: 16
            }
          }}
          bezier
          style={styles.chart}
        />
        <Text style={styles.chartExplanation}>
          {visualizationData.pm25.explanation}
        </Text>
      </View>

      {/* Source Contribution Analysis */}
      <View style={styles.sourcesContainer}>
        <Text style={styles.sourcesTitle}>Major PM2.5 Sources</Text>
        
        {Object.entries(airQualityData.pm25.sources).map(([source, percentage]) => (
          <View key={source} style={styles.sourceRow}>
            <View style={styles.sourceBarContainer}>
              <View 
                style={[
                  styles.sourceBar, 
                  { width: `${percentage.split('%')[0]}%` }
                ]} 
              />
            </View>
            <Text style={styles.sourceText}>
              {source.charAt(0).toUpperCase() + source.slice(1)}: {percentage}
            </Text>
          </View>
        ))}
      </View>

      {/* Case Study: London Smog */}
      <View style={styles.caseStudy}>
        <Text style={styles.caseStudyTitle}>Historical Case Study: London Smog 1952</Text>
        <View style={styles.caseStudyStats}>
          <Text style={styles.caseStudyStat}>Duration: 5 days</Text>
          <Text style={styles.caseStudyStat}>Visibility: 1 meter</Text>
          <Text style={styles.caseStudyStat}>Deaths: 4,000-12,000 people</Text>
          <Text style={styles.caseStudyStat}>Result: Clean Air Act 1956</Text>
        </View>
        <Text style={styles.caseStudyLesson}>
          This disaster showed that government action can successfully address air pollution
        </Text>
      </View>

      <TouchableOpacity style={styles.continueButton} onPress={onComplete}>
        <Text style={styles.buttonText}>Make Impactful Decisions</Text>
      </TouchableOpacity>
    </View>
  );
};