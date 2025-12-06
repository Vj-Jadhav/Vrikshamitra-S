// components/GarbageReport.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  Modal,
  FlatList
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Geolocation from '@react-native-community/geolocation';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { API_ENDPOINTS } from '../../config/config.js';
import AsyncStorage from "@react-native-async-storage/async-storage";


const GarbageReport = () => {
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [hasPermissions, setHasPermissions] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [userId, setUserId] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [userName, setUserName] = useState('Anonymous User');


  // New states for category, severity, and tags
  const [category, setCategory] = useState('plastic');
  const [severity, setSeverity] = useState('medium');
  const [tags, setTags] = useState([]);

  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSeverityModal, setShowSeverityModal] = useState(false);
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    initializeApp();
    loadUserData();
  }, []);


  const loadUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const id = await AsyncStorage.getItem('studentId');      // Changed
      const name = await AsyncStorage.getItem('studentName');  // Changed

      if (token && id) {
        setUserToken(token);
        setUserId(id);
        setUserName(name || 'Anonymous User');
      } else {
        // If no token, show login prompt or use guest mode
        Alert.alert(
          'Authentication Required',
          'Please login to submit reports',
          [
            { text: 'Login', onPress: () => navigation.navigate('Login') },
            { text: 'Continue as Guest', onPress: () => setUserId('guest') }
          ]
        );
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  // Permissions Utility Functions (same as before)
  const getAndroidPermissions = () => {
    const permissions = [
      PERMISSIONS.ANDROID.CAMERA,
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    ];

    if (Platform.Version >= 33) {
      permissions.push(
        PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
        PERMISSIONS.ANDROID.READ_MEDIA_VIDEO
      );
    } else {
      permissions.push(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
    }

    return permissions;
  };

  const requestAllPermissions = async () => {
    try {
      const permissions = Platform.OS === 'ios'
        ? [
          PERMISSIONS.IOS.CAMERA,
          PERMISSIONS.IOS.PHOTO_LIBRARY,
          PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
        ]
        : getAndroidPermissions();

      const results = {};

      for (const permission of permissions) {
        let result = await check(permission);

        if (result === RESULTS.DENIED) {
          result = await request(permission);
        }

        results[permission] = result;
      }

      const essentialPermissions = Platform.OS === 'ios'
        ? [PERMISSIONS.IOS.CAMERA, PERMISSIONS.IOS.LOCATION_WHEN_IN_USE]
        : [PERMISSIONS.ANDROID.CAMERA, PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION];

      const allGranted = essentialPermissions.every(perm => results[perm] === RESULTS.GRANTED);

      return allGranted;
    } catch (error) {
      console.log('Permission error:', error);
      throw error;
    }
  };

  // Location Utility Functions (same as before)
  const checkLocationPermission = async () => {
    try {
      const locationPermission = Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

      const result = await check(locationPermission);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.log('Error checking location permission:', error);
      return false;
    }
  };

  const requestLocationPermission = async () => {
    try {
      const locationPermission = Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

      const result = await request(locationPermission);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.log('Error requesting location permission:', error);
      return false;
    }
  };

  const getCurrentLocation = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const hasPermission = await checkLocationPermission();

        if (!hasPermission) {
          const permissionGranted = await requestLocationPermission();
          if (!permissionGranted) {
            reject(new Error('Location permission denied'));
            return;
          }
        }

        // Helper to get position with promise
        const getPosition = (options) => {
          return new Promise((res, rej) => {
            Geolocation.getCurrentPosition(res, rej, options);
          });
        };

        const highAccuracyOptions = {
          enableHighAccuracy: true,
          timeout: 6000,
          maximumAge: 10000,
        };

        const lowAccuracyOptions = {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 1000 * 60 * 5,
        };

        console.log('Requesting location (High Accuracy)...');

        try {
          const position = await getPosition(highAccuracyOptions);
          const { latitude, longitude, accuracy } = position.coords;
          console.log('Location obtained (High Accuracy):', { latitude, longitude, accuracy });

          resolve({
            latitude,
            longitude,
            accuracy,
            timestamp: position.timestamp,
          });
        } catch (error) {
          console.log('High accuracy failed/timed out. Trying low accuracy...', error.code, error.message);

          try {
            const position = await getPosition(lowAccuracyOptions);
            const { latitude, longitude, accuracy } = position.coords;
            console.log('Location obtained (Low Accuracy):', { latitude, longitude, accuracy });

            resolve({
              latitude,
              longitude,
              accuracy,
              timestamp: position.timestamp,
            });
          } catch (finalError) {
            console.log('Low accuracy also failed:', finalError);

            let errorMessage = 'Failed to get location';
            switch (finalError.code) {
              case 1: errorMessage = 'Location permission denied.'; break;
              case 2: errorMessage = 'Location unavailable. Check GPS/Network.'; break;
              case 3: errorMessage = 'Location request timed out. Please check signal.'; break;
              default: errorMessage = finalError.message || 'Unknown location error';
            }
            reject(new Error(errorMessage));
          }
        }

      } catch (error) {
        console.log('Error in getCurrentLocation:', error);
        reject(error);
      }
    });
  };

  const getAddressFromCoords = async (latitude, longitude) => {
    try {
      console.log('Reverse geocoding for:', latitude, longitude);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=18`,
        {
          headers: {
            'User-Agent': 'GarbageReportApp/1.0 (your-email@example.com)',
            'Accept-Language': 'en',
          }
        }
      );

      if (!response.ok) {
        if (response.status === 403) {
          console.log('OSM rate limited, using fallback');
          return await getAddressFallback(latitude, longitude);
        }
        throw new Error(`Geocoding API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const address = data.address;
      let formattedAddress = '';

      if (address) {
        const addressParts = [];

        if (address.road) addressParts.push(address.road);
        if (address.suburb) addressParts.push(address.suburb);
        if (address.city) addressParts.push(address.city);
        if (address.town) addressParts.push(address.town);
        if (address.village) addressParts.push(address.village);
        if (address.county) addressParts.push(address.county);
        if (address.state) addressParts.push(address.state);
        if (address.country) addressParts.push(address.country);

        formattedAddress = addressParts.join(', ');
      }

      return formattedAddress || data.display_name || 'Address not available';

    } catch (error) {
      console.log('Geocoding error:', error.message);
      return await getAddressFallback(latitude, longitude);
    }
  };

  const getAddressFallback = async (latitude, longitude) => {
    try {
      console.log('Trying fallback geocoding...');

      const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY';
      if (apiKey && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY') {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
        );

        if (response.ok) {
          const data = await response.json();
          if (data.results && data.results.length > 0) {
            return data.results[0].formatted_address;
          }
        }
      }

      return `Near ${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`;

    } catch (error) {
      console.log('Fallback geocoding failed:', error);
      return `Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
  };

  // Image Picker Utility Functions (same as before)
  const checkCameraPermission = async () => {
    const cameraPermission = Platform.OS === 'ios'
      ? PERMISSIONS.IOS.CAMERA
      : PERMISSIONS.ANDROID.CAMERA;

    const result = await check(cameraPermission);
    return result === RESULTS.GRANTED;
  };

  const checkMediaPermission = async () => {
    if (Platform.OS === 'ios') {
      const result = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);
      return result === RESULTS.GRANTED;
    } else {
      if (Platform.Version >= 33) {
        const result = await check(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
        return result === RESULTS.GRANTED;
      } else {
        const result = await check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
        return result === RESULTS.GRANTED;
      }
    }
  };

  const takePhotoWithPermissions = async () => {
    try {
      const hasCameraPermission = await checkCameraPermission();
      if (!hasCameraPermission) {
        throw new Error('Camera permission not granted');
      }

      const options = {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
        includeBase64: false,
        saveToPhotos: false,
        cameraType: 'back',
      };

      return new Promise((resolve, reject) => {
        launchCamera(options, (response) => {
          if (response.didCancel) {
            reject(new Error('User cancelled camera'));
          } else if (response.errorCode) {
            reject(new Error(`Camera error: ${response.errorMessage || response.errorCode}`));
          } else if (response.assets && response.assets.length > 0) {
            resolve(response.assets[0]);
          } else {
            reject(new Error('Unknown camera error'));
          }
        });
      });
    } catch (error) {
      throw error;
    }
  };

  const selectPhotoWithPermissions = async () => {
    try {
      const hasMediaPermission = await checkMediaPermission();
      if (!hasMediaPermission) {
        throw new Error('Media library permission not granted');
      }

      const options = {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
        includeBase64: false,
        selectionLimit: 1,
      };

      return new Promise((resolve, reject) => {
        launchImageLibrary(options, (response) => {
          if (response.didCancel) {
            reject(new Error('User cancelled photo selection'));
          } else if (response.errorCode) {
            reject(new Error(`Gallery error: ${response.errorMessage || response.errorCode}`));
          } else if (response.assets && response.assets.length > 0) {
            resolve(response.assets[0]);
          } else {
            reject(new Error('Unknown gallery error'));
          }
        });
      });
    } catch (error) {
      throw error;
    }
  };

  // Data definitions
  const categoryOptions = [
    { label: 'Plastic Waste', value: 'plastic', icon: '🧴' },
    { label: 'Organic/Food Waste', value: 'organic', icon: '🍎' },
    { label: 'Electronic Waste', value: 'electronic', icon: '📱' },
    { label: 'Hazardous Waste', value: 'hazardous', icon: '☢️' },
    { label: 'Construction Debris', value: 'construction', icon: '🏗️' },
    { label: 'Other Waste', value: 'other', icon: '🗑️' }
  ];

  const severityOptions = [
    { label: 'Low', value: 'low', color: '#28a745', description: 'Minor issue, no immediate risk' },
    { label: 'Medium', value: 'medium', color: '#ffc107', description: 'Moderate concern, some risk' },
    { label: 'High', value: 'high', color: '#fd7e14', description: 'Serious concern, health risk' },
    { label: 'Critical', value: 'critical', color: '#dc3545', description: 'Emergency, immediate danger' }
  ];

  const tagOptions = [
    { label: 'Public Park', value: 'public-park', icon: '🏞️' },
    { label: 'Residential Area', value: 'residential', icon: '🏠' },
    { label: 'Water Body', value: 'water-body', icon: '💧' },
    { label: 'Roadside', value: 'roadside', icon: '🛣️' },
    { label: 'Recyclable', value: 'recyclable', icon: '♻️' },
    { label: 'Odorous', value: 'odorous', icon: '👃' },
    { label: 'Animal Attraction', value: 'animal-attraction', icon: '🐀' },
    { label: 'Blocking Path', value: 'blocking', icon: '🚧' },
    { label: 'Burning', value: 'burning', icon: '🔥' },
    { label: 'Long Standing', value: 'long-standing', icon: '⏰' },
    { label: 'Recurring Issue', value: 'recurring', icon: '🔄' }
  ];

  // Main Component Functions
  const initializeApp = async () => {
    try {
      const permissionsGranted = await requestAllPermissions();
      setHasPermissions(permissionsGranted);

      if (!permissionsGranted) {
        Alert.alert(
          'Permissions Required',
          'Some permissions were not granted. The app may not function properly.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.log('Permission initialization error:', error);
      Alert.alert(
        'Error',
        'Failed to initialize app permissions.',
        [{ text: 'OK' }]
      );
    }
  };

  const takePhoto = async () => {
    if (!hasPermissions) {
      Alert.alert('Permissions Needed', 'Please grant all required permissions first.');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Getting location for photo...');
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);

      getAddressFromCoords(currentLocation.latitude, currentLocation.longitude)
        .then(setAddress)
        .catch(error => console.log('Address fetch failed:', error.message));

      console.log('Taking photo...');
      const photo = await takePhotoWithPermissions();
      setImage(photo.uri);

      Alert.alert('Success', 'Photo captured successfully!');
    } catch (error) {
      console.log('Error in takePhoto:', error);
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const selectPhoto = async () => {
    setIsLoading(true);

    try {
      try {
        console.log('Getting location for gallery selection...');
        const currentLocation = await getCurrentLocation();
        setLocation(currentLocation);
        getAddressFromCoords(currentLocation.latitude, currentLocation.longitude)
          .then(setAddress)
          .catch(error => console.log('Address fetch failed:', error.message));
      } catch (locationError) {
        console.log('Location not available for gallery selection:', locationError.message);
      }

      console.log('Selecting photo from gallery...');
      const photo = await selectPhotoWithPermissions();
      setImage(photo.uri);

      Alert.alert('Success', 'Photo selected successfully!');
    } catch (error) {
      console.log('Error selecting photo:', error);
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Tag handling functions
  const handleTagSelect = (tagValue) => {
    const newSelectedTags = [...selectedTags];
    if (newSelectedTags.includes(tagValue)) {
      const index = newSelectedTags.indexOf(tagValue);
      newSelectedTags.splice(index, 1);
    } else {
      if (newSelectedTags.length < 5) { // Limit to 5 tags
        newSelectedTags.push(tagValue);
      } else {
        Alert.alert('Limit Reached', 'Maximum 5 tags allowed');
      }
    }
    setSelectedTags(newSelectedTags);
  };

  const applyTags = () => {
    setTags(selectedTags);
    setShowTagsModal(false);
  };

  // Submit report with all data
  const submitReport = async () => {
    if (!image) {
      Alert.alert('Error', 'Please take or select a photo first');
      return;
    }

    if (submitting) return;

    setSubmitting(true);

    try {
      const formData = new FormData();

      // Append image file
      formData.append('image', {
        uri: image,
        type: 'image/jpeg',
        name: `report_${Date.now()}.jpg`,
      });

      // Append other data
      formData.append('description', description || 'No description provided');
      formData.append('category', category);
      formData.append('severity', severity);
      formData.append('tags', JSON.stringify(tags));

      if (location) {
        formData.append('latitude', location.latitude.toString());
        formData.append('longitude', location.longitude.toString());
        if (location.accuracy) {
          formData.append('accuracy', location.accuracy.toString());
        }
      }

      formData.append('address', address || 'Address not available');
      formData.append('timestamp', new Date().toISOString());
      formData.append('platform', Platform.OS);

      // Append user data if available
      if (userId && userId !== 'guest') {
        formData.append('userId', userId);
      }

      console.log('Submitting report with:', {
        category,
        severity,
        tags,
        userId,
        hasLocation: !!location,
        hasImage: !!image
      });

      // Prepare headers with authorization token
      const headers = {};
      // if (userToken) {
      //   headers['Authorization'] = `Bearer ${userToken}`;
      // }

      const response = await fetch(API_ENDPOINTS.REPORTS, {
        method: 'POST',
        headers,
        body: formData,
      });

      const contentType = response.headers.get('content-type');

      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.log('Non-JSON response:', text.substring(0, 200));
        throw new Error('Server returned non-JSON response');
      }

      console.log('Response data:', data);

      if (response.status === 401) {
        // Token expired or invalid
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userId');
        Alert.alert(
          'Session Expired',
          'Please login again to continue',
          [
            { text: 'Login', onPress: () => navigation.navigate('Login') }
          ]
        );
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || `Server error: ${response.status}`);
      }

      Alert.alert('Success', 'Report submitted successfully!', [
        { text: 'OK', onPress: resetForm }
      ]);

    } catch (error) {
      console.log('Submission error:', error.message);

      if (error.message.includes('Network request failed')) {
        Alert.alert(
          'Network Error',
          'Could not connect to server. Please check:\n1. Server is running\n2. Correct IP address\n3. Network connection',
          [{ text: 'OK' }]
        );
      } else if (error.message.includes('non-JSON response')) {
        Alert.alert(
          'Server Error',
          'Server is not responding properly. Please check backend API.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', error.message || 'Failed to submit report');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setImage(null);
    setDescription('');
    setLocation(null);
    setAddress('');
    setCategory('plastic');
    setSeverity('medium');
    setTags([]);
    setSelectedTags([]);
  };

  // Helper functions to get display values
  const getCategoryLabel = (value) => {
    const category = categoryOptions.find(c => c.value === value);
    return category ? `${category.icon} ${category.label}` : 'Select Category';
  };

  const getSeverityLabel = (value) => {
    const severity = severityOptions.find(s => s.value === value);
    return severity ? severity.label : 'Select Severity';
  };

  const getSeverityColor = (value) => {
    const severity = severityOptions.find(s => s.value === value);
    return severity ? severity.color : '#6c757d';
  };

  // Modal Components
  const CategoryModal = () => (
    <Modal
      visible={showCategoryModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowCategoryModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Waste Category</Text>
          <FlatList
            data={categoryOptions}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.modalItem,
                  category === item.value && styles.selectedItem
                ]}
                onPress={() => {
                  setCategory(item.value);
                  setShowCategoryModal(false);
                }}
              >
                <Text style={styles.modalItemText}>
                  {item.icon} {item.label}
                </Text>
                {category === item.value && (
                  <Text style={styles.selectedIcon}>✓</Text>
                )}
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowCategoryModal(false)}
          >
            <Text style={styles.modalCloseText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const SeverityModal = () => (
    <Modal
      visible={showSeverityModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowSeverityModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Severity Level</Text>
          <FlatList
            data={severityOptions}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.modalItem,
                  severity === item.value && styles.selectedItem,
                  { borderLeftColor: item.color, borderLeftWidth: 4 }
                ]}
                onPress={() => {
                  setSeverity(item.value);
                  setShowSeverityModal(false);
                }}
              >
                <View>
                  <Text style={styles.modalItemText}>
                    {item.label}
                  </Text>
                  <Text style={styles.modalItemDescription}>
                    {item.description}
                  </Text>
                </View>
                {severity === item.value && (
                  <Text style={styles.selectedIcon}>✓</Text>
                )}
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowSeverityModal(false)}
          >
            <Text style={styles.modalCloseText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const TagsModal = () => (
    <Modal
      visible={showTagsModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowTagsModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Tags (Max 5)</Text>
          <Text style={styles.modalSubtitle}>
            Selected: {selectedTags.length}/5
          </Text>
          <FlatList
            data={tagOptions}
            keyExtractor={(item) => item.value}
            numColumns={2}
            columnWrapperStyle={styles.tagsColumnWrapper}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.tagItem,
                  selectedTags.includes(item.value) && styles.selectedTag
                ]}
                onPress={() => handleTagSelect(item.value)}
              >
                <Text style={styles.tagIcon}>{item.icon}</Text>
                <Text style={styles.tagLabel}>{item.label}</Text>
                {selectedTags.includes(item.value) && (
                  <View style={styles.tagCheck}>
                    <Text style={styles.tagCheckText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
          <View style={styles.modalButtonRow}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalSecondaryButton]}
              onPress={() => {
                setSelectedTags([]);
                setTags([]);
                setShowTagsModal(false);
              }}
            >
              <Text style={styles.modalButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={applyTags}
            >
              <Text style={styles.modalButtonText}>Apply Tags</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Report Garbage</Text>

      {/* Image Section */}
      <View style={styles.imageSection}>
        <Text style={styles.sectionTitle}>Photo Evidence</Text>

        {image ? (
          <Image source={{ uri: image }} style={styles.imagePreview} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>No image selected</Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, (isLoading || submitting) && styles.disabledButton]}
            onPress={takePhoto}
            disabled={isLoading || submitting}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Take Photo</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton, (isLoading || submitting) && styles.disabledButton]}
            onPress={selectPhoto}
            disabled={isLoading || submitting}
          >
            <Text style={styles.buttonText}>Choose from Gallery</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category, Severity, Tags Section */}
      <View style={styles.classificationSection}>
        <Text style={styles.sectionTitle}>Classification</Text>

        {/* Category Selector */}
        <TouchableOpacity
          style={styles.selectorButton}
          onPress={() => setShowCategoryModal(true)}
          disabled={submitting}
        >
          <Text style={styles.selectorLabel}>Waste Category</Text>
          <Text style={styles.selectorValue}>{getCategoryLabel(category)}</Text>
        </TouchableOpacity>

        {/* Severity Selector */}
        <TouchableOpacity
          style={[
            styles.selectorButton,
            { borderLeftColor: getSeverityColor(severity), borderLeftWidth: 4 }
          ]}
          onPress={() => setShowSeverityModal(true)}
          disabled={submitting}
        >
          <Text style={styles.selectorLabel}>Severity Level</Text>
          <Text style={styles.selectorValue}>{getSeverityLabel(severity)}</Text>
        </TouchableOpacity>

        {/* Tags Selector */}
        <TouchableOpacity
          style={styles.selectorButton}
          onPress={() => {
            setSelectedTags(tags);
            setShowTagsModal(true);
          }}
          disabled={submitting}
        >
          <Text style={styles.selectorLabel}>Tags</Text>
          <View style={styles.tagsContainer}>
            {tags.length > 0 ? (
              <View style={styles.tagsRow}>
                {tags.slice(0, 3).map((tag, index) => {
                  const tagOption = tagOptions.find(t => t.value === tag);
                  return (
                    <View key={index} style={styles.tagBadge}>
                      <Text style={styles.tagBadgeText}>
                        {tagOption?.icon} {tagOption?.label.substring(0, 10)}
                        {tagOption?.label.length > 10 ? '...' : ''}
                      </Text>
                    </View>
                  );
                })}
                {tags.length > 3 && (
                  <View style={styles.tagBadge}>
                    <Text style={styles.tagBadgeText}>+{tags.length - 3} more</Text>
                  </View>
                )}
              </View>
            ) : (
              <Text style={styles.selectorPlaceholder}>No tags selected</Text>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Location Section */}
      {location && (
        <View style={styles.locationSection}>
          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.locationText}>
            Latitude: {location.latitude.toFixed(6)}
          </Text>
          <Text style={styles.locationText}>
            Longitude: {location.longitude.toFixed(6)}
          </Text>
          {location.accuracy && (
            <Text style={styles.locationText}>
              Accuracy: {location.accuracy.toFixed(2)} meters
            </Text>
          )}
          <Text style={styles.addressText}>{address}</Text>
        </View>
      )}

      {/* Description Section */}
      <View style={styles.descriptionSection}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.descriptionHelp}>
          Describe the garbage issue, type of waste, quantity, and any other relevant details
        </Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g., Plastic bottles and food wrappers scattered near the park entrance..."
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
          textAlignVertical="top"
          maxLength={500}
          editable={!submitting}
        />
        <Text style={styles.charCount}>
          {description.length}/500 characters
        </Text>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, (!image || submitting) && styles.disabledButton]}
        onPress={submitReport}
        disabled={submitting || !image}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>
            {image ? 'Submit Report' : 'Add Photo First'}
          </Text>
        )}
      </TouchableOpacity>

      {/* Server Connection Test */}
      <TouchableOpacity
        style={[styles.testButton, submitting && styles.disabledButton]}
        onPress={testServerConnection}
        disabled={submitting}
      >
        <Text style={styles.testButtonText}>Test Server Connection</Text>
      </TouchableOpacity>

      {/* Debug Info - Remove in production */}
      {__DEV__ && (
        <View style={styles.debugSection}>
          <Text style={styles.debugTitle}>Debug Info</Text>
          <Text style={styles.debugText}>Permissions: {hasPermissions ? '✅ Granted' : '❌ Missing'}</Text>
          <Text style={styles.debugText}>Location: {location ? '✅ Available' : '❌ Unavailable'}</Text>
          <Text style={styles.debugText}>Image: {image ? '✅ Selected' : '❌ Not selected'}</Text>
          <Text style={styles.debugText}>Category: {category}</Text>
          <Text style={styles.debugText}>Severity: {severity}</Text>
          <Text style={styles.debugText}>Tags: {tags.length} selected</Text>
          <Text style={styles.debugText}>Submitting: {submitting ? '⏳' : '✅ Ready'}</Text>
        </View>
      )}

      {/* Modals */}
      <CategoryModal />
      <SeverityModal />
      <TagsModal />
    </ScrollView>
  );
};

// Server test function
const testServerConnection = async () => {
  Alert.alert(
    'Testing Server',
    'Testing connection to server',
    [
      {
        text: 'Test',
        onPress: async () => {
          try {
            const response = await fetch(API_ENDPOINTS.TEST);
            Alert.alert(
              'Server Test Result',
              `Status: ${response.status}`,
              [{ text: 'OK' }]
            );
          } catch (error) {
            Alert.alert(
              'Connection Failed',
              `Error: ${error.message}`,
              [{ text: 'OK' }]
            );
          }
        }
      },
      { text: 'Cancel' }
    ]
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#2c3e50',
  },
  imageSection: {
    marginBottom: 24,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#2c3e50',
  },
  classificationSection: {
    marginBottom: 24,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectorButton: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  selectorLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  selectorValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
  },
  selectorPlaceholder: {
    fontSize: 16,
    color: '#adb5bd',
    fontStyle: 'italic',
  },
  tagsContainer: {
    marginTop: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagBadge: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagBadgeText: {
    fontSize: 12,
    color: '#495057',
  },
  imagePreview: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
  },
  placeholder: {
    width: '100%',
    height: 250,
    backgroundColor: '#e9ecef',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#dee2e6',
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: '#6c757d',
    fontSize: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  secondaryButton: {
    backgroundColor: '#6C757D',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  locationSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationText: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  addressText: {
    fontSize: 14,
    color: '#2c3e50',
    fontStyle: 'italic',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  descriptionSection: {
    marginBottom: 24,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  descriptionHelp: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  textInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    color: '#2c3e50',
  },
  charCount: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'right',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#28A745',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
    shadowColor: '#28A745',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 12,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  testButton: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  debugSection: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#6c757d',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2c3e50',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  selectedItem: {
    backgroundColor: '#e8f5e9',
  },
  modalItemText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  modalItemDescription: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
  },
  selectedIcon: {
    color: '#28a745',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#6c757d',
  },
  // Tags Modal Styles
  tagsColumnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tagItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 10,
  },
  selectedTag: {
    backgroundColor: '#d4edda',
    borderColor: '#28a745',
  },
  tagIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  tagLabel: {
    fontSize: 14,
    color: '#2c3e50',
    textAlign: 'center',
  },
  tagCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#28a745',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagCheckText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  modalSecondaryButton: {
    backgroundColor: '#6c757d',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default GarbageReport;
