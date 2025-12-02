import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView 
} from "react-native";

export default function ChallengesScreen() {
  const [activeTab, setActiveTab] = useState("available");

  const challenges = {
    available: [
      { 
        title: "Plant 1 Sapling Today", 
        points: 50, 
        category: "Daily", 
        timeLeft: "5h left",
        participants: 124,
        difficulty: "Easy"
      },
      { 
        title: "Pick Up 10 Plastic Items", 
        points: 40, 
        category: "Daily", 
        timeLeft: "5h left",
        participants: 89,
        difficulty: "Easy"
      },
      { 
        title: "Organize Cleanliness Drive", 
        points: 300, 
        category: "Monthly", 
        timeLeft: "15 days left",
        participants: 23,
        difficulty: "Hard"
      },
    ],
    active: [
      { 
        title: "5km Nature Walk", 
        points: 80, 
        category: "Weekly", 
        progress: 60,
        timeLeft: "3 days left",
        difficulty: "Medium"
      },
      { 
        title: "Reduce Electricity by 10%", 
        points: 200, 
        category: "Monthly", 
        progress: 30,
        timeLeft: "20 days left",
        difficulty: "Medium"
      },
    ],
    completed: [
      { 
        title: "Recycle 3 Plastic Bottles", 
        points: 20, 
        category: "Beginner", 
        completedDate: "Today",
        difficulty: "Easy"
      },
      { 
        title: "Turn Off Lights for 1 Hour", 
        points: 25, 
        category: "Beginner", 
        completedDate: "Yesterday",
        difficulty: "Easy"
      },
    ]
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case "Easy": return "#4CAF50";
      case "Medium": return "#FF9800";
      case "Hard": return "#F44336";
      default: return "#666";
    }
  };

  const ChallengeItem = ({ challenge, type }) => (
    <View style={styles.challengeItem}>
      <View style={styles.challengeHeader}>
        <View style={styles.categoryTag}>
          <Text style={styles.categoryText}>{challenge.category}</Text>
        </View>
        <View style={[styles.difficultyTag, { backgroundColor: getDifficultyColor(challenge.difficulty) }]}>
          <Text style={styles.difficultyText}>{challenge.difficulty}</Text>
        </View>
      </View>
      
      <Text style={styles.challengeTitle}>{challenge.title}</Text>
      
      <View style={styles.challengeMeta}>
        <View style={styles.pointsContainer}>
          <Text style={styles.points}>🪙 {challenge.points}</Text>
        </View>
        
        {challenge.participants && (
          <Text style={styles.participants}>👥 {challenge.participants}</Text>
        )}
        
        {challenge.timeLeft && (
          <Text style={styles.timeLeft}>⏱ {challenge.timeLeft}</Text>
        )}
        
        {challenge.completedDate && (
          <Text style={styles.completedDate}>✅ {challenge.completedDate}</Text>
        )}
      </View>

      {type === "active" && challenge.progress && (
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressPercent}>{challenge.progress}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${challenge.progress}%` }
              ]} 
            />
          </View>
        </View>
      )}

      <TouchableOpacity 
        style={[
          styles.actionButton,
          type === "completed" && styles.completedButton
        ]}
      >
        <Text style={[
          styles.actionButtonText,
          type === "completed" && styles.completedButtonText
        ]}>
          {type === "available" ? "Join Challenge" : 
           type === "active" ? "Continue" : "Completed"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Challenges</Text>
        <Text style={styles.headerSubtitle}>Make a difference, earn rewards</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {["available", "active", "completed"].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab && styles.activeTabText
            ]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
            {activeTab === tab && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Challenges List */}
      <ScrollView style={styles.scrollView}>
        <View style={styles.challengesList}>
          {challenges[activeTab].map((challenge, index) => (
            <ChallengeItem 
              key={index} 
              challenge={challenge} 
              type={activeTab}
            />
          ))}
        </View>
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#F8F9FA",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1B5E20",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 15,
    position: "relative",
  },
  activeTab: {
    // backgroundColor: "#F5FDF7",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  activeTabText: {
    color: "#1B5E20",
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    height: 3,
    width: "60%",
    backgroundColor: "#1B5E20",
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  challengesList: {
    padding: 15,
  },
  challengeItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  challengeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  categoryTag: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#2E7D32",
  },
  difficultyTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    lineHeight: 20,
  },
  challengeMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    flexWrap: "wrap",
  },
  pointsContainer: {
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  points: {
    fontSize: 12,
    fontWeight: "600",
    color: "#EF6C00",
  },
  participants: {
    fontSize: 12,
    color: "#666",
    marginRight: 12,
    marginBottom: 4,
  },
  timeLeft: {
    fontSize: 12,
    color: "#666",
    marginRight: 12,
    marginBottom: 4,
  },
  completedDate: {
    fontSize: 12,
    color: "#4CAF50",
    marginBottom: 4,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: "#666",
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1B5E20",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#F0F0F0",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 2,
  },
  actionButton: {
    backgroundColor: "#1B5E20",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  completedButton: {
    backgroundColor: "#E8F5E9",
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  completedButtonText: {
    color: "#4CAF50",
  },
  bottomSpacer: {
    height: 30,
  },
});
