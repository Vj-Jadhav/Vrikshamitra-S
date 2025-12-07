import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  Alert
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_ENDPOINTS } from '../config/config.js';

// Move avatars array outside component to avoid recreation
const avatars = [
  { id: 1, uri: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" },
  { id: 2, uri: "https://cdn-icons-png.flaticon.com/512/4140/4140047.png" },
  { id: 3, uri: "https://cdn-icons-png.flaticon.com/512/4333/4333607.png" },
  { id: 4, uri: "https://cdn-icons-png.flaticon.com/512/921/921071.png" },
  { id: 5, uri: "https://cdn-icons-png.flaticon.com/512/3001/3001758.png" },
  { id: 6, uri: "https://cdn-icons-png.flaticon.com/512/6997/6997662.png" },
  { id: 7, uri: "https://cdn-icons-png.flaticon.com/512/9493/9493966.png" },
  { id: 8, uri: "https://cdn-icons-png.flaticon.com/512/3899/3899618.png" },
];

export default function ProfileScreen({ navigation }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);

  // Debug function to check what's in storage
  const checkStorage = async () => {
    try {
      const studentId = await AsyncStorage.getItem("studentId");
      const studentName = await AsyncStorage.getItem("studentName");
      const studentEmail = await AsyncStorage.getItem("studentEmail");
      const studentGrade = await AsyncStorage.getItem("studentGrade");
      const studentRollNumber = await AsyncStorage.getItem("studentRollNumber");
      const studentData = await AsyncStorage.getItem("studentData");

      console.log("=== PROFILE STORAGE CHECK ===");
      console.log("Student ID:", studentId);
      console.log("Student Name:", studentName);
      console.log("Student Email:", studentEmail);
      console.log("Student Grade:", studentGrade);
      console.log("Student Roll Number:", studentRollNumber);
      console.log("Complete Student Data:", studentData);
      console.log("=============================");

      return { studentId, studentName, studentEmail, studentGrade, studentRollNumber, studentData };
    } catch (error) {
      console.log("Storage check error:", error);
      return null;
    }
  };

  const fetchProfile = async () => {
    try {
      // First, check what's actually in storage
      const storageData = await checkStorage();

      // Get ALL student data from AsyncStorage
      const studentId = await AsyncStorage.getItem("studentId");
      const studentName = await AsyncStorage.getItem("studentName");
      const studentEmail = await AsyncStorage.getItem("studentEmail"); // ✅ ADDED THIS
      const studentGrade = await AsyncStorage.getItem("studentGrade");
      const studentRollNumber = await AsyncStorage.getItem("studentRollNumber");
      const completeStudentData = await AsyncStorage.getItem("studentData");

      console.log("PROFILE STUDENT DATA FROM STORAGE:", {
        studentId,
        studentName,
        studentEmail, // ✅ NOW INCLUDING EMAIL
        studentGrade,
        studentRollNumber
      });

      if (completeStudentData) {
        // ✅ PREFERRED: Use complete student data from storage
        const parsedData = JSON.parse(completeStudentData);
        console.log("✅ Using complete student data:", parsedData);

        const studentData = {
          id: parsedData._id || parsedData.id || studentId,
          name: parsedData.name || studentName || "Unknown",
          email: parsedData.email || studentEmail || "No Email",
          grade: parsedData.grade || studentGrade,
          rollNumber: parsedData.rollNumber || studentRollNumber,
          photo: parsedData.photo || avatars[0].uri,
          points: parsedData.points || 0,
          rank: parsedData.rank || 0
        };

        setStudent(studentData);
      } else if (studentId && studentName) {
        // ✅ FALLBACK: Use individual storage items
        const studentData = {
          id: studentId,
          name: studentName,
          email: studentEmail || "No Email",
          grade: studentGrade,
          rollNumber: studentRollNumber,
          photo: avatars[0].uri,
          points: 0,
          rank: 0
        };

        console.log("✅ Using individual storage items:", studentData);
        setStudent(studentData);
        await AsyncStorage.setItem("studentData", JSON.stringify(studentData));
      } else {
        // Final fallback: Try to fetch from API
        console.log("⚠️ No local data, fetching from API");
        await fetchStudentFromAPI();
      }

    } catch (err) {
      console.log("Profile Fetch Error:", err);
      // Fallback to API fetch
      await fetchStudentFromAPI();
    }

    setLoading(false);
  };

  const fetchStudentFromAPI = async () => {
    try {
      const studentId = await AsyncStorage.getItem("studentId");
      if (!studentId) {
        console.log("No student ID found");
        return;
      }

      const API_URL = `${API_ENDPOINTS.STUDENT}/${studentId}`;
      console.log("Fetching student from API:", API_URL);

      const res = await fetch(API_URL);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("PROFILE STUDENT API DATA:", data);

      if (data) {
        // Ensure we have all required fields with fallbacks
        const completeStudentData = {
          id: data._id || studentId,
          name: data.name || "Unknown",
          email: data.email || await AsyncStorage.getItem("studentEmail") || "No Email",
          grade: data.grade || "",
          rollNumber: data.rollNumber || "",
          photo: data.photo || avatars[0].uri,
          points: data.points || 0,
          rank: data.rank || 0
        };

        console.log("✅ API Student Data:", completeStudentData);
        setStudent(completeStudentData);
        await AsyncStorage.setItem("studentData", JSON.stringify(completeStudentData));

        // Also update individual fields for backward compatibility
        if (data.name) await AsyncStorage.setItem("studentName", data.name);
        if (data.email) await AsyncStorage.setItem("studentEmail", data.email);
        if (data.grade) await AsyncStorage.setItem("studentGrade", data.grade);
        if (data.rollNumber) await AsyncStorage.setItem("studentRollNumber", data.rollNumber);
      }

    } catch (err) {
      console.log("Student API Fetch Error:", err);
      // Final fallback: try to get from local storage
      const localStudent = await AsyncStorage.getItem("studentData");
      if (localStudent) {
        const parsedData = JSON.parse(localStudent);
        console.log("✅ Using local storage fallback:", parsedData);
        setStudent(parsedData);
      } else {
        // Ultimate fallback: create basic student object
        const basicStudent = {
          id: await AsyncStorage.getItem("studentId"),
          name: await AsyncStorage.getItem("studentName") || "Unknown",
          email: await AsyncStorage.getItem("studentEmail") || "No Email",
          grade: await AsyncStorage.getItem("studentGrade"),
          rollNumber: await AsyncStorage.getItem("studentRollNumber"),
          photo: avatars[0].uri,
          points: 0,
          rank: 0
        };
        console.log("⚠️ Using basic student fallback:", basicStudent);
        setStudent(basicStudent);
      }
    }
  };

  const updateAvatar = async (avatarUri) => {
    try {
      const studentId = await AsyncStorage.getItem("studentId");
      if (!studentId) {
        Alert.alert("Error", "Student not found");
        return;
      }

      const API_URL = `${API_ENDPOINTS.STUDENT}/${studentId}/avatar`;
      console.log("Updating student avatar at:", API_URL);

      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photo: avatarUri
        }),
      });

      if (response.ok) {
        const updatedStudent = await response.json();

        // Update local state
        setStudent(prevStudent => ({
          ...prevStudent,
          photo: avatarUri
        }));

        // Also update local storage
        await AsyncStorage.setItem("studentData", JSON.stringify({
          ...student,
          photo: avatarUri
        }));

        setAvatarModalVisible(false);
        Alert.alert("Success", "Avatar updated successfully!");
        console.log("Student avatar updated successfully");
      } else {
        // If API fails, update locally only
        console.log("API failed, updating locally");
        updateAvatarLocally(avatarUri);
      }
    } catch (error) {
      console.log("Avatar update error:", error);
      // Update locally if API call fails
      updateAvatarLocally(avatarUri);
    }
  };

  const updateAvatarLocally = async (avatarUri) => {
    // Update local state
    setStudent(prevStudent => ({
      ...prevStudent,
      photo: avatarUri
    }));

    // Update local storage
    await AsyncStorage.setItem("studentData", JSON.stringify({
      ...student,
      photo: avatarUri
    }));

    setAvatarModalVisible(false);
    Alert.alert("Success", "Avatar updated locally!");
  };

  const handleLogout = async () => {
    try {
      // Remove all student-related data
      await AsyncStorage.multiRemove([
        "studentId",
        "studentName",
        "studentEmail", // ✅ REMOVE EMAIL TOO
        "studentGrade",
        "studentRollNumber",
        "instituteId",
        "studentData",
        "authToken",
        "userId",
        "userData"
      ]);

      console.log("✅ All student data cleared from storage");
      navigation.navigate("Login");
    } catch (error) {
      console.log("Logout error:", error);
      navigation.navigate("Login");
    }
  };

  // Avatar Selector Modal Component
  const AvatarSelectorModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={avatarModalVisible}
      onRequestClose={() => setAvatarModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Choose Your Avatar</Text>

          <FlatList
            data={avatars}
            numColumns={3}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.avatarOption,
                  student?.photo === item.uri && styles.selectedAvatar
                ]}
                onPress={() => updateAvatar(item.uri)}
              >
                <Image
                  source={{ uri: item.uri }}
                  style={styles.avatarOptionImage}
                />
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.avatarsGrid}
          />

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setAvatarModalVisible(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ fontSize: 18 }}>Loading Profile...</Text>
      </View>
    );
  }

  if (!student) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ fontSize: 18, marginBottom: 10 }}>Student profile not found</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchProfile}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Profile</Text>
        <TouchableOpacity
          style={styles.profileIconContainer}
          onPress={() => setAvatarModalVisible(true)}
        >
          <Image
            source={{ uri: student.photo || avatars[0].uri }}
            style={styles.profileIcon}
            defaultSource={{ uri: avatars[0].uri }}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <TouchableOpacity onPress={() => setAvatarModalVisible(true)}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: student.photo || avatars[0].uri }}
                style={styles.profileImage}
                defaultSource={{ uri: avatars[0].uri }}
              />
              <View style={styles.editAvatarBadge}>
                <Text style={styles.editAvatarText}>Edit</Text>
              </View>
            </View>
          </TouchableOpacity>

          <Text style={styles.userName}>{student.name || "Unknown"}</Text>
          <Text style={styles.userEmail}>{student.email || "No Email"}</Text>

          {/* Student Info */}
          {student.grade && (
            <View style={styles.studentInfoContainer}>
              <Text style={styles.studentInfo}>
                Grade {student.grade} • Roll No: {student.rollNumber}
              </Text>
            </View>
          )}

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{student.points || 0}</Text>
              <Text style={styles.statLabel}>Eco Points</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statValue}>#{student.rank || "N/A"}</Text>
              <Text style={styles.statLabel}>Rank</Text>
            </View>
          </View>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("EditProfileScreen")}>
            <Text style={styles.menuText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("SettingsScreen")}>
            <Text style={styles.menuText}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("NotificationsScreen")}>
            <Text style={styles.menuText}>Notifications</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("HelpSupportScreen")}>
            <Text style={styles.menuText}>Help & Support</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("AboutScreen")}>
            <Text style={styles.menuText}>About</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <AvatarSelectorModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  header: {
    backgroundColor: "#3a9322ff",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  profileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#fff",
  },
  profileIcon: { width: "100%", height: "100%" },
  profileCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarContainer: {
    position: "relative",
    alignItems: "center",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: "#3a9322ff",
  },
  editAvatarBadge: {
    position: "absolute",
    bottom: 20,
    backgroundColor: "#3a9322ff",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  editAvatarText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginTop: 5,
    textAlign: 'center'
  },
  userEmail: {
    fontSize: 14,
    color: "#777",
    marginBottom: 10,
    textAlign: 'center'
  },
  studentInfoContainer: {
    marginBottom: 15,
  },
  studentInfo: {
    fontSize: 14,
    color: "#3a9322ff",
    fontWeight: "600",
    textAlign: 'center'
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 30,
    marginTop: 10,
  },
  statBox: { alignItems: "center" },
  statValue: { fontSize: 20, fontWeight: "bold", color: "#3a9322ff" },
  statLabel: { fontSize: 13, color: "#777" },
  menuContainer: { marginTop: 30, marginHorizontal: 20 },
  menuItem: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  menuText: { fontSize: 16, fontWeight: "600", color: "#333" },
  logoutButton: {
    borderWidth: 1,
    borderColor: "#d32f2f",
    backgroundColor: "#fff",
    marginTop: 10,
  },
  logoutText: { color: "#d32f2f", textAlign: "center" },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  avatarsGrid: {
    alignItems: "center",
  },
  avatarOption: {
    margin: 10,
    padding: 5,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#f0f0f0",
  },
  selectedAvatar: {
    borderColor: "#3a9322ff",
    borderWidth: 3,
  },
  avatarOptionImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  cancelButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  retryButton: {
    backgroundColor: "#3a9322ff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});