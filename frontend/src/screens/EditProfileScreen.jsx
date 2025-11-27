import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function EditProfileScreen({ navigation, route }) {

  // safe access => crash nahi hoga
  const user = route?.params?.user || {};

  // backend ke fields use karo
  const [fullName, setFullName] = useState(user.fullName || "");
  const [email, setEmail] = useState(user.email || "");

  const handleSave = async () => {
    const userId = await AsyncStorage.getItem("userId");

    if (!userId) {
      Alert.alert("Error", "User not found");
      return;
    }

    try {
      const API_URL = `http://10.168.69.133:5000/api/user/${userId}`;

      const response = await fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email
        }),
      });

      const updatedUser = await response.json();

      // Local storage update
      await AsyncStorage.setItem("userData", JSON.stringify(updatedUser));

      Alert.alert("Success", "Profile updated successfully!");

      navigation.navigate("ProfileScreen", { updatedUser });

    } catch (error) {
      console.log("Update error:", error);
      Alert.alert("Error", "Failed to update profile");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Edit Profile</Text>

      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        value={fullName}
        onChangeText={setFullName}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: "#fff" },
  heading: { fontSize: 26, fontWeight: "bold", marginBottom: 30 },
  label: { fontSize: 16, marginTop: 10 },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginTop: 5,
  },
  saveBtn: {
    marginTop: 30,
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  saveText: { color: "white", fontSize: 18, fontWeight: "bold" },
});
