import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    TextInput,
    Modal,
    Alert,
    ActivityIndicator
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from '../config/config.js';

export default function PlantTracking({ navigation }) {
    const [plants, setPlants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    // Plant Details / Analysis Modal
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [selectedPlant, setSelectedPlant] = useState(null);

    // New Plant Form
    const [newPlantName, setNewPlantName] = useState('');
    const [newPlantSpecies, setNewPlantSpecies] = useState('');

    useEffect(() => {
        fetchPlants();
    }, []);

    const fetchPlants = async () => {
        try {
            const studentId = await AsyncStorage.getItem("studentId");
            if (!studentId) return;

            setLoading(true);
            const response = await fetch(`${BASE_URL}/api/plants/student/${studentId}`);
            if (response.ok) {
                const data = await response.json();
                setPlants(data);
                // If selected plant exists, update it too
                if (selectedPlant) {
                    const updated = data.find(p => p._id === selectedPlant._id);
                    if (updated) setSelectedPlant(updated);
                }
            } else {
                console.log("Failed to fetch plants");
            }
        } catch (error) {
            console.error("Error fetching plants:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- Actions ---

    const handleAddPlant = async () => {
        if (newPlantName && newPlantSpecies) {
            try {
                const studentId = await AsyncStorage.getItem("studentId");
                const response = await fetch(`${BASE_URL}/api/plants/add`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        studentId,
                        name: newPlantName,
                        species: newPlantSpecies
                    })
                });

                if (response.ok) {
                    setModalVisible(false);
                    setNewPlantName('');
                    setNewPlantSpecies('');
                    fetchPlants(); // Refresh list
                    Alert.alert("Success", "Sapling planted successfully!");
                } else {
                    Alert.alert("Error", "Failed to add plant");
                }
            } catch (error) {
                console.error("Add plant error:", error);
                Alert.alert("Error", "Failed to connect to server");
            }
        } else {
            Alert.alert("Missing Info", "Please enter name and species");
        }
    };

    const handleUploadPhoto = async () => {
        if (!selectedPlant) return;

        const options = {
            mediaType: 'photo',
            includeBase64: false,
            maxHeight: 2000,
            maxWidth: 2000,
        };

        launchImageLibrary(options, async (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                Alert.alert("Error", "Could not pick image");
            } else {
                const asset = response.assets[0];

                const formData = new FormData();
                formData.append('file', {
                    uri: asset.uri,
                    type: asset.type,
                    name: asset.fileName || 'photo.jpg',
                });

                try {
                    const res = await fetch(`${BASE_URL}/api/plants/upload/${selectedPlant._id}`, {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });

                    if (res.ok) {
                        const updatedPlant = await res.json();
                        // Update local state
                        const updatedPlants = plants.map(p => p._id === updatedPlant._id ? updatedPlant : p);
                        setPlants(updatedPlants);
                        setSelectedPlant(updatedPlant);
                        Alert.alert("Success", "Photo uploaded and progress updated!");
                    } else {
                        Alert.alert("Error", "Upload failed");
                    }
                } catch (error) {
                    console.error("Upload error:", error);
                    Alert.alert("Error", "Server error during upload");
                }
            }
        });
    };

    const handleStatusChange = async (status) => {
        if (!selectedPlant) return;

        try {
            // Optimistic update
            const updatedLocal = { ...selectedPlant, health: status };
            setSelectedPlant(updatedLocal);

            const res = await fetch(`${BASE_URL}/api/plants/update/${selectedPlant._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ health: status })
            });

            if (res.ok) {
                fetchPlants(); // Sync fully
            } else {
                Alert.alert("Error", "Failed to update status");
                fetchPlants(); // Revert
            }

        } catch (error) {
            console.error(error);
        }
    };

    // --- Helpers ---

    const getSurvivalDurationMonths = (dateString) => {
        if (!dateString) return 0;
        const planted = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - planted);
        const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
        return diffMonths;
    };

    const isTreeGuardian = (plant) => {
        return getSurvivalDurationMonths(plant.plantedDate) >= 6 && (plant.health === 'Good' || plant.health === 'Excellent');
    };

    const openPlantDetails = (plant) => {
        setSelectedPlant(plant);
        setDetailsModalVisible(true);
    };

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${BASE_URL}${path}`;
    };

    // --- Components ---

    const Badge = ({ eligible }) => {
        if (!eligible) return <View style={styles.lockedBadge}><Text style={{ fontSize: 20, opacity: 0.5 }}>🛡️</Text></View>;
        return (
            <View style={styles.unlockedBadge}>
                <Text style={styles.badgeIcon}>🛡️</Text>
                <Text style={styles.badgeText}>Guardian</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Plant Tracker</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Text style={styles.headerAddIcon}>+</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <React.Fragment>
                    </React.Fragment>
                }
            >
                {/* Manual refresh could be added with RefreshControl but using useEffect for now */}

                {/* Dashboard Summary */}
                <View style={styles.summaryCard}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryValue}>{plants.length}</Text>
                        <Text style={styles.summaryLabel}>Plants</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryValue}>
                            {plants.filter(p => isTreeGuardian(p)).length}
                        </Text>
                        <Text style={styles.summaryLabel}>Badges</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryValue}>
                            {plants.reduce((acc, p) => acc + (p.photos ? p.photos.length : 0), 0)}
                        </Text>
                        <Text style={styles.summaryLabel}>Photos</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>My Garden</Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#3a9322" style={{ marginTop: 50 }} />
                ) : plants.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={{ fontSize: 40, marginBottom: 10 }}>🌱</Text>
                        <Text style={{ color: '#666' }}>No plants yet. Add your first sapling!</Text>
                    </View>
                ) : (
                    plants.map((plant) => (
                        <TouchableOpacity
                            key={plant._id}
                            style={styles.plantCard}
                            activeOpacity={0.9}
                            onPress={() => openPlantDetails(plant)}
                        >
                            <View style={styles.plantImageContainer}>
                                {plant.photos && plant.photos.length > 0 ? (
                                    <Image source={{ uri: getImageUrl(plant.photos[plant.photos.length - 1].url) }} style={styles.thumbImage} />
                                ) : (
                                    <Text style={{ fontSize: 35 }}>🌱</Text>
                                )}
                            </View>

                            <View style={styles.plantInfo}>
                                <View style={styles.plantHeaderRow}>
                                    <Text style={styles.plantName}>{plant.name}</Text>
                                    <Badge eligible={isTreeGuardian(plant)} />
                                </View>
                                <Text style={styles.plantSpecies}>{plant.species}</Text>

                                <View style={styles.statusRow}>
                                    <View style={[styles.statusBadge, {
                                        backgroundColor: plant.health === 'Excellent' || plant.health === 'Good' ? '#e6f4ea' : '#fce8e6'
                                    }]}>
                                        <Text style={[styles.statusText, {
                                            color: plant.health === 'Excellent' || plant.health === 'Good' ? '#1e8e3e' : '#c5221f'
                                        }]}>
                                            {plant.health}
                                        </Text>
                                    </View>
                                    <Text style={styles.ageText}>{getSurvivalDurationMonths(plant.plantedDate)} mo old</Text>
                                </View>

                                <View style={styles.progressContainer}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Text style={styles.progressLabel}>Growth Progress</Text>
                                        <Text style={styles.progressLabel}>{Math.round((plant.progress || 0) * 100)}%</Text>
                                    </View>
                                    <View style={styles.progressBarBg}>
                                        <View style={[styles.progressBarFill, { width: `${(plant.progress || 0) * 100}%` }]} />
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                )}

            </ScrollView>

            {/* --- Add Plant Modal --- */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>New Sapling</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Plant Name (e.g. My Mango Tree)"
                            value={newPlantName}
                            onChangeText={setNewPlantName}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Species (e.g. Mangifera indica)"
                            value={newPlantSpecies}
                            onChangeText={setNewPlantSpecies}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveButton} onPress={handleAddPlant}>
                                <Text style={styles.saveButtonText}>Plant It!</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* --- Plant Details & Analysis Modal --- */}
            <Modal
                animationType="slide"
                transparent={false}
                visible={detailsModalVisible}
                onRequestClose={() => setDetailsModalVisible(false)}
            >
                {selectedPlant && (
                    <View style={styles.detailsContainer}>
                        {/* Modal Header */}
                        <View style={styles.detailsHeader}>
                            <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
                                <Text style={styles.closeIcon}>✕</Text>
                            </TouchableOpacity>
                            <Text style={styles.detailsTitle}>{selectedPlant.name}</Text>
                            <View style={{ width: 30 }} />
                        </View>

                        <ScrollView contentContainerStyle={{ padding: 20 }}>

                            {/* Comparison Section */}
                            <Text style={styles.detailsSectionTitle}>Growth Analysis</Text>
                            <View style={styles.comparisonCard}>
                                <View style={styles.photoColumn}>
                                    <Text style={styles.photoLabel}>First Planted</Text>
                                    <View style={styles.photoFrame}>
                                        {selectedPlant.photos && selectedPlant.photos.length > 0 ? (
                                            <Image source={{ uri: getImageUrl(selectedPlant.photos[0].url) }} style={styles.compareImage} />
                                        ) : (
                                            <Text style={styles.noPhotoText}>No Photo</Text>
                                        )}
                                    </View>
                                    <Text style={styles.dateLabel}>
                                        {selectedPlant.photos && selectedPlant.photos[0] ? new Date(selectedPlant.photos[0].date).toLocaleDateString() : 'N/A'}
                                    </Text>
                                </View>

                                <View style={styles.arrowColumn}>
                                    <Text style={styles.arrow}>➜</Text>
                                </View>

                                <View style={styles.photoColumn}>
                                    <Text style={styles.photoLabel}>Latest</Text>
                                    <View style={styles.photoFrame}>
                                        {selectedPlant.photos && selectedPlant.photos.length > 0 ? (
                                            <Image source={{ uri: getImageUrl(selectedPlant.photos[selectedPlant.photos.length - 1].url) }} style={styles.compareImage} />
                                        ) : (
                                            <Text style={styles.noPhotoText}>No Photo</Text>
                                        )}
                                    </View>
                                    <Text style={styles.dateLabel}>
                                        {selectedPlant.photos && selectedPlant.photos.length > 0 ? new Date(selectedPlant.photos[selectedPlant.photos.length - 1].date).toLocaleDateString() : 'N/A'}
                                    </Text>
                                </View>
                            </View>

                            {/* Growth Insights */}
                            <View style={styles.aiAnalysisBox}>
                                <Text style={styles.aiTitle}>✨ Growth Insights</Text>
                                <Text style={styles.aiText}>
                                    {(() => {
                                        const photoCount = selectedPlant.photos ? selectedPlant.photos.length : 0;
                                        const months = getSurvivalDurationMonths(selectedPlant.plantedDate);
                                        const health = selectedPlant.health;

                                        let message = "";

                                        if (health === 'Excellent') {
                                            message = "Your plant is thriving effectively! ";
                                        } else if (health === 'Good') {
                                            message = "Your plant is stable. ";
                                        } else if (health === 'Needs Care') {
                                            message = "Your plant shows signs of stress. ";
                                        }

                                        if (months > 3) {
                                            message += `It has sustained growth for over ${months} months. `;
                                        } else {
                                            message += "It is still in the early stages of establishment. ";
                                        }

                                        if (photoCount >= 2) {
                                            message += "Consistent photo tracking shows positive development.";
                                        } else {
                                            message += "Upload more photos to track growth visually.";
                                        }

                                        return message;
                                    })()}
                                </Text>
                            </View>

                            {/* Actions */}
                            <View style={styles.actionGrid}>
                                <TouchableOpacity style={styles.actionBtn} onPress={handleUploadPhoto}>
                                    <Text style={styles.actionIcon}>📸</Text>
                                    <Text style={styles.actionText}>Upload Monthly Photo</Text>
                                </TouchableOpacity>

                                {/* Status Toggle */}
                                <View style={styles.statusContainer}>
                                    <Text style={styles.statusLabel}>Current Status:</Text>
                                    <View style={styles.statusOptions}>
                                        {['Excellent', 'Good', 'Needs Care'].map(s => (
                                            <TouchableOpacity
                                                key={s}
                                                style={[styles.statusChip, selectedPlant.health === s && styles.statusChipActive]}
                                                onPress={() => handleStatusChange(s)}
                                            >
                                                <Text style={[styles.statusChipText, selectedPlant.health === s && styles.statusChipTextActive]}>{s}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </View>

                            {/* Badge Section */}
                            <View style={styles.badgeSection}>
                                <Text style={styles.detailsSectionTitle}>Achievements</Text>
                                <View style={[styles.bigBadgeCard, isTreeGuardian(selectedPlant) ? styles.bigBadgeUnlocked : styles.bigBadgeLocked]}>
                                    <Text style={styles.bigBadgeIcon}>{isTreeGuardian(selectedPlant) ? '🛡️' : '🔒'}</Text>
                                    <View>
                                        <Text style={styles.bigBadgeTitle}>Tree Guardian</Text>
                                        <Text style={styles.bigBadgeDesc}>
                                            {isTreeGuardian(selectedPlant)
                                                ? "Unlocked! Your plant has thrived for over 6 months."
                                                : `Keep caring for 6 months to unlock. Current: ${getSurvivalDurationMonths(selectedPlant.plantedDate)} mo`}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                        </ScrollView>
                    </View>
                )}
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    header: {
        backgroundColor: '#3a9322',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        elevation: 5,
    },
    backButton: { padding: 5 },
    backIcon: { fontSize: 24, color: '#fff' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    headerAddIcon: { fontSize: 30, color: '#fff', fontWeight: 'bottom' },

    scrollContent: { padding: 20, paddingBottom: 100, minHeight: '100%' },
    emptyState: { alignItems: 'center', marginTop: 50 },

    summaryCard: {
        backgroundColor: '#fff', borderRadius: 15, padding: 20, flexDirection: 'row',
        justifyContent: 'space-between', alignItems: 'center', marginBottom: 25, elevation: 3
    },
    summaryItem: { alignItems: 'center', flex: 1 },
    summaryValue: { fontSize: 22, fontWeight: 'bold', color: '#3a9322' },
    summaryLabel: { fontSize: 12, color: '#666', marginTop: 4 },
    divider: { width: 1, height: '80%', backgroundColor: '#eee' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },

    plantCard: {
        backgroundColor: '#fff', borderRadius: 15, marginBottom: 15, padding: 15, flexDirection: 'row',
        elevation: 2, alignItems: 'center'
    },
    plantImageContainer: {
        width: 70, height: 70, backgroundColor: '#f0f9f0', borderRadius: 10,
        justifyContent: 'center', alignItems: 'center', marginRight: 15, overflow: 'hidden'
    },
    thumbImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    plantInfo: { flex: 1 },
    plantHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    plantName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    plantSpecies: { fontSize: 13, color: '#666', fontStyle: 'italic', marginBottom: 5 },

    statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
    statusText: { fontSize: 10, fontWeight: '600' },
    ageText: { fontSize: 11, color: '#888' },

    progressContainer: { marginTop: 2 },
    progressLabel: { fontSize: 10, color: '#888', marginBottom: 3 },
    progressBarBg: { height: 6, backgroundColor: '#eee', borderRadius: 3, width: '100%', overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: '#3a9322', borderRadius: 3 },

    // Modals
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 25 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    input: { backgroundColor: '#f5f5f5', borderRadius: 10, padding: 15, marginBottom: 15, color: '#333' },
    modalButtons: { flexDirection: 'row', gap: 10 },
    cancelButton: { flex: 1, padding: 15, borderRadius: 10, backgroundColor: '#f5f5f5', alignItems: 'center' },
    cancelButtonText: { color: '#666', fontWeight: 'bold' },
    saveButton: { flex: 1, padding: 15, borderRadius: 10, backgroundColor: '#3a9322', alignItems: 'center' },
    saveButtonText: { color: '#fff', fontWeight: 'bold' },

    // Details Modal
    detailsContainer: { flex: 1, backgroundColor: '#f8f9fa' },
    detailsHeader: { padding: 20, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' },
    closeIcon: { fontSize: 24, color: '#333' },
    detailsTitle: { fontSize: 18, fontWeight: 'bold' },
    detailsSectionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 20, marginBottom: 10, color: '#444' },
    comparisonCard: { backgroundColor: '#fff', padding: 15, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
    photoColumn: { alignItems: 'center' },
    photoLabel: { fontSize: 12, color: '#666', marginBottom: 5 },
    photoFrame: { width: 100, height: 120, backgroundColor: '#eee', borderRadius: 10, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    compareImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    noPhotoText: { fontSize: 10, color: '#999' },
    arrowColumn: { justifyContent: 'center' },
    arrow: { fontSize: 24, color: '#3a9322' },
    dateLabel: { fontSize: 10, color: '#999', marginTop: 5 },

    aiAnalysisBox: { backgroundColor: '#e6f4ea', padding: 15, borderRadius: 15, marginTop: 20, borderLeftWidth: 4, borderLeftColor: '#3a9322' },
    aiTitle: { fontWeight: 'bold', color: '#3a9322', marginBottom: 5 },
    aiText: { fontSize: 13, color: '#444', lineHeight: 20 },

    actionGrid: { marginTop: 20 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3a9322', padding: 15, borderRadius: 12, justifyContent: 'center', marginBottom: 20 },
    actionIcon: { marginRight: 10, fontSize: 18 },
    actionText: { color: '#fff', fontWeight: 'bold' },

    statusContainer: { backgroundColor: '#fff', padding: 15, borderRadius: 15 },
    statusLabel: { fontSize: 14, fontWeight: 'bold', marginBottom: 10 },
    statusOptions: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
    statusChip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0' },
    statusChipActive: { backgroundColor: '#3a9322' },
    statusChipText: { fontSize: 12, color: '#666' },
    statusChipTextActive: { color: '#fff', fontWeight: 'bold' },

    badgeSection: { marginBottom: 40 },
    bigBadgeCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 15, borderWidth: 1 },
    bigBadgeUnlocked: { backgroundColor: '#fff9e6', borderColor: '#FFD700' },
    bigBadgeLocked: { backgroundColor: '#f0f0f0', borderColor: '#ddd' },
    bigBadgeIcon: { fontSize: 40, marginRight: 15 },
    bigBadgeTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
    bigBadgeDesc: { fontSize: 12, color: '#666', flex: 1 },

    // Small Badge
    unlockedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF4E5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, borderWidth: 1, borderColor: '#FFD700' },
    lockedBadge: {},
    badgeIcon: { fontSize: 10, marginRight: 3 },
    badgeText: { fontSize: 10, fontWeight: 'bold', color: '#D97706' }
});
