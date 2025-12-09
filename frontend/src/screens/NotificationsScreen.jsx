import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useTranslation } from 'react-i18next';
import { Icon } from '../components/CustomIcon';

const NotificationsScreen = ({ navigation }) => {
  const { t } = useTranslation();
  // Ideally fetch from backend. Since no endpoint exists yet, we initialize as empty array
  // to avoid showing dummy data.
  const [notifications, setNotifications] = useState([]);

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="notifications-off-outline" size={80} color="#e0e0e0" />
      <Text style={styles.emptyStateTitle}>{t('no_notifications')}</Text>
      <Text style={styles.emptyStateText}>
        {t('all_caught_up')}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>{t('notifications')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>

        {notifications.length > 0 ? (
          notifications.map((notif, index) => (
            <View key={index} style={styles.notificationCard}>
              <Text style={styles.notificationTitle}>{notif.title}</Text>
              <Text style={styles.notificationMessage}>{notif.message}</Text>
            </View>
          ))
        ) : renderEmptyState()}

      </ScrollView>

    </View>
  );
}

export default NotificationsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },

  header: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingTop: 45,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    justifyContent: "space-between",
    elevation: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },

  title: {
    color: "#2E7D32",
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
