/** @format */

// frontend/src/screens/LearningModuleScreen.jsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function LearningModuleScreen({ navigation }) {
  const [allLessons, setAllLessons] = useState([]);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [loadingLessons, setLoadingLessons] = useState(true);
  const [loading, setLoading] = useState(false);

  // 🚀 1. FETCH ALL MODULES FROM DATABASE
  const BACKEND_URL = "http://192.168.31.213:5000/api/learningmodules";
  // Android Emulator

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoadingLessons(true);
        const res = await axios.get(BACKEND_URL);
        console.log("Fetched modules:", res.data); // Debug log
        setAllLessons(res.data); // Array of lessons from DB
      } catch (err) {
        console.log("Error fetching modules:", err);
        Alert.alert("Error", "Failed to load learning modules.");
      } finally {
        setLoadingLessons(false);
      }
    };

    fetchModules();
  }, []);

  // 🚀 2. LOAD COMPLETED MODULES FROM LOCAL STORAGE
  useEffect(() => {
    const loadCompletedModules = async () => {
      try {
        const data = await AsyncStorage.getItem("completedLessons");
        console.log("Loaded completed lessons:", data); // Debug log
        setCompletedLessons(data ? JSON.parse(data) : []);
      } catch (error) {
        console.error("Error loading completed lessons:", error);
      }
    };
    loadCompletedModules();
  }, []);

  // 🚀 3. CALCULATE PROGRESS
  useEffect(() => {
    if (allLessons.length === 0) {
      setProgressPercentage(0);
      return;
    }

    const percent = (completedLessons.length / allLessons.length) * 100;
    setProgressPercentage(Math.min(parseFloat(percent.toFixed(1)), 100));
  }, [allLessons, completedLessons]);

  // 🚀 4. GO TO MODULE
  const handleModulePress = (lesson) => {
    navigation.navigate("LearningScreen", {
      moduleDetails: lesson,
      onComplete: async () => {
        try {
          const updated = [...new Set([...completedLessons, lesson.id])];
          setCompletedLessons(updated);
          await AsyncStorage.setItem(
            "completedLessons",
            JSON.stringify(updated)
          );
          console.log("Lesson completed:", lesson.id); // Debug log
        } catch (error) {
          console.error("Error saving completed lesson:", error);
        }
      },
    });
  };

  // 🚀 5. CONTINUE BUTTON
  const handleContinue = () => {
    if (allLessons.length === 0) {
      Alert.alert("No modules available");
      return;
    }

    const nextModule = allLessons.find(
      (lesson) => !completedLessons.includes(lesson.id)
    );

    if (nextModule) {
      handleModulePress(nextModule);
    } else {
      Alert.alert("Congratulations!", "All modules completed!");
    }
  };

  // 🚀 SHOW LOADER WHILE FETCHING FROM DATABASE
  if (loadingLessons) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading learning modules...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* 🌟 HEADER */}
      <View style={styles.header}>
        <Text style={styles.subtitle}>Explorer</Text>
        <Text style={styles.title}>Learning Modules</Text>
      </View>

      {/* 🌟 PROGRESS CARD */}
      <LinearGradient
        colors={["#4f46e5", "#6366f1"]}
        style={styles.progressCard}>
        <Text style={styles.progressTitle}>Your Progress</Text>
        <Text style={styles.progressText}>
          {progressPercentage}% Completed ({completedLessons.length}/
          {allLessons.length} modules)
        </Text>

        {/* Continue Button */}
        <TouchableOpacity
          onPress={handleContinue}
          style={styles.continueButton}>
          <Text style={styles.continueButtonText}>Continue Learning →</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* 🌟 MODULE LIST */}
      <View style={styles.modulesContainer}>
        {allLessons.length === 0 ? (
          <Text style={styles.noModulesText}>
            No learning modules available
          </Text>
        ) : (
          allLessons.map((lesson) => (
            <TouchableOpacity
              key={lesson.id || lesson._id}
              style={styles.moduleCard}
              onPress={() => handleModulePress(lesson)}>
              <Image
                source={{
                  uri: lesson.imageUrl || "https://via.placeholder.com/80",
                }}
                style={styles.moduleImage}
                onError={(e) =>
                  console.log("Image load error:", e.nativeEvent.error)
                }
              />

              <View style={styles.moduleInfo}>
                <Text style={styles.moduleTitle}>
                  {lesson.title || "Untitled Module"}
                </Text>
                <Text style={styles.moduleDetails}>
                  {lesson.duration || "Unknown duration"} • {lesson.points || 0}{" "}
                  Points
                </Text>
                <Text style={styles.moduleCategory}>
                  {lesson.category || "General"} •{" "}
                  {lesson.difficulty || "Beginner"}
                </Text>
                {completedLessons.includes(lesson.id) && (
                  <Text style={styles.completedText}>✔ Completed</Text>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6b7280",
  },
  header: {
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    color: "#6b7280",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
  },
  progressCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 6,
  },
  progressTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  progressText: {
    color: "#e5e7eb",
    fontSize: 16,
    marginTop: 10,
  },
  continueButton: {
    marginTop: 20,
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  continueButtonText: {
    fontWeight: "bold",
    color: "#4f46e5",
  },
  modulesContainer: {
    gap: 20,
  },
  moduleCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  moduleImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  moduleInfo: {
    marginLeft: 15,
    flex: 1,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  moduleDetails: {
    color: "#6b7280",
    marginTop: 4,
  },
  moduleCategory: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 2,
  },
  completedText: {
    color: "green",
    marginTop: 5,
    fontWeight: "bold",
  },
  noModulesText: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 16,
    marginTop: 50,
  },
});
