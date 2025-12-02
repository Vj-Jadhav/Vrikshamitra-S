import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import Svg, { Path } from "react-native-svg";

export default function NotificationsScreen({ navigation }) {
  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Svg width={26} height={26} viewBox="0 0 24 24">
            <Path
              fill="#fff"
              d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"
            />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={{ width: 25 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* Notification 1 */}
        <View style={styles.notificationCard}>
          <Text style={styles.notificationTitle}>🎉 Congratulations!</Text>
          <Text style={styles.notificationMessage}>
            You have earned 50 Eco-Points today.
          </Text>
        </View>

        {/* Notification 2 */}
        <View style={styles.notificationCard}>
          <Text style={styles.notificationTitle}>⚠️ Reminder</Text>
          <Text style={styles.notificationMessage}>
            Don't forget to complete today's challenge!
          </Text>
        </View>

        {/* Notification 3 */}
        <View style={styles.notificationCard}>
          <Text style={styles.notificationTitle}>🌱 New Learning Module</Text>
          <Text style={styles.notificationMessage}>
            "Save Water, Save Earth" module is now available.
          </Text>
        </View>

      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },

  header: {
    backgroundColor: "#3a9322ff",
    paddingVertical: 15,
    paddingTop: 45,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },

  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },

  scrollContainer: {
    padding: 20,
  },

  notificationCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
  },

  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 3,
  },

  notificationMessage: {
    fontSize: 13,
    color: "#555",
  },
});
