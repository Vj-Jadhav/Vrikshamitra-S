/** @format */
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Alert
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://10.147.34.36:5000/api/challenges";

const ChallengesScreen = ({ navigation }) => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [userName, setUserName] = useState(null);

  // ⬇️ FIXED FUNCTION: returns actual values (avoids async state timing issue)
  const loadUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const id = await AsyncStorage.getItem("studentId");
      const name = await AsyncStorage.getItem("studentName");

      if (token && id) {
        setUserToken(token);
        setUserId(id);
        setUserName(name || "Anonymous User");

        return { token, id, name };
      } else {
        Alert.alert(
          "Authentication Required",
          "Please login to view challenges",
          [
            { text: "Login", onPress: () => navigation.navigate("Login") },
            {
              text: "Continue as Guest",
              onPress: () => setUserId("guest")
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

  // ⬇️ FIXED: uses returned ID+token directly
  const fetchChallenges = async () => {
    try {
      setLoading(true);

      const userData = await loadUserData();

      if (!userData || userData.id === "guest") {
        setError("Please login to view challenges");
        setLoading(false);
        return;
      }

      const { id, token } = userData;

      const res = await axios.get(`${BASE_URL}/student/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log("SERVER RESPONSE:", res.data);

      if (res.data?.success) {
        setChallenges(res.data.challenges);
      } else {
        setChallenges([]);
      }
    } catch (err) {
      console.log("ERROR FETCHING CHALLENGES", err);
      setError("Failed to load challenges from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const renderChallenge = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("ChallengeDetailsScreen", { challenge: item })
      }
    >
      <Text style={styles.title}>{item.title || "Untitled Challenge"}</Text>
      <Text style={styles.desc} numberOfLines={2}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}

      {error !== "" && <Text style={styles.error}>{error}</Text>}

      {!loading && challenges.length === 0 && (
        <Text style={styles.noData}>
          No challenges available for this student.
        </Text>
      )}

      <FlatList
        data={challenges}
        keyExtractor={(item) => item._id}
        renderItem={renderChallenge}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

export default ChallengesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff"
  },
  card: {
    backgroundColor: "#e7ffe1",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#00380c"
  },
  desc: {
    marginTop: 6,
    fontSize: 14,
    color: "#316c39"
  },
  error: {
    color: "red",
    fontSize: 15,
    textAlign: "center",
    marginVertical: 10
  },
  noData: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    color: "#444"
  }
});
