// utils/location.js
import Geolocation from '@react-native-community/geolocation';
import { Platform } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

// Location permission check
export const checkLocationPermission = async () => {
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

// Request location permission
export const requestLocationPermission = async () => {
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

// Get current location with proper error handling
export const getCurrentLocation = () => {
  return new Promise(async (resolve, reject) => {
    try {
      // Check if we have location permission
      const hasPermission = await checkLocationPermission();
      
      if (!hasPermission) {
        // Request permission if not granted
        const permissionGranted = await requestLocationPermission();
        if (!permissionGranted) {
          reject(new Error('Location permission denied'));
          return;
        }
      }

      // Configure location options
      const locationOptions = {
        enableHighAccuracy: true,
        timeout: 15000, // 15 seconds
        maximumAge: 1000 * 60 * 5, // 5 minutes
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
            PERMISSION_DENIED: error.PERMISSION_DENIED,
            POSITION_UNAVAILABLE: error.POSITION_UNAVAILABLE,
            TIMEOUT: error.TIMEOUT,
          });

          let errorMessage = 'Failed to get location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location services in app settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable. Please check your GPS and network connection.';
              break;
            case error.TIMEOUT:
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

// Get address from coordinates using reverse geocoding
export const getAddressFromCoords = async (latitude, longitude) => {
  try {
    console.log('Reverse geocoding for:', latitude, longitude);
    
    // Using OpenStreetMap Nominatim (free, no API key required)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
    );
    
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Geocoding response:', data);
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    // Extract address components
    const address = data.address;
    let formattedAddress = '';
    
    if (address) {
      // Build address string from components
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
    
    // Fallback to a simpler service if Nominatim fails
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

// Watch location for continuous updates (optional)
export const watchLocation = (onLocationUpdate, onError) => {
  const watchId = Geolocation.watchPosition(
    (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      onLocationUpdate({ latitude, longitude, accuracy });
    },
    (error) => {
      console.log('Location watch error:', error);
      if (onError) onError(error);
    },
    {
      enableHighAccuracy: true,
      distanceFilter: 10, // Update every 10 meters
      interval: 5000, // Update every 5 seconds
      fastestInterval: 2000, // Fastest update interval
    }
  );
  
  return watchId;
};

// Stop watching location
export const clearLocationWatch = (watchId) => {
  if (watchId) {
    Geolocation.clearWatch(watchId);
  }
};

// Calculate distance between two coordinates (in kilometers)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
};

// Check if location is within a certain radius
export const isWithinRadius = (centerLat, centerLon, targetLat, targetLon, radiusKm) => {
  const distance = calculateDistance(centerLat, centerLon, targetLat, targetLon);
  return distance <= radiusKm;
};

// Format coordinates for display
export const formatCoordinates = (latitude, longitude, decimalPlaces = 6) => {
  return {
    latitude: latitude.toFixed(decimalPlaces),
    longitude: longitude.toFixed(decimalPlaces),
    full: `${latitude.toFixed(decimalPlaces)}, ${longitude.toFixed(decimalPlaces)}`
  };
};

// Validate coordinates
export const isValidCoordinates = (latitude, longitude) => {
  return (
    typeof latitude === 'number' && 
    typeof longitude === 'number' &&
    latitude >= -90 && 
    latitude <= 90 &&
    longitude >= -180 && 
    longitude <= 180
  );
};

// Get location with retry mechanism
export const getCurrentLocationWithRetry = async (maxRetries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Location attempt ${attempt} of ${maxRetries}`);
      const location = await getCurrentLocation();
      return location;
    } catch (error) {
      console.log(`Location attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
};

export default {
  checkLocationPermission,
  requestLocationPermission,
  getCurrentLocation,
  getAddressFromCoords,
  watchLocation,
  clearLocationWatch,
  calculateDistance,
  isWithinRadius,
  formatCoordinates,
  isValidCoordinates,
  getCurrentLocationWithRetry,
};