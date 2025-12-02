// utils/permissions.js
import { Platform } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

// Define permissions based on Android API level
const getAndroidPermissions = () => {
  const permissions = [
    PERMISSIONS.ANDROID.CAMERA,
    PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  ];

  // For Android 13+ (API 33+)
  if (Platform.Version >= 33) {
    permissions.push(
      PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
      PERMISSIONS.ANDROID.READ_MEDIA_VIDEO
    );
  } else {
    // For Android 10-12
    permissions.push(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
  }

  return permissions;
};

export const requestAllPermissions = async () => {
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
      console.log(`Permission ${permission}: ${result}`);
    }

    return results;
  } catch (error) {
    console.log('Permission error:', error);
    throw error;
  }
};

export const checkCameraPermission = async () => {
  const cameraPermission = Platform.OS === 'ios' 
    ? PERMISSIONS.IOS.CAMERA
    : PERMISSIONS.ANDROID.CAMERA;

  const result = await check(cameraPermission);
  return result === RESULTS.GRANTED;
};

export const checkLocationPermission = async () => {
  const locationPermission = Platform.OS === 'ios' 
    ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
    : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

  const result = await check(locationPermission);
  return result === RESULTS.GRANTED;
};

export const checkMediaPermission = async () => {
  if (Platform.OS === 'ios') {
    const result = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);
    return result === RESULTS.GRANTED;
  } else {
    // For Android
    if (Platform.Version >= 33) {
      const result = await check(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
      return result === RESULTS.GRANTED;
    } else {
      const result = await check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
      return result === RESULTS.GRANTED;
    }
  }
};