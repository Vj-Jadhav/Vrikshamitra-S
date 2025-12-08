import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    Alert,
    RefreshControl,
    Linking,
    Platform,
    Modal,
    ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { API_ENDPOINTS } from '../../config/config';
import {
    AccessTimeIcon,
    LocationOnIcon,
    PersonIcon,
    ShareIcon,
    CloseIcon,
    CalendarCheckIcon,
} from '../CustomIcon';
import Share from 'react-native-share';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const MyScheduledReports = () => {
    // Component to display user's scheduled cleaning events
    const navigation = useNavigation();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [token, setToken] = useState(null);
    const [sharing, setSharing] = useState(false);

    // Cleanup Submission State
    const [cleanupImage, setCleanupImage] = useState(null);
    const [showCleanupModal, setShowCleanupModal] = useState(false);
    const [submittingCleanup, setSubmittingCleanup] = useState(false);
    const [selectedReportId, setSelectedReportId] = useState(null);

    useEffect(() => {
        loadToken();
    }, []);

    useEffect(() => {
        if (token) {
            fetchScheduledReports();
        }
    }, [token]);

    const loadToken = async () => {
        try {
            const userToken = await AsyncStorage.getItem('authToken');
            if (userToken) {
                setToken(userToken);
            } else {
                setLoading(false); // Stop loading if no token
                Alert.alert('Login Required', 'Please login to view your scheduled cleaning drives.');
            }
        } catch (error) {
            console.error('Error loading token:', error);
            setLoading(false);
        }
    };

    const fetchScheduledReports = async () => {
        try {
            setLoading(true);
            const response = await fetch(API_ENDPOINTS.USER_SCHEDULES, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                // The API might return reports inside the schedule object or just the schedule info. 
                // Assuming result.data contains list of schedules which have 'reportId' populated with report details
                setReports(result.data || []);
            } else {
                // If no data or success false, just set empty
                setReports([]);
            }
        } catch (error) {
            console.error('Error fetching scheduled reports:', error);
            // Don't alert on initial fetch error to avoid spamming if just empty
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchScheduledReports();
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

    // Track share event (optional analytics)
    const trackShareEvent = async (reportId, platform) => {
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


    const shareToWhatsApp = useCallback(async (scheduleItem) => {
        const report = scheduleItem.report; // Assuming report populated
        if (!report) return;

        try {
            setSharing(true);

            const shareMessage = `🌟 JOIN THE CLEANUP MOVEMENT! 🌟

🗓️ *I just signed up to clean up:*
📍 ${report.address || 'Unknown Location'}
📅 Date: ${new Date(scheduleItem.scheduledDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}
⏰ Time: ${scheduleItem.scheduledTime}
👥 I'm bringing: ${scheduleItem.participantCount}

Join us to make a difference! #Vrikshamitra`;

            // 1. CHECK BOTH WHATSAPP & WHATSAPP BUSINESS
            console.log('Checking WhatsApp in MyScheduledReports...');
            const normal = await Share.isPackageInstalled('com.whatsapp');
            const business = await Share.isPackageInstalled('com.whatsapp.w4b');
            console.log('WhatsApp checks:', { normal, business });

            const isInstalled = normal.isInstalled || business.isInstalled;

            if (!isInstalled) {
                Alert.alert(
                    'WhatsApp Not Installed',
                    'Please install WhatsApp or WhatsApp Business to share this content.'
                );
                return;
            }

            // force correct package
            const packageToUse = normal.isInstalled
                ? 'com.whatsapp'
                : 'com.whatsapp.w4b';
            console.log('Using package:', packageToUse);

            const options = {
                social: Share.Social.WHATSAPP,
                message: shareMessage,
                appId: packageToUse,
            };

            if (report.imageUrl) {
                options.url = report.imageUrl;
                options.type = 'image/jpeg';
            }

            await Share.shareSingle(options);
            await trackShareEvent(report._id, 'whatsapp');

        } catch (error) {
            console.error('WhatsApp share error:', error);
            Alert.alert('Error', 'Failed to share details.');
        } finally {
            setSharing(false);
        }
    }, []);

    const cancelCleanupSchedule = async (scheduleId) => {
        Alert.alert(
            'Cancel Participation',
            'Are you sure you want to cancel your participation in this cleanup?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await fetch(`${API_ENDPOINTS.SCHEDULE_CLEANUP}/${scheduleId}/cancel`, {
                                method: 'PUT',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                },
                            });

                            const result = await response.json();

                            if (response.ok && result.success) {
                                Alert.alert('Success', 'Participation cancelled successfully');
                                fetchScheduledReports(); // Refresh list
                            } else {
                                Alert.alert('Error', result.message || 'Failed to cancel participation');
                            }
                        } catch (error) {
                            console.error('Error cancelling schedule:', error);
                            Alert.alert('Error', 'Failed to cancel participation. Please try again.');
                        }
                    }
                }
            ]
        );
    };



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
        if (!cleanupImage || !selectedReportId) {
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

            const endpoint = `${API_ENDPOINTS.REPORTS}/${selectedReportId}/cleanup`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });

            const result = await response.json();

            if (response.ok && result.success) {
                Alert.alert('Success', 'Cleanup evidence submitted! Waiting for approval.');
                setShowCleanupModal(false);
                setCleanupImage(null);
                fetchScheduledReports(); // Refresh list logic if needed
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

    const openCleanupModal = (report_id) => {
        setSelectedReportId(report_id);
        setShowCleanupModal(true);
    };

    const openMaps = (lat, lng, label) => {
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${lat},${lng}`;
        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`
        });
        Linking.openURL(url);
    };

    const renderScheduleCard = ({ item }) => {
        const report = item.report;
        if (!report) return null; // Skip if report details missing

        const isCancelled = item.status === 'cancelled';

        return (
            <View style={[styles.reportCard, isCancelled && styles.cancelledCard]}>
                <View style={styles.cardHeader}>
                    <View style={[styles.badgeContainer, isCancelled && styles.cancelledBadge]}>
                        <Text style={[styles.scheduleBadge, isCancelled && styles.cancelledText]}>
                            {isCancelled ? 'Cancelled' : `Scheduled: ${new Date(item.scheduledDate).toLocaleDateString()}`}
                        </Text>
                    </View>
                    <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(report.severity) }]}>
                        <Text style={styles.severityText}>
                            {report.severity?.charAt(0).toUpperCase() + report.severity?.slice(1) || 'Medium'}
                        </Text>
                    </View>
                </View>

                {report.imageUrl && (
                    <Image
                        source={{ uri: report.imageUrl }}
                        style={[styles.reportImage, isCancelled && { opacity: 0.5 }]}
                        resizeMode="cover"
                    />
                )}

                <Text style={styles.description} numberOfLines={2}>
                    {report.description || 'No description provided'}
                </Text>

                <View style={styles.statusSection}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) }]}>
                        <Text style={styles.statusText}>
                            {report.status?.replace('_', ' ').charAt(0).toUpperCase() + report.status?.slice(1) || 'Pending'}
                        </Text>
                    </View>

                    {!isCancelled && (
                        <TouchableOpacity
                            style={styles.smallShareButton}
                            onPress={() => shareToWhatsApp(item)}
                        >
                            <ShareIcon size={16} color="#25D366" />
                            <Text style={styles.shareText}>Invite</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.scheduleDetails}>
                    <View style={styles.detailRow}>
                        <AccessTimeIcon size={14} color="#666" />
                        <Text style={styles.detailText}>Time: {item.scheduledTime}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <PersonIcon size={14} color="#666" />
                        <Text style={styles.detailText}>Participants: {item.participantCount}</Text>
                    </View>
                </View>

                {item.notes ? (
                    <Text style={styles.notesText} numberOfLines={1}>Note: {item.notes}</Text>
                ) : null}

                <View style={styles.cardFooter}>
                    <View style={styles.locationInfo}>
                        <LocationOnIcon size={14} color="#666" />
                        <Text style={styles.locationText} numberOfLines={1}>
                            {report.address || 'Location not available'}
                        </Text>
                    </View>
                </View>



                {/* Submit Cleanup Button */}
                {!isCancelled && report.status !== 'resolved' && (
                    <View style={styles.actionButtonsContainer}>
                        <TouchableOpacity
                            style={[styles.directionsButton, { backgroundColor: '#28a745' }]}
                            onPress={() => openCleanupModal(report._id)}
                        >
                            <CalendarCheckIcon size={16} color="#fff" />
                            <Text style={styles.directionsButtonText}> Submit Cleaned Photo</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Additional Action Buttons */}
                {!isCancelled && (
                    <View style={styles.actionButtonsContainer}>
                        <TouchableOpacity
                            style={styles.directionsButton}
                            onPress={() => {
                                if (report.location?.coordinates) {
                                    openMaps(report.location.coordinates[1], report.location.coordinates[0], report.address);
                                } else {
                                    Alert.alert('Location Error', 'Coordinates not available for this report.');
                                }
                            }}
                        >
                            <Text style={styles.directionsButtonText}>Get Directions</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => cancelCleanupSchedule(item._id)}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        )
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={reports}
                renderItem={renderScheduleCard}
                keyExtractor={(item) => item._id}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>You haven't scheduled any cleanups yet.</Text>
                        <Text style={styles.emptySubText}>Go to "List of Reported Places" to find a spot and schedule a cleanup!</Text>
                    </View>
                }
            />

            {/* Cleanup Submission Modal */}
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
                            <Text style={styles.modalDetailLabel}>
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        padding: 16,
        paddingBottom: 80,
    },
    reportCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        padding: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        alignItems: 'center',
    },
    badgeContainer: {
        backgroundColor: '#e3f2fd',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    scheduleBadge: {
        color: '#1976d2',
        fontSize: 12,
        fontWeight: 'bold',
    },
    severityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    severityText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    reportImage: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        marginBottom: 12,
    },
    description: {
        fontSize: 14,
        color: '#333',
        marginBottom: 12,
        lineHeight: 20,
    },
    statusSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    smallShareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 6,
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
    },
    shareText: {
        marginLeft: 4,
        fontSize: 12,
        color: '#333',
    },
    scheduleDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailText: {
        fontSize: 12,
        color: '#555',
        marginLeft: 4,
    },
    notesText: {
        fontSize: 12,
        color: '#777',
        fontStyle: 'italic',
        marginBottom: 8,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    locationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    locationText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        gap: 8,
    },
    directionsButton: {
        flex: 1,
        backgroundColor: '#2196F3',
        paddingVertical: 8,
        borderRadius: 6,
        alignItems: 'center',
    },
    directionsButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 12,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#fff',
        paddingVertical: 8,
        borderRadius: 6,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#dc3545',
    },
    cancelButtonText: {
        color: '#dc3545',
        fontWeight: '600',
        fontSize: 12,
    },
    cancelledCard: {
        opacity: 0.8,
        backgroundColor: '#f8f9fa',
    },
    cancelledBadge: {
        backgroundColor: '#ffebee',
    },
    cancelledText: {
        color: '#c62828',
        textDecorationLine: 'line-through',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    modalDetailLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
        lineHeight: 20,
    },
    imagePickerContainer: {
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 150,
        backgroundColor: '#fafafa',
    },
    uploadButtonsRow: {
        flexDirection: 'row',
        gap: 20,
    },
    uploadButton: {
        alignItems: 'center',
        padding: 10,
    },
    uploadButtonText: {
        marginTop: 5,
        color: '#2196F3',
        fontWeight: '600',
    },
    previewImage: {
        width: 200,
        height: 200,
        borderRadius: 8,
    },
    removeImageButton: {
        position: 'absolute',
        top: -10,
        right: -10,
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 15,
        padding: 5,
    },
    submitCleanupButton: {
        backgroundColor: '#28a745',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    submitCleanupButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledButton: {
        backgroundColor: '#a5d6a7',
    },
});

export default MyScheduledReports;
