/** @format */
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  RefreshControl,
  Dimensions,
} from "react-native";
import { Icon } from "../components/CustomIcon";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_ENDPOINTS } from '../config/config.js';

const BASE_URL = API_ENDPOINTS.SUBMISSIONS;
const CLOUDINARY_CLOUD_NAME = "dabzuwe9l"; // Replace with your Cloudinary cloud name
const CLOUDINARY_UPLOAD_PRESET = "unsigned_upload"; // Replace with your upload preset
const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

const { width: screenWidth } = Dimensions.get("window");

const ChallengeDetailsScreen = ({ route, navigation }) => {
  const { challenge } = route.params;
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [submissionDetails, setSubmissionDetails] = useState(null);
  const [pointsAwarded, setPointsAwarded] = useState(0);

  // ===================
  // CHECK SUBMISSION STATUS
  // ===================
  useEffect(() => {
    checkSubmissionStatus();
  }, []);

  const checkSubmissionStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const studentId = await AsyncStorage.getItem("studentId");

      if (!token || !studentId) return;

      const response = await axios.get(`${BASE_URL}/status`, {
        params: {
          challengeId: challenge.id || challenge._id,
          studentId: studentId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      });

      if (response.data.submission) {
        setSubmissionStatus(response.data.submission.status);
        setSubmissionDetails(response.data.submission);
        setPointsAwarded(response.data.submission.pointsAwarded || 0);
      } else {
        setSubmissionStatus(null);
        setSubmissionDetails(null);
      }
    } catch (error) {
      console.log("Status check error:", error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    checkSubmissionStatus().finally(() => setRefreshing(false));
  };

  // ===================
  // VALIDATE IMAGE
  // ===================
  const validateImage = (image) => {
    // Check file size (max 10MB)
    if (image.fileSize > 10 * 1024 * 1024) {
      Alert.alert("File too large", "Please select an image under 10MB");
      return false;
    }

    // Check file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (image.type && !allowedTypes.includes(image.type.toLowerCase())) {
      Alert.alert(
        "Invalid file type",
        "Please select JPEG, PNG, or GIF image"
      );
      return false;
    }

    // Check URI exists
    if (!image.uri) {
      Alert.alert("Invalid image", "Cannot read image file");
      return false;
    }

    return true;
  };

  // ===================
  // PICK IMAGE (Gallery)
  // ===================
  const pickImage = async () => {
    launchImageLibrary(
      {
        mediaType: "photo",
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
        includeBase64: false,
      },
      (response) => {
        if (response.didCancel) return;

        if (response.errorCode) {
          Alert.alert(
            "Error",
            `Image picker error: ${response.errorMessage || "Unknown error"}`
          );
          return;
        }

        if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0];
          if (validateImage(asset)) {
            setSelectedImage(asset);
          }
        }
      }
    );
  };

  // ===================
  // CAPTURE IMAGE (Camera)
  // ===================
  const takePhoto = async () => {
    // Check camera permission for Android
    if (Platform.OS === "android") {
      try {
        const { PERMISSIONS, RESULTS, request } = require("react-native-permissions");
        const cameraPermission = PERMISSIONS.ANDROID.CAMERA;
        const result = await request(cameraPermission);

        if (result !== RESULTS.GRANTED) {
          Alert.alert(
            "Permission Denied",
            "Camera permission is required to take photos. Please enable it in settings."
          );
          return;
        }
      } catch (error) {
        console.log("Permission check error:", error);
      }
    }

    launchCamera(
      {
        mediaType: "photo",
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
        includeBase64: false,
        saveToPhotos: true,
      },
      (response) => {
        if (response.didCancel) return;

        if (response.errorCode) {
          Alert.alert(
            "Camera Error",
            `Unable to capture photo: ${response.errorMessage || "Unknown error"}`
          );
          return;
        }

        if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0];
          if (validateImage(asset)) {
            setSelectedImage(asset);
          }
        }
      }
    );
  };

  // ===================
  // UPLOAD TO CLOUDINARY
  // ===================
  const uploadToCloudinary = async (imageUri, fileName, fileType) => {
    try {
      setUploadProgress(10); // Start progress

      const formData = new FormData();
      formData.append("file", {
        uri: Platform.OS === "ios" ? imageUri.replace("file://", "") : imageUri,
        type: fileType || "image/jpeg",
        name: fileName || `ecoproof_${Date.now()}.jpg`,
      });
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      formData.append("folder", "ecochallenge_submissions");
      formData.append("tags", "ecochallenge,student_submission");
      formData.append("context", `challenge=${challenge.title}|timestamp=${Date.now()}`);

      setUploadProgress(30); // Upload started

      const response = await fetch(CLOUDINARY_API_URL, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setUploadProgress(70); // Upload completed, processing

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      setUploadProgress(100); // Upload successful

      return {
        url: data.secure_url,
        publicId: data.public_id,
        format: data.format,
        bytes: data.bytes,
        width: data.width,
        height: data.height,
        thumbnailUrl: data.secure_url.replace("/upload/", "/upload/w_300,h_300,c_fill/"),
      };
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
  };

  // ===================
  // UPLOAD SUBMISSION
  // ===================
  const uploadSubmission = async () => {
    if (!selectedImage) {
      Alert.alert("Upload Required", "Please select an image first.");
      return;
    }

    // Check if already submitted
    if (submissionStatus && submissionStatus !== 'rejected') {
      Alert.alert(
        "Already Submitted",
        "You have already submitted proof for this challenge.",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const token = await AsyncStorage.getItem("authToken");
      const studentId = await AsyncStorage.getItem("studentId");
      const studentName = await AsyncStorage.getItem("studentName");
      const studentEmail = await AsyncStorage.getItem("studentEmail");

      if (!token || !studentId) {
        Alert.alert(
          "Authentication Error",
          "Please login again.",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("Login"),
            },
          ]
        );
        return;
      }

      // Upload to Cloudinary
      Alert.alert(
        "Uploading to Cloudinary",
        "Please wait while we upload your image...",
        [],
        { cancelable: false }
      );

      const cloudinaryResult = await uploadToCloudinary(
        selectedImage.uri,
        selectedImage.fileName,
        selectedImage.type
      );

      // Save submission data to backend
      const submissionData = {
        challengeId: challenge.id || challenge._id,
        studentId: studentId,
        studentName: studentName,
        studentEmail: studentEmail,
        challengeTitle: challenge.title,
        facultyId: challenge.createdBy || challenge.facultyId,
        facultyName: challenge.facultyName,
        points: challenge.ecoPoints,
        cloudinaryUrl: cloudinaryResult.url,
        cloudinaryPublicId: cloudinaryResult.publicId,
        thumbnailUrl: cloudinaryResult.thumbnailUrl,
        imageFormat: cloudinaryResult.format,
        imageSize: cloudinaryResult.bytes,
        imageDimensions: {
          width: cloudinaryResult.width,
          height: cloudinaryResult.height,
        },
      };

      const response = await axios.post(
        `${BASE_URL}/submit`,
        submissionData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          timeout: 30000,
        }
      );

      if (response.data.success) {
        Alert.alert(
          "Success! 🎉",
          "Your proof has been submitted for faculty review.",
          [
            {
              text: "OK",
              onPress: () => {
                setSelectedImage(null);
                setUploadProgress(0);
                setSubmissionStatus('pending');
                checkSubmissionStatus();
              },
            },
          ]
        );
      }
    } catch (error) {
      console.log("UPLOAD ERROR:", error.response?.data || error);
      const errorMessage = getErrorMessage(error);
      Alert.alert("Upload Failed", errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // ===================
  // GET ERROR MESSAGE
  // ===================
  const getErrorMessage = (error) => {
    if (error.message?.includes("Cloudinary")) {
      return "Image upload to Cloudinary failed. Please check your internet connection and try again.";
    }

    if (error.response) {
      switch (error.response.status) {
        case 401:
          return "Session expired. Please login again.";
        case 413:
          return "Image too large. Please select a smaller image.";
        case 409:
          return "You have already submitted proof for this challenge.";
        case 500:
          return "Server error. Please try again later.";
        default:
          return error.response.data?.message || "Upload failed.";
      }
    }

    if (error.code === "ECONNABORTED") {
      return "Request timeout. Please check your connection.";
    }

    if (error.message?.includes("Network Error")) {
      return "Network error. Please check your internet connection.";
    }

    return error.message || "An unexpected error occurred.";
  };

  // ===================
  // RENDER STATUS BADGE
  // ===================
  const renderStatusBadge = () => {
    if (!submissionStatus) return null;

    let badgeStyle, iconName, statusText, iconColor, badgeIcon;

    switch (submissionStatus) {
      case 'pending':
        badgeStyle = styles.pendingBadge;
        iconName = "time";
        badgeIcon = "⏳";
        statusText = "Pending Review";
        iconColor = "#FF9800";
        break;
      case 'approved':
        badgeStyle = styles.approvedBadge;
        iconName = "checkmark-circle";
        badgeIcon = "✅";
        statusText = `Approved • +${pointsAwarded} Points`;
        iconColor = "#4CAF50";
        break;
      case 'rejected':
        badgeStyle = styles.rejectedBadge;
        iconName = "close-circle";
        badgeIcon = "❌";
        statusText = "Rejected - Please Resubmit";
        iconColor = "#F44336";
        break;
      default:
        return null;
    }

    return (
      <View style={[styles.statusContainer, badgeStyle]}>
        <View style={styles.statusHeader}>
          <Text style={styles.badgeIcon}>{badgeIcon}</Text>
          <Text style={[styles.statusText, { color: iconColor }]}>{statusText}</Text>
        </View>

        {submissionDetails?.cloudinaryUrl && (
          <TouchableOpacity
            style={styles.cloudinaryInfo}
            onPress={() => {
              if (submissionDetails.cloudinaryUrl) {
                Alert.alert(
                  "Cloudinary Storage",
                  "Your image is securely stored on Cloudinary's cloud storage.",
                  [{ text: "OK" }]
                );
              }
            }}
          >
            <Icon name="cloud-upload" size={16} color="#2196F3" />
            <Text style={styles.cloudinaryText}>Stored on Cloudinary</Text>
          </TouchableOpacity>
        )}

        {submissionDetails?.feedback && (
          <View style={styles.feedbackContainer}>
            <Text style={styles.feedbackLabel}>Faculty Feedback:</Text>
            <Text style={styles.feedbackText}>{submissionDetails.feedback}</Text>
          </View>
        )}

        {submissionDetails?.reviewedAt && (
          <Text style={styles.dateText}>
            Reviewed: {new Date(submissionDetails.reviewedAt).toLocaleDateString()}
          </Text>
        )}
      </View>
    );
  };

  // ===================
  // RENDER PROGRESS BAR
  // ===================
  const renderProgressBar = () => {
    if (!uploading || uploadProgress === 0) return null;

    return (
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Uploading to Cloudinary... {Math.round(uploadProgress)}%
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${uploadProgress}%` }
            ]}
          />
        </View>
      </View>
    );
  };

  const formattedDeadline = challenge.deadline
    ? new Date(challenge.deadline).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    : "No deadline";

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#4CAF50"]}
          tintColor="#4CAF50"
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#4CAF50" />
        </TouchableOpacity>
        <Text style={styles.title}>{challenge.title}</Text>
      </View>

      {/* Points Badge */}
      <View style={styles.pointsBadge}>
        <View style={styles.pointsIconContainer}>
          <Icon name="leaf" size={28} color="#fff" />
        </View>
        <View style={styles.pointsContent}>
          <Text style={styles.pointsValue}>{challenge.ecoPoints}</Text>
          <Text style={styles.pointsLabel}>Eco Points</Text>
        </View>
      </View>

      {/* Submission Status */}
      {renderStatusBadge()}

      {/* Upload Progress */}
      {renderProgressBar()}

      {/* Challenge Details */}
      <View style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>📖 Description</Text>
        <Text style={styles.description}>{challenge.description}</Text>

        {challenge.requirements && (
          <>
            <Text style={styles.sectionTitle}>📋 Requirements</Text>
            <Text style={styles.description}>{challenge.requirements}</Text>
          </>
        )}

        <Text style={styles.sectionTitle}>⏰ Deadline</Text>
        <View style={styles.deadlineContainer}>
          <Icon name="calendar" size={18} color="#FF9800" />
          <Text style={styles.deadlineText}>{formattedDeadline}</Text>
        </View>

        {challenge.facultyName && (
          <>
            <Text style={styles.sectionTitle}>👨‍🏫 Assigned By</Text>
            <View style={styles.facultyContainer}>
              <Icon name="person" size={18} color="#2196F3" />
              <Text style={styles.facultyText}>{challenge.facultyName}</Text>
            </View>
          </>
        )}
      </View>

      {/* Only show upload section if not approved and not pending */}
      {(!submissionStatus || submissionStatus === 'rejected') && (
        <View style={styles.uploadSection}>
          <Text style={styles.uploadTitle}>📤 Submit Proof</Text>
          <Text style={styles.uploadHint}>
            Take a photo or select one from your gallery as proof of completion
          </Text>

          {/* Image Selection Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.galleryButton]}
              onPress={pickImage}
              disabled={uploading}
            >
              <Icon name="images" size={22} color="#fff" />
              <Text style={styles.buttonText}>Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.cameraButton]}
              onPress={takePhoto}
              disabled={uploading}
            >
              <Icon name="camera" size={22} color="#fff" />
              <Text style={styles.buttonText}>Camera</Text>
            </TouchableOpacity>
          </View>

          {/* Selected Image Preview */}
          {selectedImage && (
            <View style={styles.imagePreviewContainer}>
              <Image
                source={{ uri: selectedImage.uri }}
                style={styles.previewImage}
              />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => setSelectedImage(null)}
                disabled={uploading}
              >
                <Icon name="close-circle" size={28} color="#F44336" />
              </TouchableOpacity>

              <View style={styles.imageInfo}>
                <Text style={styles.imageInfoText}>
                  Size: {(selectedImage.fileSize / (1024 * 1024)).toFixed(2)} MB
                </Text>
              </View>
            </View>
          )}

          {/* Upload Button */}
          <TouchableOpacity
            style={[
              styles.uploadButton,
              (uploading || !selectedImage) && styles.disabledButton,
            ]}
            onPress={uploadSubmission}
            disabled={uploading || !selectedImage}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.uploadButtonContent}>
                <Icon name="cloud-upload" size={20} color="#fff" />
                <Text style={styles.uploadButtonText}>
                  Submit to Cloudinary
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Cloudinary Info */}
          <View style={styles.cloudinaryInfoCard}>
            <View style={styles.cloudinaryHeader}>
              <Icon name="cloud" size={20} color="#2196F3" />
              <Text style={styles.cloudinaryTitle}>Cloudinary Storage</Text>
            </View>
            <Text style={styles.cloudinaryDescription}>
              Your images are securely uploaded to Cloudinary's cloud storage for fast, reliable access by faculty reviewers.
            </Text>
            <View style={styles.requirementsList}>
              <View style={styles.requirementItem}>
                <Icon name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.requirementText}>Max size: 10MB</Text>
              </View>
              <View style={styles.requirementItem}>
                <Icon name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.requirementText}>JPEG, PNG, GIF formats</Text>
              </View>
              <View style={styles.requirementItem}>
                <Icon name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.requirementText}>Secure cloud storage</Text>
              </View>
              <View style={styles.requirementItem}>
                <Icon name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.requirementText}>Fast loading for faculty</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* For approved submissions, show celebration */}
      {submissionStatus === 'approved' && (
        <View style={styles.celebrationCard}>
          <Text style={styles.celebrationEmoji}>🎉</Text>
          <Text style={styles.celebrationTitle}>Challenge Completed!</Text>
          <Text style={styles.celebrationText}>
            You earned {pointsAwarded} Eco Points for completing this challenge!
          </Text>
        </View>
      )}

      {/* Spacer */}
      <View style={styles.spacer} />
    </ScrollView>
  );
};

export default ChallengeDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1B5E20",
    flex: 1,
  },
  pointsBadge: {
    backgroundColor: "#4CAF50",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  pointsIconContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    padding: 12,
    marginRight: 16,
  },
  pointsContent: {
    flex: 1,
  },
  pointsValue: {
    fontSize: 32,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 2,
  },
  pointsLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
  },
  statusContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  pendingBadge: {
    backgroundColor: "#FFF3E0",
    borderLeftColor: "#FF9800",
  },
  approvedBadge: {
    backgroundColor: "#E8F5E9",
    borderLeftColor: "#4CAF50",
  },
  rejectedBadge: {
    backgroundColor: "#FFEBEE",
    borderLeftColor: "#F44336",
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  badgeIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },
  cloudinaryInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(33, 150, 243, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginVertical: 8,
    alignSelf: "flex-start",
  },
  cloudinaryText: {
    fontSize: 12,
    color: "#2196F3",
    marginLeft: 6,
    fontWeight: "600",
  },
  feedbackContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  feedbackLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
    marginBottom: 4,
  },
  feedbackText: {
    fontSize: 14,
    color: "#333",
    fontStyle: "italic",
  },
  dateText: {
    fontSize: 11,
    color: "#777",
    marginTop: 6,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  progressContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  progressText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    textAlign: "center",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 3,
  },
  detailsCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2E7D32",
    marginTop: 16,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
  },
  deadlineContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  deadlineText: {
    fontSize: 15,
    color: "#FF9800",
    fontWeight: "600",
    marginLeft: 8,
  },
  facultyContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  facultyText: {
    fontSize: 15,
    color: "#2196F3",
    fontWeight: "600",
    marginLeft: 8,
  },
  uploadSection: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B5E20",
    marginBottom: 8,
  },
  uploadHint: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  galleryButton: {
    backgroundColor: "#4CAF50",
  },
  cameraButton: {
    backgroundColor: "#2196F3",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  imagePreviewContainer: {
    marginBottom: 20,
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: 250,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  removeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  imageInfo: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  imageInfoText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  uploadButton: {
    backgroundColor: "#2E7D32",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  uploadButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
  cloudinaryInfoCard: {
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#BBDEFB",
  },
  cloudinaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  cloudinaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1565C0",
    marginLeft: 10,
  },
  cloudinaryDescription: {
    fontSize: 13,
    color: "#0D47A1",
    lineHeight: 18,
    marginBottom: 12,
  },
  requirementsList: {
    gap: 8,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  requirementText: {
    fontSize: 13,
    color: "#0D47A1",
    marginLeft: 8,
    fontWeight: "500",
  },
  celebrationCard: {
    backgroundColor: "#E8F5E9",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#4CAF50",
    borderStyle: "dashed",
  },
  celebrationEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  celebrationTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1B5E20",
    marginBottom: 8,
  },
  celebrationText: {
    fontSize: 16,
    color: "#2E7D32",
    textAlign: "center",
    fontWeight: "600",
  },
  spacer: {
    height: 40,
  },
});