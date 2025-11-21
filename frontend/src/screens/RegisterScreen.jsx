import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  StyleSheet, KeyboardAvoidingView, ActivityIndicator 
} from 'react-native';

export default function RegisterScreen({ navigation }) {

  const [fullName, setFullName] = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success / error

  const API_URL = "http://192.168.45.133:5000/api/auth/register";




  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      setMessageType("error");
      setMessage("⚠ Please fill all fields!");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password })
      });

      const data = await response.json();

      if (response.status === 201) {
        setMessageType("success");
        setMessage("🎉 Account created successfully!");

        setTimeout(() => navigation.navigate('Login'), 1200);
      } 
      else {
        setMessageType("error");
        setMessage(data.message || "Something went wrong!");
      }

    } catch (error) {
      setMessageType("error");
      setMessage("Server Error: " + error.message);
    }

    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={styles.container}>

      {/* Title */}
      <Text style={styles.title}>Create Account 🌿</Text>
      <Text style={styles.subtitle}>Join Vrikshmitra and make an impact</Text>

      {/* Card */}
      <View style={styles.card}>
        
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your full name"
          placeholderTextColor="#777"
          value={fullName}
          onChangeText={setFullName}
        />

        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#777"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Create a password"
          placeholderTextColor="#777"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* Message */}
        {message ? (
          <Text style={[
            styles.message,
            messageType === "success" ? styles.successMsg : styles.errorMsg
          ]}>
            {message}
          </Text>
        ) : null}

        {/* Register Button */}
        <TouchableOpacity 
          style={styles.registerButton}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.registerButtonText}>Register</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Already Registered */}
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginText}>Already registered? <Text style={{fontWeight:'bold'}}>Login</Text></Text>
      </TouchableOpacity>

      {/* Back */}
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back to Welcome</Text>
      </TouchableOpacity>

    </KeyboardAvoidingView>
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
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
    color: '#1b5e20',
  },

  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#388e3c',
    marginBottom: 25,
  },

  card: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },

  label: {
    fontSize: 15,
    marginBottom: 5,
    fontWeight: '600',
    color: '#1b5e20',
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

  registerButton: {
    backgroundColor: '#2e7d32',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },

  registerButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },

  loginText: {
    color: '#1b5e20',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },

  backText: {
    color: '#1b5e20',
    textAlign: 'center',
    marginTop: 15,
    fontSize: 16,
    fontWeight: '600',
  },

  message: {
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 15,
    padding: 6,
    borderRadius: 8,
  },

  errorMsg: {
    color: '#b71c1c',
    backgroundColor: '#ffebee',
  },

  successMsg: {
    color: '#1b5e20',
    backgroundColor: '#e8f5e9',
  }
});
