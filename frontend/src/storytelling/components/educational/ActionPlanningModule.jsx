// src/components/educational/ActionPlanningModule.jsx

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import LocalActionFinder from '../../components/community/LocalActionFinder';

const ActionPlanningModule = ({ 
  userDecisions, 
  realTimeImpact, 
  localAirQuality, 
  onComplete 
}) => {
  const [personalizedPlan, setPersonalizedPlan] = useState([]);
  const [commitments, setCommitments] = useState([]);

  useEffect(() => {
    generatePersonalizedPlan();
  }, [userDecisions]);

  const generatePersonalizedPlan = () => {
    const plan = [];
    
    // Analyze user decisions and suggest improvements
    if (userDecisions.transportation?.includes('car')) {
      plan.push({
        action: 'Switch to public transport 2 days/week',
        impact: 'Reduce CO2 by 200 kg/year',
        difficulty: 'Medium',
        resources: ['Local transit app', 'Bike share programs']
      });
    }

    if (userDecisions.energy === 'conventional') {
      plan.push({
        action: 'Install energy-efficient LED bulbs',
        impact: 'Save 50 kg CO2/year',
        difficulty: 'Easy',
        resources: ['Local hardware stores', 'Energy rebate programs']
      });
    }

    // Add location-specific recommendations
    if (localAirQuality?.pm25 > 35) {
      plan.push({
        action: 'Use air purifier at home',
        impact: 'Reduce indoor PM2.5 by 50-80%',
        difficulty: 'Easy',
        resources: ['HEPA filter recommendations', 'DIY air quality monitor']
      });
    }

    setPersonalizedPlan(plan);
  };

  const handleCommitment = (action, committed) => {
    if (committed) {
      setCommitments(prev => [...prev, {
        ...action,
        committedAt: new Date(),
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week
      }]);
      
      // Track behavioral commitment
      trackBehavioralCommitment(action);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Personal Environmental Action Plan</Text>

      {/* Impact Summary */}
      <View style={styles.impactSummary}>
        <Text style={styles.summaryTitle}>Based on Your Choices</Text>
        <Text style={styles.summaryText}>
          You could reduce your carbon footprint by {' '}
          {Math.round(realTimeImpact?.carbon?.totalCO2 * 0.3 || 0)} kg/year
        </Text>
        <Text style={styles.summaryText}>
          Potential health benefits: {realTimeImpact?.healthBenefits || 0}% risk reduction
        </Text>
      </View>

      {/* Personalized Action Plan */}
      <View style={styles.planContainer}>
        <Text style={styles.planTitle}>Recommended Actions</Text>
        
        {personalizedPlan.map((action, index) => (
          <ActionCard
            key={index}
            action={action}
            onCommit={handleCommitment}
          />
        ))}
      </View>

      {/* Local Community Actions */}
      <View style={styles.communitySection}>
        <Text style={styles.communityTitle}>Join Local Efforts</Text>
        <LocalActionFinder 
          pollutionType="air"
          userLocation={userLocation}
          onActionSelected={handleCommunityAction}
        />
      </View>

      {/* Career and Education Pathways */}
      <View style={styles.careerSection}>
        <Text style={styles.careerTitle}>Turn Passion into Career</Text>
        <TouchableOpacity 
          style={styles.careerCard}
          onPress={() => Linking.openURL('https://www.epa.gov/careers')}
        >
          <Text style={styles.careerRole}>Environmental Scientist</Text>
          <Text style={styles.careerDescription}>
            Research air quality and develop solutions
          </Text>
          <Text style={styles.careerLink}>Explore EPA Careers →</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.careerCard}
          onPress={() => Linking.openURL('https://www.energy.gov/eere/education')}
        >
          <Text style={styles.careerRole}>Renewable Energy Engineer</Text>
          <Text style={styles.careerDescription}>
            Design clean energy systems
          </Text>
          <Text style={styles.careerLink}>Energy Education Programs →</Text>
        </TouchableOpacity>
      </View>

      {/* Commitment and Follow-up */}
      <View style={styles.commitmentSection}>
        <Text style={styles.commitmentTitle}>Make Your Commitment</Text>
        <Text style={styles.commitmentText}>
          Which actions will you take in the next week?
        </Text>
        
        {commitments.map((commitment, index) => (
          <View key={index} style={styles.commitmentCard}>
            <Text style={styles.commitmentAction}>{commitment.action}</Text>
            <Text style={styles.commitmentDeadline}>
              Due: {commitment.deadline.toLocaleDateString()}
            </Text>
          </View>
        ))}

        <TouchableOpacity 
          style={styles.finalButton}
          onPress={() => {
            saveCommitments(commitments);
            scheduleFollowUp();
            onComplete();
          }}
        >
          <Text style={styles.finalButtonText}>
            Commit to Change & Complete Chapter
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};