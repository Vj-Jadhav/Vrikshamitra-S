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
    Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../../config/config';
import {
    AccessTimeIcon,
    LocationOnIcon,
    CloseIcon,
    ShareIcon,
    WhatsAppIcon,
    PersonIcon
} from '../CustomIcon';
import Share from 'react-native-share';

const MyReportsScreen = ({ navigation }) => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [token, setToken] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 1,
    });
    const [loadingMore, setLoadingMore] = useState(false);
    const [sharing, setSharing] = useState(false);

    useEffect(() => {
        loadToken();
    }, []);

    useEffect(() => {
        if (token) {
            fetchMyReports();
        }
    }, [token]);

    const loadToken = async () => {
        try {
            const userToken = await AsyncStorage.getItem('authToken');
            if (userToken) {
                setToken(userToken);
            } else {
                // Handle case where user is not logged in
                setLoading(false);
                Alert.alert('Authentication Required', 'Please login to view your reports.', [
                    { text: 'OK', onPress: () => navigation.navigate('Login') }
                ]);
            }
        } catch (error) {
            console.error('Error loading token:', error);
            setLoading(false);
        }
    };

    const fetchMyReports = async (page = 1, isLoadMore = false) => {
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

            const response = await fetch(`${API_ENDPOINTS.MY_REPORTS}?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Failed to fetch your reports');
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
            console.error('Error fetching my reports:', error);
            Alert.alert('Error', 'Failed to fetch your reports. Please check your connection.');
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    };

    const loadMoreReports = () => {
        if (!loadingMore && pagination.page < pagination.pages) {
            const nextPage = pagination.page + 1;
            fetchMyReports(nextPage, true);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchMyReports(1, false);
    };

    const openReportDetails = (report) => {
        setSelectedReport(report);
        setModalVisible(true);
    };

    // Share to WhatsApp function (Reused logic)
    const shareToWhatsApp = useCallback(async (report) => {
        let shareMessage = '';
        try {
            setSharing(true);

            shareMessage = `📢 *My Cleanup Report* 📢
    
    📍 ${report.address}
    📝 Description: ${report.description || 'No description'}
    
    This spot needs attention! #Vrikshamitra`;

            console.log('Checking WhatsApp installation...');
            const normal = await Share.isPackageInstalled('com.whatsapp');
            const business = await Share.isPackageInstalled('com.whatsapp.w4b');

            const isInstalled = normal.isInstalled || business.isInstalled;

            if (!isInstalled) {
                throw new Error('WhatsApp not installed');
            }

            const packageToUse = normal.isInstalled ? 'com.whatsapp' : 'com.whatsapp.w4b';

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

        } catch (error) {
            console.error('WhatsApp share error:', error);
            try {
                const fallbackOptions = {
                    title: 'Share Report',
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


    const handleApproveCleanup = async (reportId, submissionId) => {
        try {
            const response = await fetch(`${API_ENDPOINTS.REPORTS}/${reportId}/cleanup/${submissionId}/approve`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const result = await response.json();
            if (response.ok && result.success) {
                Alert.alert("Success", "Cleanup approved successfully!");
                fetchMyReports();
                setModalVisible(false);
            } else {
                Alert.alert("Error", result.message || "Failed to approve cleanup.");
            }
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Network error while approving cleanup.");
        }
    };

    const handleRejectCleanup = async (reportId, submissionId) => {
        try {
            const response = await fetch(`${API_ENDPOINTS.REPORTS}/${reportId}/cleanup/${submissionId}/reject`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const result = await response.json();
            if (response.ok && result.success) {
                Alert.alert("Success", "Cleanup rejected.");
                fetchMyReports();
                setModalVisible(false);
            } else {
                Alert.alert("Error", result.message || "Failed to reject cleanup.");
            }
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Network error while rejecting cleanup.");
        }
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
            </View>
        </TouchableOpacity>
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
                                <Text style={styles.modalTitle}>My Report Details</Text>
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
                                            {selectedReport.createdAt ? new Date(selectedReport.createdAt).toLocaleDateString() : 'N/A'}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.detailSection}>
                                    <Text style={styles.detailLabel}>Location</Text>
                                    <Text style={styles.detailValue}>
                                        {selectedReport.address || 'Location not available'}
                                    </Text>
                                </View>

                                {selectedReport.cleanupSubmissions && selectedReport.cleanupSubmissions.length > 0 && (
                                    <View style={styles.detailSection}>
                                        <Text style={styles.detailLabel}>Cleanup Suggestions</Text>
                                        {selectedReport.cleanupSubmissions.map((submission, index) => (
                                            <View key={index} style={styles.submissionCard}>
                                                <Image source={{ uri: submission.imageUrl }} style={styles.submissionImage} resizeMode="cover" />
                                                <View style={styles.submissionInfo}>
                                                    <Text style={styles.submissionMeta}>
                                                        By: {submission.user?.name || 'Volunteer'}
                                                    </Text>
                                                    <Text style={[styles.submissionStatus, {
                                                        color: submission.status === 'approved' ? 'green' : submission.status === 'rejected' ? 'red' : 'orange'
                                                    }]}>
                                                        Status: {submission.status?.toUpperCase()}
                                                    </Text>
                                                </View>

                                                {submission.status === 'pending' && (
                                                    <View style={styles.submissionActions}>
                                                        <TouchableOpacity
                                                            style={[styles.actionButton, styles.approveButton]}
                                                            onPress={() => handleApproveCleanup(selectedReport._id, submission._id)}
                                                        >
                                                            <Text style={styles.actionButtonTextSmall}>Approve</Text>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity
                                                            style={[styles.actionButton, styles.rejectButton]}
                                                            onPress={() => handleRejectCleanup(selectedReport._id, submission._id)}
                                                        >
                                                            <Text style={styles.actionButtonTextSmall}>Reject</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                )}
                                            </View>
                                        ))}
                                    </View>
                                )}

                                <View style={styles.shareSection}>
                                    <TouchableOpacity
                                        style={styles.whatsappShareButton}
                                        onPress={() => shareToWhatsApp(selectedReport)}
                                        disabled={sharing}
                                    >
                                        {sharing ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                        ) : (
                                            <>
                                                <WhatsAppIcon size={20} color="#fff" />
                                                <Text style={styles.whatsappShareButtonText}>
                                                    Share Report
                                                </Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </>
                    )}
                </View>
            </View>
        </Modal >
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2196F3" />
                </View>
            ) : reports.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconContainer}>
                        <LocationOnIcon size={50} color="#ccc" />
                    </View>
                    <Text style={styles.emptyText}>You haven't reported any garbage dumps yet.</Text>
                    <Text style={styles.emptySubText}>Join the movement by reporting garbage dumps near you!</Text>
                </View>
            ) : (
                <FlatList
                    data={reports}
                    renderItem={renderReportCard}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContainer}
                    onEndReached={loadMoreReports}
                    onEndReachedThreshold={0.5}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2196F3']} />
                    }
                    ListFooterComponent={loadingMore && <ActivityIndicator size="small" color="#2196F3" style={styles.footerLoader} />}
                />
            )}
            {renderReportDetailsModal()}
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
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    listContainer: {
        padding: 16,
    },
    reportCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 12,
    },
    categoryBadge: {
        backgroundColor: '#e3f2fd',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    categoryText: {
        fontSize: 12,
        color: '#2196F3',
        fontWeight: '600',
    },
    severityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    severityText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '600',
    },
    reportImage: {
        width: '100%',
        height: 200,
        backgroundColor: '#eee',
    },
    description: {
        fontSize: 14,
        color: '#333',
        paddingHorizontal: 12,
        paddingVertical: 8,
        lineHeight: 20,
    },
    statusSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        marginBottom: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    timeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timeText: {
        fontSize: 12,
        color: '#666',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    locationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 4,
    },
    locationText: {
        fontSize: 12,
        color: '#666',
        flex: 1,
    },
    footerLoader: {
        paddingVertical: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '80%',
        padding: 20,
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
    modalImage: {
        width: '100%',
        height: 250,
        borderRadius: 12,
        marginBottom: 20,
    },
    detailSection: {
        marginBottom: 20,
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 16,
        color: '#333',
        lineHeight: 24,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 16,
    },
    detailItem: {
        flex: 1,
    },
    whatsappShareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#25D366',
        padding: 12,
        borderRadius: 12,
        gap: 8,
        width: '100%'
    },
    whatsappShareButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    shareSection: {
        marginTop: 10,
        marginBottom: 30
    },
    submissionCard: {
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        padding: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#eee'
    },
    submissionImage: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        marginBottom: 8
    },
    submissionInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8
    },
    submissionMeta: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333'
    },
    submissionStatus: {
        fontSize: 12,
        fontWeight: 'bold'
    },
    submissionActions: {
        flexDirection: 'row',
        gap: 10
    },
    actionButton: {
        flex: 1,
        padding: 8,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center'
    },
    approveButton: {
        backgroundColor: '#28a745'
    },
    rejectButton: {
        backgroundColor: '#dc3545'
    },
    actionButtonTextSmall: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 12
    }
});

export default MyReportsScreen;
