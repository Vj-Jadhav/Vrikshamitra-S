import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const CATEGORY_DATA = {
    AIR: {
        title: 'Air Journey',
        subtitle: 'Master the Element of Air!',
        steps: [
            { id: 1, title: 'Storytelling', description: 'Discover the secrets of the wind.', icon: '📖', screen: 'AirStorytellingGame', color: ['#4FACFE', '#00F2FE'] },
            { id: 2, title: 'Learning Module', description: 'Learn about air quality.', icon: '🎓', screen: 'LearningModuleScreen', color: ['#43E97B', '#38F9D7'] },
            { id: 3, title: 'Games', description: 'Test your knowledge about Air.', icon: '🎮', screen: 'AirGamesScreen', params: { game: 'AQIGame' }, color: ['#FA709A', '#FEE140'] }, // Example param
            { id: 4, title: 'Challenge', description: 'Complete the air challenge.', icon: '🏆', screen: 'ChallengesScreen', color: ['#667EEA', '#764BA2'] },
        ]
    },
    ENERGY: {
        title: 'Energy Journey',
        subtitle: 'Unleash the Power of Energy!',
        steps: [
            { id: 1, title: 'Storytelling', description: 'The story of renewable power.', icon: '📖', screen: 'StorytellingGame', color: ['#F2994A', '#F2C94C'] },
            { id: 2, title: 'Learning Module', description: 'Understanding energy sources.', icon: '🎓', screen: 'LearningModuleScreen', color: ['#fdc830', '#f37335'] },
            { id: 3, title: 'Games', description: 'Energy saving mini-games.', icon: '🎮', screen: 'GamesScreen', color: ['#ff9966', '#ff5e62'] },
            { id: 4, title: 'Challenge', description: 'Reduce your carbon footprint.', icon: '🏆', screen: 'ChallengesScreen', color: ['#f09819', '#edde5d'] },
        ]
    },
    FOOD: {
        title: 'Food Journey',
        subtitle: 'Explore the World of Sustainable Food!',
        steps: [
            { id: 1, title: 'Storytelling', description: 'From farm to table.', icon: '📖', screen: 'StorytellingGame', color: ['#11998e', '#38ef7d'] },
            { id: 2, title: 'Learning Module', description: 'Healthy eating habits.', icon: '🎓', screen: 'LearningModuleScreen', color: ['#Dce35b', '#45b649'] },
            { id: 3, title: 'Games', description: 'Sort healthy vs junk food.', icon: '🎮', screen: 'GamesScreen', color: ['#56ab2f', '#a8e063'] },
            { id: 4, title: 'Challenge', description: 'Zero waste cooking.', icon: '🏆', screen: 'ChallengesScreen', color: ['#00b09b', '#96c93d'] },
        ]
    },
    WASTE: {
        title: 'Waste Journey',
        subtitle: 'Become a Recycling Hero!',
        steps: [
            { id: 1, title: 'Storytelling', description: 'The journey of a plastic bottle.', icon: '📖', screen: 'StorytellingGame', color: ['#76b852', '#8DC26F'] },
            { id: 2, title: 'Learning Module', description: 'Reduce, Reuse, Recycle.', icon: '🎓', screen: 'LearningModuleScreen', color: ['#c2e59c', '#64b3f4'] },
            { id: 3, title: 'Games', description: 'Waste Sorter Game.', icon: '🎮', screen: 'WasteSorter', color: ['#00c6ff', '#0072ff'] },
            { id: 4, title: 'Challenge', description: 'Clean up your neighborhood.', icon: '🏆', screen: 'ChallengesScreen', color: ['#1D976C', '#93F9B9'] },
        ]
    },
    WATER: {
        title: 'Water Journey',
        subtitle: 'Protect Our Precious Blue!',
        steps: [
            { id: 1, title: 'Storytelling', description: 'The cycle of water.', icon: '📖', screen: 'StorytellingGame', color: ['#00c6ff', '#0072ff'] },
            { id: 2, title: 'Learning Module', description: 'Conserving water daily.', icon: '🎓', screen: 'LearningModuleScreen', color: ['#4facfe', '#00f2fe'] },
            { id: 3, title: 'Games', description: 'Ocean cleanup mission.', icon: '🎮', screen: 'OceanGame', color: ['#0072ff', '#00c6ff'] },
            { id: 4, title: 'Challenge', description: 'Save water challenge.', icon: '🏆', screen: 'ChallengesScreen', color: ['#3a7bd5', '#3a6073'] },
        ]
    },
    LAND: {
        title: 'Land Journey',
        subtitle: 'Guardians of the Earth!',
        steps: [
            { id: 1, title: 'Storytelling', description: 'Life in the forest.', icon: '📖', screen: 'StorytellingGame', color: ['#5A3F37', '#2C3E50'] },
            { id: 2, title: 'Learning Module', description: 'Soil health and planting.', icon: '🎓', screen: 'LearningModuleScreen', color: ['#e1eec3', '#f05053'] },
            { id: 3, title: 'Games', description: 'Plant a virtual tree.', icon: '🎮', screen: 'PlantTracking', color: ['#134E5E', '#71B280'] },
            { id: 4, title: 'Challenge', description: 'Plant a real sapling.', icon: '🏆', screen: 'ChallengesScreen', color: ['#1D976C', '#93F9B9'] },
        ]
    }
};

const CategoryJourneyScreen = ({ route, navigation }) => {
    const { category } = route.params || { category: 'AIR' }; // Default to AIR if missing
    const data = CATEGORY_DATA[category] || CATEGORY_DATA.AIR;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{data.title}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.subtitle}>{data.subtitle}</Text>

                <View style={styles.stepsContainer}>
                    {data.steps.map((step, index) => (
                        <View key={step.id} style={styles.stepWrapper}>
                            {/* Line Connector */}
                            {index !== data.steps.length - 1 && <View style={styles.connectorLine} />}

                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={() => {
                                    const params = step.params || {};
                                    navigation.navigate(step.screen, { ...params, category: category });
                                }}
                            >
                                <LinearGradient
                                    colors={step.color}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.card}
                                >
                                    <View style={styles.iconContainer}>
                                        <Text style={styles.icon}>{step.icon}</Text>
                                    </View>
                                    <View style={styles.textContainer}>
                                        <Text style={styles.stepTitle}>Step {step.id}: {step.title}</Text>
                                        <Text style={styles.stepDescription}>{step.description}</Text>
                                    </View>
                                    <Text style={styles.arrow}>→</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
    },
    backButtonText: {
        fontSize: 24,
        color: '#333',
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    scrollContent: {
        padding: 20,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 22,
    },
    stepsContainer: {
        position: 'relative',
    },
    stepWrapper: {
        marginBottom: 20,
        position: 'relative',
    },
    connectorLine: {
        position: 'absolute',
        left: 40,
        top: 60,
        bottom: -30,
        width: 4,
        backgroundColor: '#E0E0E0',
        zIndex: -1,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    icon: {
        fontSize: 24,
    },
    textContainer: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    stepDescription: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.9)',
        lineHeight: 18,
    },
    arrow: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 10,
    },
});

export default CategoryJourneyScreen;
