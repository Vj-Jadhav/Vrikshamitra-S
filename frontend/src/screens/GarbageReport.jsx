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
  Platform
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Geolocation from '@react-native-community/geolocation';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const GarbageReport = () => {
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [hasPermissions, setHasPermissions] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  // Permissions Utility Functions
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

      // Check if all essential permissions are granted
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

  // Location Utility Functions
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

        const locationOptions = {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 1000 * 60 * 5,
        };

        console.log('Requesting location...');

        Geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            console.log('Location obtained:', { latitude, longitude, accuracy });
            
            resolve({
              latitude,
              longitude,
              accuracy,
              timestamp: position.timestamp,
            });
          },
          (error) => {
            console.log('Location error details:', {
              code: error.code,
              message: error.message,
            });

            let errorMessage = 'Failed to get location';
            
            switch (error.code) {
              case 1: // PERMISSION_DENIED
                errorMessage = 'Location permission denied. Please enable location services in app settings.';
                break;
              case 2: // POSITION_UNAVAILABLE
                errorMessage = 'Location information unavailable. Please check your GPS and network connection.';
                break;
              case 3: // TIMEOUT
                errorMessage = 'Location request timed out. Please try again.';
                break;
              default:
                errorMessage = error.message || 'Unknown location error';
            }
            
            reject(new Error(errorMessage));
          },
          locationOptions
        );
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
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
      );
      
      if (!response.ok) {
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
      console.log('Geocoding error:', error);
      
      try {
        const fallbackResponse = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          return fallbackData.locality || fallbackData.city || fallbackData.countryName || 'Location recorded';
        }
      } catch (fallbackError) {
        console.log('Fallback geocoding also failed:', fallbackError);
      }
      
      return 'Location recorded (address unavailable)';
    }
  };

  // Image Picker Utility Functions
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
      // Get location first
      console.log('Getting location for photo...');
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);
      
      // Get address (async, don't wait)
      getAddressFromCoords(currentLocation.latitude, currentLocation.longitude)
        .then(setAddress)
        .catch(error => console.log('Address fetch failed:', error.message));

      // Take photo
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
      // Try to get location for context
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

  const submitReport = async () => {
    if (!image) {
      Alert.alert('Error', 'Please take or select a photo first');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      
      formData.append('image', {
        uri: image,
        type: 'image/jpeg',
        name: 'garbage_report.jpg',
      });
      
      formData.append('description', description);
      
      if (location) {
        formData.append('latitude', location.latitude.toString());
        formData.append('longitude', location.longitude.toString());
      }
      
      formData.append('address', address);
      formData.append('timestamp', new Date().toISOString());

      // Your API call here - replace with your actual backend endpoint
      console.log('Submitting report...', {
        image: image,
        description: description,
        location: location,
        address: address
      });
      
      // Simulate API call - replace this with actual fetch to your backend
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Example of actual API call (uncomment and modify for your backend):
      /*
      const response = await fetch('YOUR_BACKEND_API/reports', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to submit report to server');
      }
      */

      Alert.alert('Success', 'Report submitted successfully!');
      resetForm();
    } catch (error) {
      console.log('Submission error:', error);
      Alert.alert('Error', error.message || 'Failed to submit report');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setImage(null);
    setDescription('');
    setLocation(null);
    setAddress('');
  };

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
            style={[styles.button, isLoading && styles.disabledButton]} 
            onPress={takePhoto}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Take Photo</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton, isLoading && styles.disabledButton]} 
            onPress={selectPhoto}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Choose from Gallery</Text>
          </TouchableOpacity>
        </View>
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
        />
        <Text style={styles.charCount}>
          {description.length}/500 characters
        </Text>
      </View>

      {/* Submit Button */}
      <TouchableOpacity 
        style={[styles.submitButton, (!image || isLoading) && styles.disabledButton]} 
        onPress={submitReport}
        disabled={isLoading || !image}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>
            {image ? 'Submit Report' : 'Add Photo First'}
          </Text>
        )}
      </TouchableOpacity>

      {/* Debug Info - Remove in production */}
      {__DEV__ && (
        <View style={styles.debugSection}>
          <Text style={styles.debugTitle}>Debug Info</Text>
          <Text style={styles.debugText}>Permissions: {hasPermissions ? '✅ Granted' : '❌ Missing'}</Text>
          <Text style={styles.debugText}>Location: {location ? '✅ Available' : '❌ Unavailable'}</Text>
          <Text style={styles.debugText}>Image: {image ? '✅ Selected' : '❌ Not selected'}</Text>
        </View>
      )}
    </ScrollView>
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
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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
});

export default GarbageReport;