/** @format */
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Modal,
  Image,
  ImageBackground
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Icon } from '../components/CustomIcon'; // Changed from Ionicons to custom Icon
import { API_ENDPOINTS } from '../config/config.js';

const CHALLENGES_URL = API_ENDPOINTS.CHALLENGES;

const ChallengesScreen = ({ navigation }) => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");
  const [showCertificate, setShowCertificate] = useState(false);

  const loadUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const id = await AsyncStorage.getItem("studentId");
      const name = await AsyncStorage.getItem("studentName");

      if (name) {
        setUserName(name);
      }

      if (token && id) {
        return { token, id, name };
      } else {
        Alert.alert(
          "Authentication Required",
          "Please login to view challenges",
          [
            { text: "Login", onPress: () => navigation.navigate("Login") },
            {
              text: "Continue as Guest",
              onPress: () => console.log("Continue as guest")
            }
          ]
        );
        return null;
      }
    } catch (error) {
      console.log("Error loading user data:", error);
      return null;
    }
  };

  const fetchChallenges = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      setError("");

      const userData = await loadUserData();

      if (!userData) {
        setError("Please login to view challenges");
        setLoading(false);
        return;
      }

      const { id, token } = userData;

      console.log(`Fetching challenges for student ID: ${id}`);

      const res = await axios.get(`${CHALLENGES_URL}/student/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log("API Response success:", res.data?.success);
      console.log("Number of challenges:", res.data?.challenges?.length);

      // Log the first challenge to see ALL properties
      if (res.data?.challenges?.length > 0) {
        console.log("First challenge FULL object:", JSON.stringify(res.data.challenges[0], null, 2));
        console.log("First challenge properties:", Object.keys(res.data.challenges[0]));
        console.log("EcoPoints value:", res.data.challenges[0].ecoPoints);
        console.log("ecoPoints value (lowercase):", res.data.challenges[0].ecopoints);
      }

      if (res.data?.success && res.data.challenges) {
        // Transform the data to ensure consistent property names
        const transformedChallenges = res.data.challenges.map(challenge => {
          return {
            ...challenge,
            // Handle both ecoPoints and ecopoints
            ecoPoints: challenge.ecoPoints || challenge.ecopoints || 0,
            // Ensure other properties have fallbacks
            title: challenge.title || "Untitled Challenge",
            description: challenge.description || "No description",
            category: challenge.category || "General",
            difficulty: challenge.difficulty || "Medium",
            progressStatus: challenge.progressStatus || "not_started",
            pointsEarned: challenge.pointsEarned || 0
          };
        });

        console.log("Transformed challenges:", transformedChallenges);
        setChallenges(transformedChallenges);
      } else {
        console.log("Unexpected response structure:", res.data);
        setChallenges([]);
        setError("No challenges available");
      }
    } catch (err) {
      console.log("ERROR FETCHING CHALLENGES:", err.message);
      console.log("Error details:", err.response?.data);
      setError(err.response?.data?.message || "Failed to load challenges. Please try again.");
    } finally {
      setLoading(false);
      if (isRefreshing) setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchChallenges(true);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchChallenges();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const calculateProgress = () => {
    if (challenges.length === 0) return 0;
    const completedCount = challenges.filter(c => c.progressStatus === 'approved').length;
    return (completedCount / challenges.length); // 0 to 1
  };

  const progress = calculateProgress();
  const isCompleted = progress === 1 && challenges.length > 0;

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>Your Progress</Text>
        <Text style={styles.progressPercentage}>{Math.round(progress * 100)}%</Text>
      </View>
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.progressSubtext}>
        {challenges.filter(c => c.progressStatus === 'approved').length} of {challenges.length} challenges completed
      </Text>

      {isCompleted && (
        <TouchableOpacity
          style={styles.certificateButton}
          onPress={() => setShowCertificate(true)}
        >
          <Icon name="ribbon" size={20} color="#fff" />
          <Text style={styles.certificateButtonText}>View Certificate</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const CertificateModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showCertificate}
      onRequestClose={() => setShowCertificate(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.certificateContainer}>
          <View style={styles.certificateBorder}>
            <View style={styles.certificateHeader}>
              <Icon name="ribbon" size={50} color="#D4AF37" />
              <Text style={styles.certificateTitle}>Certificate of Completion</Text>
            </View>

            <Text style={styles.certificateText}>This certifies that</Text>
            <Text style={styles.certificateName}>{userName || "Student"}</Text>
            <Text style={styles.certificateText}>has successfully completed all assigned challenges in</Text>
            <Text style={styles.certificateCourse}>Vrikshamitra Eco-Program</Text>

            <View style={styles.certificateDate}>
              <Text style={styles.dateLabel}>Date: {new Date().toLocaleDateString()}</Text>
            </View>

            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2917/2917633.png' }}
              style={styles.stampImage}
            />

            <TouchableOpacity
              style={styles.closeCertButton}
              onPress={() => setShowCertificate(false)}
            >
              <Text style={styles.closeCertText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const formatDate = (dateString) => {
    if (!dateString) return "No deadline";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const getTimeLeft = (deadline) => {
    if (!deadline) return "No deadline";
    try {
      const now = new Date();
      const deadlineDate = new Date(deadline);
      const diffTime = deadlineDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return "Expired";
      if (diffDays === 0) return "Due today";
      if (diffDays === 1) return "1 day left";
      return `${diffDays} days left`;
    } catch (error) {
      return "Invalid deadline";
    }
  };

  const getDifficultyColor = (difficulty) => {
    if (!difficulty) return '#757575';

    const diffLower = difficulty.toLowerCase();
    switch (diffLower) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return '#757575';
    }
  };

  const renderChallenge = ({ item, index }) => {
    console.log(`Rendering challenge ${index + 1}:`, item.title);
    console.log(`Challenge ${index + 1} ecoPoints:`, item.ecoPoints);

    // Extract properties with debugging
    const challenge = {
      id: item._id || item.id || `challenge-${index}`,
      title: item.title || "Untitled Challenge",
      description: item.description || "No description available",
      // Try multiple property names for ecoPoints
      ecoPoints: item.ecoPoints || item.ecopoints || item.points || 0,
      category: item.category || "General",
      difficulty: item.difficulty || "Unknown",
      deadline: item.deadline,
      startDate: item.startDate,
      status: item.status || "active",
      requirements: item.requirements || "",
      resources: item.resources || [],
      // Ensure these fields are passed for submission
      createdBy: item.createdBy,
      facultyId: item.facultyId || item.createdBy, // some challenges might use one or other
      facultyName: item.facultyName || "Institute Faculty" // Fallback name if not provided
    };

    console.log(`Final ecoPoints value for "${challenge.title}":`, challenge.ecoPoints);

    const timeLeft = getTimeLeft(challenge.deadline);
    const deadlineColor = timeLeft === "Expired" ? "#F44336" :
      timeLeft.includes("Due today") ? "#FF9800" : "#4CAF50";

    return (
      <TouchableOpacity
        style={[
          styles.card,
          { borderLeftColor: getDifficultyColor(challenge.difficulty) }
        ]}
        onPress={() => {
          console.log("Navigating with challenge:", challenge);
          navigation.navigate("ChallengeDetailsScreen", { challenge });
        }}
        activeOpacity={0.7}
      >
        {/* Challenge Header with Title and EcoPoints */}
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {challenge.title}
            </Text>
            <View style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(challenge.difficulty) + '20' }
            ]}>
              <Icon
                name="trophy"
                size={14}
                color={getDifficultyColor(challenge.difficulty)}
              />
              <Text style={[
                styles.difficultyText,
                { color: getDifficultyColor(challenge.difficulty) }
              ]}>
                {challenge.difficulty}
              </Text>
            </View>
          </View>

          {/* EcoPoints Display */}
          <View style={styles.ecopointsContainer}>
            <View style={styles.ecopointsBadge}>
              <Icon name="leaf" size={20} color="#4CAF50" />
              <Text style={styles.ecopointsValue}>
                {challenge.ecoPoints || "0"}
              </Text>
            </View>
            <Text style={styles.ecopointsLabel}>Points</Text>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.description} numberOfLines={2}>
          {challenge.description}
        </Text>

        {/* Requirements (if available) */}
        {challenge.requirements && challenge.requirements.trim() !== "" && (
          <View style={styles.requirementsContainer}>
            <Icon name="document-text" size={14} color="#666" />
            <Text style={styles.requirementsText} numberOfLines={1}>
              {challenge.requirements}
            </Text>
          </View>
        )}

        {/* Challenge Details Row */}
        <View style={styles.detailsRow}>
          {/* Category */}
          <View style={styles.detailItem}>
            <Icon name="pricetag" size={14} color="#666" />
            <Text style={styles.detailText}>
              {challenge.category || "No category"}
            </Text>
          </View>

          {/* Deadline */}
          <View style={styles.detailItem}>
            <Icon name="calendar" size={14} color={deadlineColor} />
            <Text style={[styles.detailText, { color: deadlineColor }]}>
              {timeLeft}
            </Text>
          </View>

          {/* Resources Count */}
          {challenge.resources && challenge.resources.length > 0 && (
            <View style={styles.detailItem}>
              <Icon name="attach" size={14} color="#666" />
              <Text style={styles.detailText}>
                {challenge.resources.length} resources
              </Text>
            </View>
          )}
        </View>

        {/* Start Challenge Button */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => {
            console.log("Button pressed for:", challenge.title);
            navigation.navigate("ChallengeDetailsScreen", { challenge });
          }}
        >
          <Text style={styles.startButtonText}>View Details</Text>
          <Icon name="arrow-forward" size={16} color="#fff" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="trophy-outline" size={80} color="#e0e0e0" />
      <Text style={styles.emptyStateTitle}>No Challenges Yet</Text>
      <Text style={styles.emptyStateText}>
        You don't have any challenges assigned yet. Check back later for new challenges!
      </Text>
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={() => fetchChallenges()}
      >
        <Icon name="refresh" size={20} color="#fff" />
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading your challenges...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌿 Eco Challenges</Text>
        <Text style={styles.headerSubtitle}>
          {userName ? `Welcome, ${userName}` : "Complete challenges and earn points"}
        </Text>
      </View>

      {/* Debug Info - Remove this in production */}
      {challenges.length > 0 && (
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>
            Found {challenges.length} challenges | First challenge points: {challenges[0]?.ecoPoints || "N/A"}
          </Text>
        </View>
      )}

      {error ? (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={50} color="#ff6b6b" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchChallenges()}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={challenges}
          keyExtractor={(item, index) => item._id || `challenge-${index}`}
          renderItem={renderChallenge}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={
            challenges.length === 0 ? styles.emptyList : styles.listContent
          }
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#4CAF50"]}
              tintColor="#4CAF50"
            />
          }
          ListHeaderComponent={
            challenges.length > 0 ? (
              <View>
                {renderProgressBar()}
                <View style={styles.statsContainer}>
                  <Text style={styles.statsText}>
                    You have {challenges.length} active challenge{challenges.length !== 1 ? 's' : ''}
                  </Text>
                  <Text style={styles.statsSubtext}>
                    Total potential points: {challenges.reduce((sum, c) => sum + (c.ecoPoints || 0), 0)}
                  </Text>
                </View>
              </View>
            ) : null
          }
        />
      )}
      <CertificateModal />
    </View>
  );
};

export default ChallengesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#fff",
    padding: 20,
    paddingTop: 50,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2E7D32",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  debugInfo: {
    backgroundColor: "#FFF3CD",
    padding: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 5,
  },
  debugText: {
    fontSize: 12,
    color: "#856404",
    textAlign: "center",
  },
  statsContainer: {
    backgroundColor: "#E8F5E9",
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 15,
  },
  statsText: {
    fontSize: 16,
    color: "#2E7D32",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 5,
  },
  statsSubtext: {
    fontSize: 14,
    color: "#4CAF50",
    textAlign: "center",
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B5E20",
    marginBottom: 8,
  },
  difficultyBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  ecopointsContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  ecopointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 70,
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  ecopointsValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2E7D32",
    marginLeft: 6,
  },
  ecopointsLabel: {
    fontSize: 10,
    color: "#666",
    marginTop: 2,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    marginBottom: 12,
  },
  requirementsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  requirementsText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
    flex: 1,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    flexWrap: "wrap",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 8,
  },
  startButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 8,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#ff6b6b",
    textAlign: "center",
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    paddingTop: 100,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#757575",
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 15,
    color: "#9e9e9e",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  emptyList: {
    flexGrow: 1,
  },
  listContent: {
    paddingBottom: 30,
  },
  progressContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4CAF50',
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  progressSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  certificateButton: {
    backgroundColor: '#D4AF37', // Gold color
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  certificateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  certificateContainer: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  certificateBorder: {
    margin: 10,
    borderWidth: 2,
    borderColor: '#D4AF37',
    borderStyle: 'dashed',
    padding: 20,
    alignItems: 'center',
    borderRadius: 8,
  },
  certificateHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  certificateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginTop: 10,
    textAlign: 'center',
  },
  certificateText: {
    fontSize: 16,
    color: '#666',
    marginVertical: 5,
    textAlign: 'center',
  },
  certificateName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32', // Green
    marginVertical: 10,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 5,
    width: '100%',
  },
  certificateCourse: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 5,
    textAlign: 'center',
  },
  certificateDate: {
    marginTop: 30,
    alignSelf: 'flex-start',
  },
  dateLabel: {
    fontSize: 14,
    color: '#666',
  },
  stampImage: {
    width: 80,
    height: 80,
    position: 'absolute',
    bottom: 80,
    right: 20,
    opacity: 0.8,
  },
  closeCertButton: {
    marginTop: 40,
    backgroundColor: '#D4AF37',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 20,
  },
  closeCertText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});