import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    TextInput,
    Modal
} from 'react-native';
import Svg, { Path, Circle } from "react-native-svg";
import { LinearGradient } from 'react-native-linear-gradient'; // If available, otherwise I'll stick to View background colors or try to be safe.
// Checking imports in other files, I don't see LinearGradient used in HomeScreen. I'll stick to standard views to avoid missing dependency errors.

export default function PlantTracking({ navigation }) {
    const [plants, setPlants] = useState([
        { id: 1, name: 'Neem Tree', species: 'Azadirachta indica', age: '2 months', height: '45cm', health: 'Good', lastWatered: 'Today', progress: 0.3 },
        { id: 2, name: 'Tulsi', species: 'Ocimum tenuiflorum', age: '3 weeks', height: '15cm', health: 'Needs Care', lastWatered: '2 days ago', progress: 0.15 },
        { id: 3, name: 'Mango', species: 'Mangifera indica', age: '1 year', height: '1.2m', health: 'Excellent', lastWatered: 'Yesterday', progress: 0.6 },
    ]);
    const [modalVisible, setModalVisible] = useState(false);
    const [newPlantName, setNewPlantName] = useState('');
    const [newPlantSpecies, setNewPlantSpecies] = useState('');

    const handleAddPlant = () => {
        if (newPlantName && newPlantSpecies) {
            setPlants([...plants, {
                id: plants.length + 1,
                name: newPlantName,
                species: newPlantSpecies,
                age: 'Just planted',
                height: '0cm',
                health: 'Good',
                lastWatered: 'Today',
                progress: 0.05
            }]);
            setModalVisible(false);
            setNewPlantName('');
            setNewPlantSpecies('');
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Plant Tracker</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Dashboard Summary */}
                <View style={styles.summaryCard}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryValue}>{plants.length}</Text>
                        <Text style={styles.summaryLabel}>Plants</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryValue}>Good</Text>
                        <Text style={styles.summaryLabel}>Health</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryValue}>12</Text>
                        <Text style={styles.summaryLabel}>Actions</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>My Garden</Text>

                {plants.map((plant) => (
                    <View key={plant.id} style={styles.plantCard}>
                        <View style={styles.plantImageContainer}>
                            {/* Placeholder for plant image - effectively a colored box with a leaf emoji */}
                            <Text style={{ fontSize: 40 }}>🌿</Text>
                        </View>
                        <View style={styles.plantInfo}>
                            <View style={styles.plantHeaderRow}>
                                <Text style={styles.plantName}>{plant.name}</Text>
                                <View style={[styles.statusBadge, { backgroundColor: plant.health === 'Excellent' || plant.health === 'Good' ? '#e6f4ea' : '#fce8e6' }]}>
                                    <Text style={[styles.statusText, { color: plant.health === 'Excellent' || plant.health === 'Good' ? '#1e8e3e' : '#c5221f' }]}>
                                        {plant.health}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.plantSpecies}>{plant.species}</Text>

                            <View style={styles.detailsRow}>
                                <Text style={styles.detailText}>🌱 {plant.age}</Text>
                                <Text style={styles.detailText}>📏 {plant.height}</Text>
                            </View>

                            <View style={styles.progressContainer}>
                                <Text style={styles.progressLabel}>Growth</Text>
                                <View style={styles.progressBarBg}>
                                    <View style={[styles.progressBarFill, { width: `${plant.progress * 100}%` }]} />
                                </View>
                            </View>
                        </View>
                    </View>
                ))}

                <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                    <Text style={styles.addButtonText}>+ Add New Plant</Text>
                </TouchableOpacity>

            </ScrollView>

            {/* Add Plant Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add New Plant</Text>

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
                                <Text style={styles.saveButtonText}>Save Plant</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
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
    backButton: {
        padding: 5,
    },
    backIcon: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    summaryCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    summaryItem: {
        alignItems: 'center',
        flex: 1,
    },
    summaryValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#3a9322',
    },
    summaryLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    divider: {
        width: 1,
        height: '80%',
        backgroundColor: '#eee',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    plantCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        marginBottom: 15,
        padding: 15,
        flexDirection: 'row',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    plantImageContainer: {
        width: 80,
        height: 80,
        backgroundColor: '#f0f9f0',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    plantInfo: {
        flex: 1,
    },
    plantHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    plantName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
    },
    plantSpecies: {
        fontSize: 13,
        color: '#666',
        fontStyle: 'italic',
        marginBottom: 8,
    },
    detailsRow: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 10,
    },
    detailText: {
        fontSize: 12,
        color: '#555',
    },
    progressContainer: {
        marginTop: 5,
    },
    progressLabel: {
        fontSize: 10,
        color: '#888',
        marginBottom: 3,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: '#eee',
        borderRadius: 3,
        width: '100%',
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#3a9322',
        borderRadius: 3,
    },
    addButton: {
        backgroundColor: '#3a9322',
        padding: 16,
        borderRadius: 15,
        alignItems: 'center',
        marginTop: 10,
        elevation: 3,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 25,
        width: '100%',
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        color: '#333',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        gap: 10,
    },
    cancelButton: {
        flex: 1,
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#666',
        fontWeight: 'bold',
    },
    saveButton: {
        flex: 1,
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#3a9322',
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
