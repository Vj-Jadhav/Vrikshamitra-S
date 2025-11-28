import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  StyleSheet, Alert, ActivityIndicator 
} from 'react-native';

export default function SetPasswordScreen({ route, navigation }) {
  const { studentId, email } = route.params;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSetPassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://10.168.69.133:5000/api/auth/set-student-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          password
        })
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          "Success", 
          "Password set successfully! You can now login.",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("Login")
            }
          ]
        );
      } else {
        Alert.alert("Error", data.message || "Failed to set password");
      }
    } catch (error) {
      Alert.alert("Error", "Server error: " + error.message);
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set Your Password</Text>
      <Text style={styles.subtitle}>for {email}</Text>

      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="New Password"
          placeholderTextColor="#666"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#666"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <Text style={styles.note}>Password must be at least 6 characters</Text>

        <TouchableOpacity 
          style={styles.button}
          onPress={handleSetPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Set Password</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 25,
    backgroundColor: '#e8f5e9',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
    color: '#1b5e20',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  card: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    elevation: 6,
  },
  input: {
    backgroundColor: '#f1f8e9',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#c5e1a5',
    fontSize: 16,
  },
  note: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#1b5e20',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
});