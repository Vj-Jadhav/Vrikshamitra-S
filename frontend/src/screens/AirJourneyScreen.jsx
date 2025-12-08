import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const AirJourneyScreen = ({ navigation }) => {
    const steps = [
        {
            id: 1,
            title: 'Storytelling',
            description: 'Discover the secrets of the wind through an interactive story.',
            icon: '📖',
            screen: 'AirStorytellingGame', // Adjust screen name as needed
            color: ['#4FACFE', '#00F2FE'],
        },
        {
            id: 2,
            title: 'Learning Module',
            description: 'Learn about air quality and how to protect our atmosphere.',
            icon: '🎓',
            screen: 'LearningModuleScreen',
            color: ['#43E97B', '#38F9D7'],
        },
        {
            id: 3,
            title: 'Games',
            description: 'Play fun games to test your knowledge about Air.',
            icon: '🎮',
            screen: 'AirGamesScreen', // Can pass params if needed
            color: ['#FA709A', '#FEE140'],
        },
        {
            id: 4,
            title: 'Challenge',
            description: 'Complete the air challenge to earn special rewards!',
            icon: '🏆',
            screen: 'ChallengesScreen',
            color: ['#667EEA', '#764BA2'],
        },
    ];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Air Journey</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.subtitle}>Complete the steps to master the Element of Air!</Text>

                <View style={styles.stepsContainer}>
                    {steps.map((step, index) => (
                        <View key={step.id} style={styles.stepWrapper}>
                            {/* Line Connector */}
                            {index !== steps.length - 1 && <View style={styles.connectorLine} />}

                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={() => navigation.navigate(step.screen)}
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

export default AirJourneyScreen;
