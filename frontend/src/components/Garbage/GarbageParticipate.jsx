// screens/ComplaintsListScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
  RefreshControl,
  TextInput,
  Linking,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../../config/config';
import {
  AccessTimeIcon,
  LocationOnIcon,
  PersonIcon,
  AddIcon,
  LoginIcon,
  CloseIcon,
  CalendarTodayIcon,
  PeopleIcon,
  CalendarCheckIcon,
  RemoveIcon,
  WarningIcon,
  ReportProblemIcon,
  ShareIcon,
  WhatsAppIcon,
} from '../CustomIcon';
import Share from 'react-native-share';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';


const ComplaintsListScreen = ({ navigation }) => {
  // ALL HOOKS AT TOP LEVEL - NEVER INSIDE CONDITIONALS
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [scheduling, setScheduling] = useState(false);
  const [scheduleCounts, setScheduleCounts] = useState({});
  const [loadingScheduleCounts, setLoadingScheduleCounts] = useState(false);
  
  const [notes, setNotes] = useState('');
  const [participantCount, setParticipantCount] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });
  const [loadingMore, setLoadingMore] = useState(false);
  const [token, setToken] = useState(null);
  const [userScheduledEvents, setUserScheduledEvents] = useState({});
  const [sharing, setSharing] = useState(false);

  // Cleanup Submission State
  const [cleanupImage, setCleanupImage] = useState(null);
  const [showCleanupModal, setShowCleanupModal] = useState(false);
  const [submittingCleanup, setSubmittingCleanup] = useState(false);

  // Load token from AsyncStorage
  const loadToken = async () => {
    try {
      const userToken = await AsyncStorage.getItem('authToken');
      if (userToken) {
        setToken(userToken);
        fetchUserScheduledEvents(userToken);
      }
    } catch (error) {
      console.error('Error loading token:', error);
    }
  };

  // Fetch user's scheduled events
  const fetchUserScheduledEvents = async (tokenOverride = null) => {
    const tokenToUse = tokenOverride || token;

    if (!tokenToUse) return;

    try {
      const response = await fetch(API_ENDPOINTS.USER_SCHEDULES, {
        headers: {
          'Authorization': `Bearer ${tokenToUse}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const scheduleMap = {};
          result.data.forEach(schedule => {
            if (schedule.report) {
              scheduleMap[schedule.report._id] = schedule;
            }
          });
          setUserScheduledEvents(scheduleMap);
        }
      }
    } catch (error) {
      console.error('Error fetching user schedules:', error);
    }
  };

  // Check if user has scheduled for a specific report
  const hasUserScheduled = (reportId) => {
    return userScheduledEvents[reportId] !== undefined;
  };

  // Get user's schedule data for a report
  const getUserScheduleData = (reportId) => {
    return userScheduledEvents[reportId] || null;
  };

  useEffect(() => {
    loadToken();
    fetchReports();
  }, []);

  // Fetch schedule counts when schedule modal opens
  useEffect(() => {
    if (showScheduleModal) {
      fetchScheduleCounts();
    }
  }, [showScheduleModal]);

  // ------------------------------------------------------------------
  // CLEANUP SUBMISSION LOGIC
  // ------------------------------------------------------------------

  const checkCameraPermission = async () => {
    const cameraPermission = Platform.OS === 'ios'
      ? PERMISSIONS.IOS.CAMERA
      : PERMISSIONS.ANDROID.CAMERA;
    const result = await check(cameraPermission);
    if (result === RESULTS.DENIED) {
      return await request(cameraPermission) === RESULTS.GRANTED;
    }
    return result === RESULTS.GRANTED;
  };

  const checkMediaPermission = async () => {
    if (Platform.OS === 'ios') {
      const result = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);
      if (result === RESULTS.DENIED) return await request(PERMISSIONS.IOS.PHOTO_LIBRARY) === RESULTS.GRANTED;
      return result === RESULTS.GRANTED;
    } else {
      if (Platform.Version >= 33) {
        const result = await check(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
        if (result === RESULTS.DENIED) return await request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES) === RESULTS.GRANTED;
        return result === RESULTS.GRANTED;
      } else {
        const result = await check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
        if (result === RESULTS.DENIED) return await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE) === RESULTS.GRANTED;
        return result === RESULTS.GRANTED;
      }
    }
  };

  const handleTakeCleanupPhoto = async () => {
    const hasPermission = await checkCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera permission is required.');
      return;
    }

    const options = {
      mediaType: 'photo',
      quality: 0.7,
      maxWidth: 1024,
      maxHeight: 1024,
      cameraType: 'back',
      saveToPhotos: false,
    };

    launchCamera(options, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage);
        return;
      }
      if (response.assets && response.assets.length > 0) {
        setCleanupImage(response.assets[0]);
      }
    });
  };

  const handleSelectCleanupPhoto = async () => {
    const hasPermission = await checkMediaPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Gallery permission is required.');
      return;
    }

    const options = {
      mediaType: 'photo',
      quality: 0.7,
      selectionLimit: 1,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage);
        return;
      }
      if (response.assets && response.assets.length > 0) {
        setCleanupImage(response.assets[0]);
      }
    });
  };

  const submitCleanupEvidence = async () => {
    if (!cleanupImage || !selectedReport) {
      Alert.alert('Error', 'Please provide an image of the cleaned place.');
      return;
    }

    try {
      setSubmittingCleanup(true);
      const formData = new FormData();

      formData.append('image', {
        uri: cleanupImage.uri,
        type: cleanupImage.type || 'image/jpeg',
        name: cleanupImage.fileName || `cleanup_${Date.now()}.jpg`,
      });

      // Add user info if needed, though token handles auth
      // endpoint: /api/reports/:id/cleanup
      const endpoint = `${API_ENDPOINTS.REPORTS}/${selectedReport._id}/cleanup`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data', // Usually handled automatically by fetch with FormData
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        Alert.alert('Success', 'Cleanup evidence submitted! Waiting for approval.');
        setShowCleanupModal(false);
        setCleanupImage(null);
        fetchReports(); // Refresh to update status if backend changes it immediately
      } else {
        throw new Error(result.message || 'Failed to submit evidence');
      }

    } catch (error) {
      console.error('Submit cleanup error:', error);
      Alert.alert('Error', error.message || 'Failed to submit cleanup evidence.');
    } finally {
      setSubmittingCleanup(false);
    }
  };

  const fetchReports = async (page = 1, isLoadMore = false) => {
    try {
      if (!isLoadMore) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      const response = await fetch(`${API_ENDPOINTS.REPORTS}?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch reports');
      }

      const newReports = result.data || [];

      if (isLoadMore) {
        setReports(prev => [...prev, ...newReports]);
      } else {
        setReports(newReports);
      }

      setPagination(result.pagination || {
        page,
        limit: pagination.limit,
        total: newReports.length,
        pages: 1,
      });

    } catch (error) {
      console.error('Error fetching reports:', error);
      Alert.alert('Error', 'Failed to fetch reports. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const fetchScheduleCounts = async () => {
    try {
      setLoadingScheduleCounts(true);
      const response = await fetch(`${API_ENDPOINTS.SCHEDULE_COUNTS}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setScheduleCounts(result.data);
      }
    } catch (error) {
      console.error('Error fetching schedule counts:', error);
    } finally {
      setLoadingScheduleCounts(false);
    }
  };

  const getScheduleCountForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return scheduleCounts[dateStr] || 0;
  };

  const loadMoreReports = () => {
    if (!loadingMore && pagination.page < pagination.pages) {
      const nextPage = pagination.page + 1;
      fetchReports(nextPage, true);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports(1, false);
  };

  const openReportDetails = (report) => {
    setSelectedReport(report);
    setModalVisible(true);
  };

  // Track share event (optional analytics)
  const trackShareEvent = async (reportId, platform) => {

    console.log("canOpenURL?", await Linking.canOpenURL("whatsapp://send?text=hi"));

    try {
      await fetch(`${API_ENDPOINTS.TRACK_SHARE}/${reportId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ platform }),
      });
    } catch (error) {
      console.error('Error tracking share:', error);
    }
  };

  // Share to WhatsApp function
  const shareToWhatsApp = useCallback(async (report, scheduleData, scheduleResult) => {
    let shareMessage = '';
    try {
      setSharing(true);

      shareMessage = `🌟 JOIN THE CLEANUP MOVEMENT! 🌟

🗓️ *I just signed up to clean up:*
📍 ${report.address}
📅 Date: ${new Date(scheduleData.scheduledDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}
⏰ Time: ${scheduleData.scheduledTime}
👥 I'm bringing: ${scheduleData.participantCount}

Join us to make a difference! #Vrikshamitra`;

      // --------------------------------------------
      // 1. CHECK BOTH WHATSAPP & WHATSAPP BUSINESS
      // --------------------------------------------
      console.log('Checking WhatsApp installation...');
      const normal = await Share.isPackageInstalled('com.whatsapp');
      const business = await Share.isPackageInstalled('com.whatsapp.w4b');

      console.log('WhatsApp checks:', { normal, business });

      const isInstalled = normal.isInstalled || business.isInstalled;

      if (!isInstalled) {
        // If not installed, throw error to trigger fallback or handle it
        throw new Error('WhatsApp not installed');
      }

      // force correct package
      const packageToUse = normal.isInstalled
        ? 'com.whatsapp'
        : 'com.whatsapp.w4b';

      console.log('Using package:', packageToUse);

      // --------------------------------------------
      // 2. SHARE USING shareSingle
      // --------------------------------------------
      const options = {
        social: Share.Social.WHATSAPP,
        message: shareMessage,
        appId: packageToUse,
      };

      if (report.imageUrl) {
        options.url = report.imageUrl;
        options.type = 'image/jpeg';
      }

      console.log('Sharing with options:', options);

      await Share.shareSingle(options);

      await trackShareEvent(report._id, 'whatsapp');

    } catch (error) {
      console.error('WhatsApp share error:', error);

      try {
        // Fallback to generic share
        const fallbackOptions = {
          title: 'Share Cleanup Event',
          message: shareMessage,
        };

        if (report.imageUrl) {
          fallbackOptions.url = report.imageUrl;
        }

        await Share.open(fallbackOptions);
      } catch (e) {
        console.error('Fallback share error:', e);
      }

    } finally {
      setSharing(false);
    }
  }, []);



  const scheduleCleanup = async () => {
    if (!selectedReport) return;

    if (!token) {
      Alert.alert(
        'Authentication Required',
        'Please login to schedule a cleanup.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }

    try {
      setScheduling(true);

      const scheduleData = {
        reportId: selectedReport._id,
        scheduledDate: selectedDate.toISOString().split('T')[0],
        scheduledTime: selectedTime.toISOString().split('T')[1].slice(0, 5),
        participantCount: parseInt(participantCount),
        notes: notes.trim(),
      };

      const response = await fetch(API_ENDPOINTS.SCHEDULE_CLEANUP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(scheduleData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to schedule cleanup');
      }

      const result = await response.json();

      if (result.success) {
        setUserScheduledEvents(prev => ({
          ...prev,
          [selectedReport._id]: result.data
        }));

        Alert.alert(
          'Success',
          'Cleanup scheduled successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                setModalVisible(false);
                setShowScheduleModal(false);
                setNotes('');
                setParticipantCount(1);
                fetchReports();
                fetchScheduleCounts();
              }
            },
            {
              text: 'Share on WhatsApp',
              onPress: () => shareToWhatsApp(selectedReport, scheduleData, result.data)
            }
          ]
        );
      } else {
        throw new Error(result.message || 'Failed to schedule cleanup');
      }
    } catch (error) {
      console.error('Error scheduling cleanup:', error);

      if (error.message.includes('Unauthorized') || error.message.includes('token')) {
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please login again.',
          [
            { text: 'OK', onPress: () => navigation.navigate('Login') }
          ]
        );
        await AsyncStorage.removeItem('userToken');
        setToken(null);
        setUserScheduledEvents({});
      } else {
        Alert.alert('Error', error.message || 'Failed to schedule cleanup. Please try again.');
      }
    } finally {
      setScheduling(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return '#28a745';
      case 'in_progress': return '#007bff';
      case 'reviewed': return '#17a2b8';
      case 'pending': return '#ffc107';
      case 'rejected': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getCategoryLabel = (category) => {
    const categoryLabels = {
      'plastic': 'Plastic Waste',
      'organic': 'Organic Waste',
      'electronic': 'Electronic Waste',
      'hazardous': 'Hazardous Waste',
      'construction': 'Construction Debris',
      'other': 'Other Waste',
    };
    return categoryLabels[category] || 'General';
  };

  const renderReportCard = ({ item }) => (
    <TouchableOpacity
      style={styles.reportCard}
      onPress={() => openReportDetails(item)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>
            {getCategoryLabel(item.category)}
          </Text>
        </View>
        <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(item.severity) }]}>
          <Text style={styles.severityText}>
            {item.severity?.charAt(0).toUpperCase() + item.severity?.slice(1) || 'Medium'}
          </Text>
        </View>
      </View>

      {item.imageUrl && (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.reportImage}
          resizeMode="cover"
        />
      )}

      <Text style={styles.description} numberOfLines={2}>
        {item.description || 'No description provided'}
      </Text>

      <View style={styles.statusSection}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>
            {item.status?.replace('_', ' ').charAt(0).toUpperCase() + item.status?.slice(1) || 'Pending'}
          </Text>
        </View>

        {hasUserScheduled(item._id) && (
          <TouchableOpacity
            style={styles.smallShareButton}
            onPress={() => {
              const scheduleData = getUserScheduleData(item._id);
              shareToWhatsApp(item, {
                scheduledDate: scheduleData.scheduledDate,
                scheduledTime: scheduleData.scheduledTime,
                participantCount: scheduleData.participantCount,
              }, scheduleData);
            }}
          >
            <ShareIcon size={16} color="#25D366" />
          </TouchableOpacity>
        )}

        <View style={styles.timeInfo}>
          <AccessTimeIcon size={14} color="#666" />
          <Text style={styles.timeText}>
            {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.locationInfo}>
          <LocationOnIcon size={14} color="#666" />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.address || 'Location not available'}
          </Text>
        </View>

        <View style={styles.participantInfo}>
          <PersonIcon size={14} color="#666" />
          <Text style={styles.participantText}>
            {item.reportedBy?.userType || 'Guest'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderDateSelector = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    const dates = [
      { label: 'Today', date: today },
      { label: 'Tomorrow', date: tomorrow },
      { label: dayAfterTomorrow.toLocaleDateString('en-US', { weekday: 'short' }), date: dayAfterTomorrow },
    ];

    for (let i = 3; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push({
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date
      });
    }

    return (
      <View style={styles.dateSelector}>
        <Text style={styles.formLabel}>Select Date</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateScrollView}
        >
          {dates.map((dateItem, index) => {
            const dateStr = dateItem.date.toISOString().split('T')[0];
            const isSelected = selectedDate.toDateString() === dateItem.date.toDateString();
            const count = scheduleCounts[dateStr] || 0;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dateOption,
                  isSelected && styles.dateOptionSelected
                ]}
                onPress={() => setSelectedDate(dateItem.date)}
              >
                <Text style={[
                  styles.dateOptionDay,
                  isSelected && styles.dateOptionDaySelected
                ]}>
                  {dateItem.label}
                </Text>
                <Text style={[
                  styles.dateOptionDate,
                  isSelected && styles.dateOptionDateSelected
                ]}>
                  {dateItem.date.getDate()}
                </Text>
                <View style={styles.peopleCountBadge}>
                  <PeopleIcon size={12} color="#666" />
                  <Text style={styles.peopleCountText}>{count}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.selectedDateInfo}>
          <View style={styles.dateInfoRow}>
            <CalendarTodayIcon size={20} color="#0000" />
            <Text style={styles.selectedDateText}>
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>
          <View style={styles.peopleInfoRow}>
            <PeopleIcon size={12} color="#666" />
            <Text style={styles.peopleInfoText}>
              {getScheduleCountForDate(selectedDate)} people already scheduled for this date
            </Text>
          </View>
        </View>
      </View>
    );
  };


  const renderCleanupModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showCleanupModal}
      onRequestClose={() => setShowCleanupModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Submit Cleanup Evidence</Text>
            <TouchableOpacity onPress={() => setShowCleanupModal(false)}>
              <CloseIcon size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView>
            <Text style={styles.detailLabel}>
              Great job participating! Please upload a photo of the cleaned area as proof.
            </Text>

            <View style={styles.imagePickerContainer}>
              {cleanupImage ? (
                <View>
                  <Image
                    source={{ uri: cleanupImage.uri }}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setCleanupImage(null)}
                  >
                    <CloseIcon size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.uploadButtonsRow}>
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={handleTakeCleanupPhoto}
                  >
                    <Text style={styles.uploadButtonText}>📷 Take Photo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={handleSelectCleanupPhoto}
                  >
                    <Text style={styles.uploadButtonText}>🖼️ Gallery</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {cleanupImage && (
              <TouchableOpacity
                style={[styles.submitCleanupButton, submittingCleanup && styles.disabledButton]}
                onPress={submitCleanupEvidence}
                disabled={submittingCleanup}
              >
                {submittingCleanup ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitCleanupButtonText}>Submit Evidence</Text>
                )}
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderReportDetailsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {selectedReport && (
            <>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Report Details</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <CloseIcon size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <ScrollView>
                {selectedReport.imageUrl && (
                  <Image
                    source={{ uri: selectedReport.imageUrl }}
                    style={styles.modalImage}
                    resizeMode="cover"
                  />
                )}

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Description</Text>
                  <Text style={styles.detailValue}>
                    {selectedReport.description || 'No description provided'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Category</Text>
                    <Text style={styles.detailValue}>
                      {getCategoryLabel(selectedReport.category)}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Severity</Text>
                    <Text style={[
                      styles.detailValue,
                      { color: getSeverityColor(selectedReport.severity) }
                    ]}>
                      {selectedReport.severity?.charAt(0).toUpperCase() +
                        selectedReport.severity?.slice(1) || 'Medium'}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Status</Text>
                    <Text style={[
                      styles.detailValue,
                      { color: getStatusColor(selectedReport.status) }
                    ]}>
                      {selectedReport.status?.replace('_', ' ').charAt(0).toUpperCase() +
                        selectedReport.status?.slice(1) || 'Pending'}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Reported On</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(selectedReport.createdAt)}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Location</Text>
                  <Text style={styles.detailValue}>
                    {selectedReport.address || 'Location not available'}
                  </Text>
                  {selectedReport.location?.coordinates && (
                    <Text style={styles.coordinates}>
                      Coordinates: {selectedReport.location.coordinates[1]?.toFixed(6)}, {selectedReport.location.coordinates[0]?.toFixed(6)}
                    </Text>
                  )}
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Reported By</Text>
                  <Text style={styles.detailValue}>
                    {selectedReport.reportedBy?.userType || 'Guest'}
                    {selectedReport.reportedBy?.userId?.name &&
                      ` - ${selectedReport.reportedBy.userId.name}`}
                  </Text>
                </View>

                {selectedReport.tags && selectedReport.tags.length > 0 && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Tags</Text>
                    <View style={styles.tagsContainer}>
                      {selectedReport.tags.map((tag, index) => (
                        <View key={index} style={styles.tagBadge}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {selectedReport.assignedTo && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Assigned To</Text>
                    <Text style={styles.detailValue}>
                      {selectedReport.assignedTo.name || 'Unassigned'}
                    </Text>
                  </View>
                )}

                {hasUserScheduled(selectedReport._id) && (
                  <View style={styles.shareSection}>
                    <Text style={styles.detailLabel}>Share Your Participation</Text>
                    <TouchableOpacity
                      style={styles.whatsappShareButton}
                      onPress={() => {
                        const scheduleData = getUserScheduleData(selectedReport._id);
                        shareToWhatsApp(selectedReport, {
                          scheduledDate: scheduleData.scheduledDate,
                          scheduledTime: scheduleData.scheduledTime,
                          participantCount: scheduleData.participantCount,
                        }, scheduleData);
                      }}
                      disabled={sharing}
                    >
                      {sharing ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <>
                          <WhatsAppIcon size={20} color="#fff" />
                          <Text style={styles.whatsappShareButtonText}>
                            Share on WhatsApp
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                    <Text style={styles.shareHelpText}>
                      Share with friends and invite them to join the cleanup!
                    </Text>
                  </View>
                )}

                {/* Submit Cleanup Evidence Section */}
                {hasUserScheduled(selectedReport._id) && selectedReport.status !== 'resolved' && (
                  <View style={styles.scheduleSection}>
                    <Text style={styles.detailLabel}>Cleanup Completed?</Text>
                    <TouchableOpacity
                      style={[styles.scheduleButton, { backgroundColor: '#28a745' }]}
                      onPress={() => setShowCleanupModal(true)}
                    >
                      <CalendarCheckIcon size={20} color="#fff" />
                      <Text style={[styles.scheduleButtonText, { color: '#fff' }]}>
                        Submit Cleaned Photo
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Schedule/Reschedule Section */}
                {(!hasUserScheduled(selectedReport._id) || hasUserScheduled(selectedReport._id)) && selectedReport.status !== 'resolved' && selectedReport.status !== 'rejected' && (
                  <View style={styles.scheduleSection}>
                    <Text style={styles.detailLabel}>
                      {hasUserScheduled(selectedReport._id) ? 'Participation Options' : 'Schedule Cleanup'}
                    </Text>
                    <TouchableOpacity
                      style={styles.scheduleButton}
                      onPress={() => setShowScheduleModal(true)}
                    >
                      <CalendarTodayIcon size={20} color="#2196F3" />
                      <Text style={styles.scheduleButtonText}>
                        {hasUserScheduled(selectedReport._id) ? 'Update Schedule' : 'Schedule Cleanup'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.closeButton]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.actionButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  const renderScheduleModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showScheduleModal}
      onRequestClose={() => setShowScheduleModal(false)}
    >
      <View style={styles.scheduleModalOverlay}>
        <View style={styles.scheduleModalContent}>
          <View style={styles.scheduleModalHeader}>
            <Text style={styles.scheduleModalTitle}>Schedule Cleanup</Text>
            <TouchableOpacity onPress={() => setShowScheduleModal(false)}>
              <CloseIcon size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scheduleForm}>
            {renderDateSelector()}

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Select Time</Text>
              <View style={styles.timePickerContainer}>
                <TouchableOpacity
                  style={styles.timePicker}
                  onPress={() => {
                    const currentTime = new Date();
                    currentTime.setHours(10, 0, 0, 0);
                    setSelectedTime(currentTime);
                  }}
                >
                  <AccessTimeIcon size={14} color="#666" />
                  <Text style={styles.timeText}>
                    {selectedTime.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>How many people?</Text>
              <View style={styles.participantContainer}>
                <TouchableOpacity
                  style={styles.participantButton}
                  onPress={() => setParticipantCount(Math.max(1, participantCount - 1))}
                >
                  <RemoveIcon size={20} color="#dc3545" />
                </TouchableOpacity>

                <View style={styles.participantDisplay}>
                  <PeopleIcon size={12} color="#666" />
                  <Text style={styles.participantText}>{participantCount} person{participantCount !== 1 ? 's' : ''}</Text>
                </View>

                <TouchableOpacity
                  style={styles.participantButton}
                  onPress={() => setParticipantCount(Math.min(10, participantCount + 1))}
                >
                  <AddIcon size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Notes (Optional)</Text>
              <TextInput
                style={styles.notesInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any additional notes..."
                multiline
                numberOfLines={3}
              />
            </View>

            {!token && (
              <View style={styles.authWarning}>
                <WarningIcon size={20} color="#ffc107" />
                <Text style={styles.authWarningText}>
                  You need to be logged in to schedule a cleanup.
                </Text>
              </View>
            )}

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Schedule Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Date:</Text>
                <Text style={styles.summaryValue}>
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Time:</Text>
                <Text style={styles.summaryValue}>
                  {selectedTime.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Participants:</Text>
                <Text style={styles.summaryValue}>
                  {participantCount} person{participantCount !== 1 ? 's' : ''}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Volunteers:</Text>
                <Text style={styles.summaryValue}>
                  {getScheduleCountForDate(selectedDate) + participantCount} (including yours)
                </Text>
              </View>
            </View>

            {token && (
              <View style={styles.sharePreview}>
                <Text style={styles.sharePreviewTitle}>Share Preview</Text>
                <Text style={styles.sharePreviewText} numberOfLines={3}>
                  "I'm joining a cleanup at {selectedReport?.address} on {selectedDate.toLocaleDateString()}!
                  Join me and help make our community cleaner!
                  Register: {API_ENDPOINTS.REGISTER_LINK || 'https://cleanup-app.com/register'}"
                </Text>
              </View>
            )}

            <View style={styles.scheduleModalActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => {
                  setShowScheduleModal(false);
                  setNotes('');
                  setParticipantCount(1);
                }}
                disabled={scheduling}
              >
                <Text style={styles.actionButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.confirmButton, !token && styles.disabledButton]}
                onPress={scheduleCleanup}
                disabled={scheduling || !token}
              >
                {scheduling ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <CalendarCheckIcon size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>
                      {token ? 'Schedule' : 'Login to Schedule'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Reports</Text>
        <View style={styles.headerButtons}>
          {!token && (
            <TouchableOpacity
              style={[styles.reportButton, styles.loginButton]}
              onPress={() => navigation.navigate('Login')}
            >
              <LoginIcon size={20} color="#fff" />
              <Text style={styles.reportButtonText}>Login</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => navigation.navigate('GarbageReport')}
          >
            <AddIcon size={24} color="#fff" />
            <Text style={styles.reportButtonText}>Report</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading reports...</Text>
        </View>
      ) : reports.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ReportProblemIcon size={80} color="#ccc" />
          <Text style={styles.emptyText}>No reports found</Text>
          <Text style={styles.emptySubtext}>
            Be the first to report garbage in your area
          </Text>
          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => navigation.navigate('GarbageReport')}
          >
            <Text style={styles.reportButtonText}>Report Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={reports}
          renderItem={renderReportCard}
          keyExtractor={(item) => item._id || Math.random().toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMoreReports}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() =>
            loadingMore ? (
              <View style={styles.loadingMoreContainer}>
                <ActivityIndicator size="small" color="#2196F3" />
                <Text style={styles.loadingMoreText}>Loading more...</Text>
              </View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}

      {renderReportDetailsModal()}
      {renderScheduleModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
  },
  loginButton: {
    backgroundColor: '#28a745',
  },
  reportButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    color: '#1976d2',
    fontSize: 12,
    fontWeight: '600',
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  severityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  statusSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  smallShareButton: {
    padding: 6,
    backgroundColor: '#f0f9f0',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#25D366',
  },
  reportImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
  },
  description: {
    fontSize: 16,
    color: '#495057',
    lineHeight: 22,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    flexShrink: 1,
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#f8f9fa',
  },
  detailSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  detailLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 16,
    color: '#2c3e50',
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  detailItem: {
    flex: 1,
  },
  coordinates: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
    marginTop: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  tagBadge: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    color: '#495057',
  },
  shareSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    backgroundColor: '#f9fff9',
  },
  whatsappShareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    padding: 12,
    borderRadius: 10,
    gap: 10,
    marginTop: 8,
  },
  whatsappShareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  shareHelpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  scheduleSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 10,
    gap: 10,
  },
  scheduleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scheduleModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scheduleModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  scheduleModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  scheduleModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  scheduleForm: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  dateSelector: {
    marginBottom: 20,
  },
  dateScrollView: {
    paddingVertical: 10,
  },
  dateOption: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    marginRight: 10,
    minWidth: 70,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dateOptionSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
  },
  dateOptionDay: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  dateOptionDaySelected: {
    color: '#2196F3',
    fontWeight: '600',
  },
  dateOptionDate: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#495057',
    marginVertical: 4,
  },
  dateOptionDateSelected: {
    color: '#2196F3',
  },
  peopleCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  peopleCountText: {
    fontSize: 10,
    color: '#666',
    marginLeft: 2,
    fontWeight: '600',
  },
  selectedDateInfo: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    marginTop: 15,
  },
  dateInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedDateText: {
    fontSize: 16,
    color: '#495057',
    marginLeft: 10,
    fontWeight: '500',
  },
  peopleInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  peopleInfoText: {
    fontSize: 14,
    color: '#28a745',
    marginLeft: 10,
    fontWeight: '500',
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dee2e6',
    gap: 10,
    flex: 1,
  },
  timeText: {
    fontSize: 16,
    color: '#495057',
  },
  participantContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  participantButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  participantDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  participantText: {
    fontSize: 16,
    color: '#495057',
    fontWeight: '500',
  },
  notesInput: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dee2e6',
    fontSize: 16,
    color: '#495057',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  authWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffeaa7',
    marginBottom: 20,
    gap: 10,
  },
  authWarningText: {
    fontSize: 14,
    color: '#856404',
    flex: 1,
  },
  summaryCard: {
    backgroundColor: '#e8f4fd',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  summaryValue: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  sharePreview: {
    backgroundColor: '#f0f9f0',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#25D366',
  },
  sharePreviewTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#25D366',
    marginBottom: 8,
  },
  sharePreviewText: {
    fontSize: 12,
    color: '#495057',
    lineHeight: 18,
  },
  scheduleModalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  confirmButton: {
    backgroundColor: '#28a745',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  disabledButton: {
    backgroundColor: '#adb5bd',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6c757d',
  },
  loadingMoreContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingMoreText: {
    marginTop: 10,
    fontSize: 14,
    color: '#6c757d',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    color: '#6c757d',
    marginTop: 20,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#adb5bd',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#6c757d',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ComplaintsListScreen;