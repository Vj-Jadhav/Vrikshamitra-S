import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from "react-native";
import Svg, { Path } from "react-native-svg";

export default function NotificationsScreen({ navigation }) {
  // Ideally fetch from backend. Since no endpoint exists yet, we initialize as empty array
  // to avoid showing dummy data.
  const [notifications, setNotifications] = useState([]);

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

        {notifications.length > 0 ? (
          notifications.map((notif, index) => (
            <View key={index} style={styles.notificationCard}>
              <Text style={styles.notificationTitle}>{notif.title}</Text>
              <Text style={styles.notificationMessage}>{notif.message}</Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            {/* Simple Icon or Text for Empty State */}
            <Text style={styles.emptyStateTitle}>No Notification Yet</Text>
            <Text style={styles.emptyStateText}>
              You're all caught up! Check back later for updates, challenge reminders, and announcements.
            </Text>
          </View>
        )}

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
    flexGrow: 1,
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

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ccc',
    marginTop: 20,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginHorizontal: 40,
    marginTop: 10,
    lineHeight: 20,
  },
});
