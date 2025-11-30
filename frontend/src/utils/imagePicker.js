// utils/imagePicker.js
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { checkCameraPermission, checkMediaPermission } from './permissions';

export const takePhotoWithPermissions = async () => {
  try {
    // Check camera permission
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
      saveToPhotos: false, // Set to true if you want to save to gallery
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

export const selectPhotoWithPermissions = async () => {
  try {
    // Check media/library permission
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
      selectionLimit: 1, // Only allow single selection
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