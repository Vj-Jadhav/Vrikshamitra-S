import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_ENDPOINTS } from '../config/config.js';

import { useTranslation } from 'react-i18next';

export default function LoginScreen({ navigation }) {
  const { t } = useTranslation();
  // All hooks declared at the top level - in consistent order
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  // New states for OTP verification and password reset
  const [resetStep, setResetStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [receivedOtp, setReceivedOtp] = useState(""); // Store the OTP received from backend


  // Backend API URLs
  const API_URL = API_ENDPOINTS.LOGIN;
  const FORGOT_PASSWORD_URL = API_ENDPOINTS.FORGOT_PASSWORD;
  const VERIFY_OTP_URL = API_ENDPOINTS.VERIFY_OTP;
  const RESET_PASSWORD_URL = API_ENDPOINTS.RESET_PASSWORD;

  // Debug function to check storage
  const checkStorage = async () => {
    try {
      const studentId = await AsyncStorage.getItem("studentId");
      const studentName = await AsyncStorage.getItem("studentName");
      const studentEmail = await AsyncStorage.getItem("studentEmail");
      const studentGrade = await AsyncStorage.getItem("studentGrade");
      const studentRollNumber = await AsyncStorage.getItem("studentRollNumber");
      const studentData = await AsyncStorage.getItem("studentData");

      console.log("=== STORAGE CHECK ===");
      console.log("Student ID:", studentId);
      console.log("Student Name:", studentName);
      console.log("Student Email:", studentEmail);
      console.log("Student Grade:", studentGrade);
      console.log("Student Roll Number:", studentRollNumber);
      console.log("Complete Student Data:", studentData);
      console.log("=====================");
    } catch (error) {
      console.log("Storage check error:", error);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage(t('fill_all_fields'));
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      console.log("Sending login request for:", email);
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password,
          role: "student"
        })
      });

      const data = await response.json();
      console.log("LOGIN RESPONSE:", data);

      if (response.status === 200) {
        // ✅ Store ALL STUDENT data in AsyncStorage
        if (data?.student?.id) {
          await AsyncStorage.setItem("studentId", data.student.id);
          console.log("✅ Saved StudentID:", data.student.id);
        }
        if (data?.student?.instituteId) {
          await AsyncStorage.setItem("instituteId", data.student.instituteId);
          console.log("✅ Saved InstituteID:", data.student.instituteId);
        }
        const nameToSave = data?.student?.name || data?.user?.name;
        if (nameToSave) {
          await AsyncStorage.setItem("studentName", nameToSave);
          console.log("✅ Saved Student Name:", nameToSave);
        }
        // ✅ CRITICAL: Store student email
        if (data?.student?.email) {
          await AsyncStorage.setItem("studentEmail", data.student.email);
          console.log("✅ Saved Student Email:", data.student.email);
        } else {
          // Fallback: Use the email from login input
          await AsyncStorage.setItem("studentEmail", email.toLowerCase().trim());
          console.log("✅ Saved Login Email as Student Email:", email);
        }
        if (data?.student?.grade) {
          await AsyncStorage.setItem("studentGrade", data.student.grade);
          console.log("✅ Saved Student Grade:", data.student.grade);
        }
        if (data?.student?.rollNumber) {
          await AsyncStorage.setItem("studentRollNumber", data.student.rollNumber);
          console.log("✅ Saved Student Roll Number:", data.student.rollNumber);
        }
        if (data?.token) {
          await AsyncStorage.setItem("authToken", data.token);
          console.log("✅ Saved Auth Token");
        }

        // ✅ Store complete student data object for easy access
        if (data.student) {
          const completeStudentData = {
            ...data.student,
            // Ensure email is included
            email: data.student.email || email.toLowerCase().trim()
          };
          await AsyncStorage.setItem("studentData", JSON.stringify(completeStudentData));
          console.log("✅ Complete student data saved:", completeStudentData);
        }

        // Fallback to user data if student data not available
        if (data?.user?.id && !data.student) {
          await AsyncStorage.setItem("studentId", data.user.id);
          if (data.user.email) {
            await AsyncStorage.setItem("studentEmail", data.user.email);
          }
          console.log("⚠️ Using user data as fallback");
        }

        // Verify storage
        await checkStorage();

        const studentName = data?.student?.name || data?.user?.name || t('student');
        setMessage(`${t('login_success')} ${studentName} 🌿`);
        setTimeout(() => navigation.navigate("Home"), 1200);
      } else {
        setMessage(data.message || t('invalid_credentials'));

        // Show specific guidance for "Student not found"
        if (data.message === "Student not found") {
          Alert.alert(
            t('account_not_found'),
            t('account_not_found_msg'),
            [{ text: t('ok') }]
          );
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage(t('server_error') + error.message);
    }
    setLoading(false);
  };

  // Step 1: Request OTP
  const handleForgotPassword = async () => {
    if (!resetEmail) {
      Alert.alert(t('error'), t('enter_student_email'));
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) {
      Alert.alert(t('invalid_email'), t('enter_valid_email'));
      return;
    }

    setResetLoading(true);

    try {
      console.log("Sending forgot password request for:", resetEmail);

      const response = await fetch(FORGOT_PASSWORD_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          email: resetEmail.toLowerCase().trim(),
          role: "student"
        })
      });

      console.log("Response status:", response.status);

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.log("JSON parse error");
        throw new Error("Invalid response from server");
      }

      console.log("FORGOT PASSWORD RESPONSE:", data);

      if (data.success || response.status === 200) {
        // Store the OTP if provided by backend (development mode)
        if (data.otp) {
          setReceivedOtp(data.otp);
          console.log("OTP received from backend:", data.otp);
        }

        // Move to OTP verification step
        setResetStep(2);

        // Show appropriate message based on whether OTP is included
        if (data.otp) {
          Alert.alert(
            t('otp_generated'), // Assuming this matches "OTP Generated ✅" or standard
            `OTP has been generated: ${data.otp}\n\nUse this OTP to verify.`, // Dev mode, no translation needed mostly
            [{ text: t('ok') }]
          );
        } else {
          Alert.alert(
            t('otp_sent_alert_title'),
            data.message || t('otp_sent_alert_msg'),
            [{ text: t('ok') }]
          );
        }
      } else {
        Alert.alert(t('error'), data.message || t('failed_send_otp'));
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      Alert.alert(t('error'), t('failed_send_otp'));
    }
    setResetLoading(false);
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert(t('error'), t('enter_valid_otp'));
      return;
    }

    setResetLoading(true);

    try {
      console.log("Verifying OTP for:", resetEmail);

      const response = await fetch(VERIFY_OTP_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          email: resetEmail.toLowerCase().trim(),
          otp: otp,
          role: "student"
        })
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error("Invalid response from server");
      }

      console.log("VERIFY OTP RESPONSE:", data);

      if (data.success) {
        setResetToken(data.resetToken);
        setResetStep(3);
        Alert.alert(t('success'), t('otp_verified'));
      } else {
        Alert.alert(t('error'), data.message || t('invalid_otp'));
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      Alert.alert(t('error'), t('failed_verify_otp'));
    }
    setResetLoading(false);
  };

  // Step 3: Reset Password
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert(t('error'), t('fill_password_fields'));
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(t('error'), t('passwords_mismatch'));
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(t('error'), t('password_too_short'));
      return;
    }

    setResetLoading(true);

    try {
      console.log("Resetting password for:", resetEmail);

      const response = await fetch(RESET_PASSWORD_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          resetToken: resetToken,
          newPassword: newPassword,
          role: "student",
          email: resetEmail.toLowerCase().trim()
        })
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error("Invalid response from server");
      }

      console.log("RESET PASSWORD RESPONSE:", data);

      if (data.success) {
        Alert.alert(
          t('success'),
          t('password_reset_success'),
          [
            {
              text: t('ok'),
              onPress: () => {
                // Reset everything and close modal
                setShowResetModal(false);
                setResetStep(1);
                setResetEmail("");
                setOtp("");
                setNewPassword("");
                setConfirmPassword("");
                setResetToken("");
                setReceivedOtp("");
              }
            }
          ]
        );
      } else {
        Alert.alert(t('error'), data.message || t('failed_reset_password'));
      }
    } catch (error) {
      console.error("Reset password error:", error);
      Alert.alert(t('error'), t('failed_reset_password'));
    }
    setResetLoading(false);
  };

  // Reset modal content based on current step
  const renderResetModalContent = () => {
    switch (resetStep) {
      case 1: // Enter email
        return (
          <>
            <Text style={styles.modalTitle}>{t('reset_password_title')}</Text>
            <Text style={styles.modalSubtitle}>
              {t('reset_password_subtitle')}
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('student_email_label')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('email_placeholder')}
                placeholderTextColor="#999"
                value={resetEmail}
                onChangeText={setResetEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!resetLoading}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowResetModal(false);
                  setResetStep(1);
                  setResetEmail("");
                }}
                disabled={resetLoading}
              >
                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.resetButton,
                  (!resetEmail || resetLoading) && styles.disabledButton
                ]}
                onPress={handleForgotPassword}
                disabled={!resetEmail || resetLoading}
              >
                <Text style={styles.resetButtonText}>
                  {resetLoading ? t('sending') : t('send_otp')}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        );

      case 2: // Enter OTP
        return (
          <>
            <Text style={styles.modalTitle}>{t('enter_otp_title')}</Text>
            <Text style={styles.modalSubtitle}>
              {receivedOtp
                ? `Development Mode: OTP is ${receivedOtp}\n\n${t('otp_sent_msg')}`
                : t('otp_sent_msg').replace('{email}', resetEmail)
              }
            </Text>

            {/* Show OTP in development mode */}
            {receivedOtp ? (
              <View style={styles.otpDisplayContainer}>
                <Text style={styles.otpDisplayText}>
                  Your OTP: <Text style={styles.otpHighlight}>{receivedOtp}</Text>
                </Text>
              </View>
            ) : null}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('otp_code_label')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('enter_otp_placeholder')}
                placeholderTextColor="#999"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                editable={!resetLoading}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setResetStep(1)}
                disabled={resetLoading}
              >
                <Text style={styles.cancelButtonText}>{t('back')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.resetButton,
                  (!otp || otp.length !== 6 || resetLoading) && styles.disabledButton
                ]}
                onPress={handleVerifyOTP}
                disabled={!otp || otp.length !== 6 || resetLoading}
              >
                <Text style={styles.resetButtonText}>
                  {resetLoading ? t('verifying') : t('verify_otp')}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        );

      case 3: // Set new password
        return (
          <>
            <Text style={styles.modalTitle}>{t('set_new_password_title')}</Text>
            <Text style={styles.modalSubtitle}>
              {t('set_new_password_subtitle')}
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('new_password_label')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('new_password_placeholder')}
                placeholderTextColor="#999"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                editable={!resetLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('confirm_password_label')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('confirm_password_placeholder')}
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                editable={!resetLoading}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setResetStep(2)}
                disabled={resetLoading}
              >
                <Text style={styles.cancelButtonText}>{t('back')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.resetButton,
                  (!newPassword || !confirmPassword || resetLoading) && styles.disabledButton
                ]}
                onPress={handleResetPassword}
                disabled={!newPassword || !confirmPassword || resetLoading}
              >
                <Text style={styles.resetButtonText}>
                  {resetLoading ? t('resetting') : t('reset_password_button')}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>{t('login_title')}</Text>

        <View style={styles.card}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t('email_label')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('email_placeholder')}
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t('password_label')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('password_placeholder')}
              placeholderTextColor="#666"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoComplete="password"
            />
          </View>

          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={() => {
              setShowResetModal(true);
              setResetEmail(email); // Pre-fill with current email
              setResetStep(1);
            }}
          >

            <Text style={styles.forgotPasswordText}>{t('forgot_password')}</Text>
          </TouchableOpacity>

          {message ? (
            <Text style={[
              styles.message,
              message.includes("Successful") ? styles.successMessage : styles.errorMessage
            ]}>
              {message}
            </Text>
          ) : null}

          <TouchableOpacity
            style={[
              styles.loginButton,
              (!email || !password || loading) && styles.disabledButton
            ]}
            onPress={handleLogin}
            disabled={!email || !password || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>{t('login_button')}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Note about student registration */}
        <View style={styles.noteContainer}>
          <Text style={styles.noteTitle}>{t('student_accounts_title')}</Text>
          <Text style={styles.noteText}>
            {t('student_account_note_1')}
          </Text>
          <Text style={styles.noteText}>
            {t('student_account_note_2')}
          </Text>
          <Text style={styles.noteText}>
            {t('student_account_note_3')}
          </Text>
          <Text style={styles.noteText}>
            {t('student_account_note_4')}
          </Text>
        </View>

        {/* Forgot Password Modal */}
        <Modal
          visible={showResetModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => !resetLoading && setShowResetModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {resetLoading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#1b5e20" />
                  <Text style={styles.loadingText}>
                    {resetStep === 1 ? t('sending') :
                      resetStep === 2 ? t('verifying') :
                        t('resetting')}
                  </Text>
                </View>
              )}

              {renderResetModalContent()}

              <View style={styles.modalNote}>
                <Text style={styles.modalNoteText}>
                  💡 {receivedOtp
                    ? "Development mode - OTP shown above"
                    : "Don't forget to check your spam folder if you don't see the email."
                  }
                </Text>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f5e9',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 25,
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
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1b5e20',
    marginBottom: 5,
    marginLeft: 5,
  },
  input: {
    backgroundColor: '#f1f8e9',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c5e1a5',
    fontSize: 16,
    color: '#333',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 15,
    padding: 5,
  },
  forgotPasswordText: {
    color: '#1b5e20',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#1b5e20',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#a5d6a7',
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  noteContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f1f8e9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c5e1a5',
  },
  noteTitle: {
    color: '#1b5e20',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  noteText: {
    color: '#1b5e20',
    fontSize: 14,
    marginBottom: 5,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '600',
    fontSize: 14,
    padding: 10,
    borderRadius: 8,
  },
  errorMessage: {
    color: '#d32f2f',
    backgroundColor: '#ffebee',
  },
  successMessage: {
    color: '#1b5e20',
    backgroundColor: '#e8f5e9',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: 25,
    borderRadius: 20,
    width: '100%',
    elevation: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1b5e20',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resetButton: {
    backgroundColor: '#1b5e20',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  loadingText: {
    marginLeft: 10,
    color: '#1b5e20',
    fontSize: 14,
  },
  modalNote: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f1f8e9',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#1b5e20',
  },
  modalNoteText: {
    color: '#1b5e20',
    fontSize: 12,
    fontStyle: 'italic',
  },
  // New styles for OTP display
  otpDisplayContainer: {
    backgroundColor: '#e8f5e9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#1b5e20',
  },
  otpDisplayText: {
    color: '#1b5e20',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  otpHighlight: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
  },
});