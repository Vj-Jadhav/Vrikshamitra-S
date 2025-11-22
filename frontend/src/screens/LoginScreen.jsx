import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  StyleSheet, ActivityIndicator 
} from 'react-native';

export default function LoginScreen({ navigation }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Correct backend IP (SAME as Register)
const API_URL = "http://10.168.69.133:5000/api/auth/login";




  const handleLogin = async () => {
    if (!email || !password) {
      setMessage("Please fill all fields!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      console.log("LOGIN RESPONSE:", data);

      if (response.status === 200) {
        setMessage("Login Successful! 🌿");
        setTimeout(() => navigation.navigate("Home"), 1200);
      } else {
        setMessage(data.message || "Invalid credentials!");
      }

    } catch (error) {
      setMessage("Server error: " + error.message);
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Welcome Back 🌱</Text>

      <View style={styles.card}>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#666"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <TouchableOpacity 
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>

      </View>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.backText}>← Create an Account</Text>
      </TouchableOpacity>

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
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1b5e20',
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

  loginButton: {
    backgroundColor: '#1b5e20',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },

  loginButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },

  backText: {
    color: '#1b5e20',
    textAlign: 'center',
    marginTop: 25,
    fontSize: 16,
    fontWeight: '600',
  },

  message: {
    textAlign: 'center',
    color: 'red',
    marginBottom: 10,
    fontWeight: '600'
  }
});
