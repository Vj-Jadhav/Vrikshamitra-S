import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';

export default function AboutScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>About Vrikshamitra</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.logoContainer}>
                    <View style={styles.logoPlaceholder}>
                        {/* Replace with actual app logo if available */}
                        <Text style={styles.logoText}>VM</Text>
                    </View>
                    <Text style={styles.appName}>Vrikshamitra</Text>
                    <Text style={styles.version}>Version 1.0.0</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Our Mission</Text>
                    <Text style={styles.cardText}>
                        Vrikshamitra aims to empower students and communities to take active part in environmental conservation through gamified challenges, learning modules, and waste management tracking.
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Developed By</Text>
                    <Text style={styles.cardText}>
                        Team TechPravaha for Smart India Hackathon (SIH) 2K25.
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Credits</Text>
                    <Text style={styles.cardText}>
                        • Icons by Flaticon{'\n'}
                        • Illustrations by Freepik{'\n'}
                        • Map data by Google Maps
                    </Text>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>© 2025 Vrikshamitra. All rights reserved.</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#3a9322ff',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 15,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 10,
    },
    logoPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 20,
        backgroundColor: '#3a9322ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        elevation: 5,
    },
    logoText: {
        color: '#fff',
        fontSize: 40,
        fontWeight: 'bold',
    },
    appName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    version: {
        fontSize: 14,
        color: '#666',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3a9322ff',
        marginBottom: 10,
    },
    cardText: {
        fontSize: 15,
        color: '#555',
        lineHeight: 22,
    },
    footer: {
        marginTop: 20,
        alignItems: 'center',
        paddingBottom: 20,
    },
    footerText: {
        color: '#999',
        fontSize: 12,
    }
});
