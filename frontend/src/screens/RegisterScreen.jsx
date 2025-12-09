import React, { useState } from 'react';
import { API_ENDPOINTS } from '../config/config.js';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, ActivityIndicator
} from 'react-native';

import { useTranslation } from 'react-i18next';

export default function RegisterScreen({ navigation }) {
  const { t } = useTranslation();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success / error

  const API_URL = API_ENDPOINTS.REGISTER;






  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      setMessageType("error");
      setMessage(`⚠ ${t('fill_all_fields')}`);
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
        setMessage(t('account_created'));

        setTimeout(() => navigation.navigate('Login'), 1200);
      }
      else {
        setMessageType("error");
        setMessage(data.message || t('something_wrong'));
      }

    } catch (error) {
      setMessageType("error");
      setMessage(t('server_error') + error.message);
    }

    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={styles.container}>

      {/* Title */}
      <Text style={styles.title}>{t('create_account')}</Text>
      <Text style={styles.subtitle}>{t('join_impact')}</Text>

      {/* Card */}
      <View style={styles.card}>

        <Text style={styles.label}>{t('full_name')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('enter_full_name')}
          placeholderTextColor="#777"
          value={fullName}
          onChangeText={setFullName}
        />

        <Text style={styles.label}>{t('email_address')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('enter_email')}
          placeholderTextColor="#777"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>{t('password_label')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('create_password')}
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
            <Text style={styles.registerButtonText}>{t('register')}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Already Registered */}
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginText}>{t('already_registered')} <Text style={{ fontWeight: 'bold' }}>{t('login')}</Text></Text>
      </TouchableOpacity>

      {/* Back */}

      {/* Back */}
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>{t('back_to_welcome')}</Text>
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