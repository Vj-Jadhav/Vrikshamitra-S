import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

export default function AirGamesScreen() {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.header}>Air Games</Text>
                <Text style={styles.subHeader}>
                    Fun games to learn about Air Quality!
                </Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* AQI Game Banner */}
                <View style={[styles.featuredBanner, styles.aqiBanner]}>
                    <View style={styles.featuredContent}>
                        <Text style={[styles.featuredTitle, styles.aqiTitle]}>AQI Adventure</Text>
                        <Text style={[styles.featuredSubtitle, styles.aqiSubtitle]}>Air Quality Awareness Game</Text>
                        <Text style={styles.featuredDescription}>
                            Play an interactive AQI learning game! Identify pollution sources, improve air quality, and discover ways to protect your health.
                        </Text>
                        <TouchableOpacity
                            style={[styles.featuredButton, styles.aqiButton]}
                            onPress={() => navigation.navigate('AQIGame')}
                        >
                            <Text style={styles.featuredButtonText}>Start AQI Mission</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.featuredIcon}>
                        <Text style={styles.featuredIconText}>🌬️</Text>
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
    },
    headerContainer: {
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: "white",
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    header: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#1a365d",
        marginBottom: 8,
    },
    subHeader: {
        fontSize: 16,
        color: "#718096",
        lineHeight: 22,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },
    featuredBanner: {
        flexDirection: "row",
        backgroundColor: "white",
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        minHeight: 180,
    },
    aqiBanner: {
        backgroundColor: '#f0f9ff',
        borderWidth: 2,
        borderColor: '#d6e4ff',
    },
    featuredContent: {
        flex: 1,
        marginRight: 16,
        justifyContent: "space-between",
    },
    featuredTitle: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#4a5568",
        letterSpacing: 1,
        marginBottom: 4,
        textTransform: "uppercase",
    },
    aqiTitle: {
        color: '#3b82f6',
    },
    featuredSubtitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1a202c",
        marginBottom: 8,
    },
    aqiSubtitle: {
        color: '#1e40af',
    },
    featuredDescription: {
        fontSize: 13,
        color: "#4a5568",
        lineHeight: 18,
        marginBottom: 16,
    },
    featuredButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignSelf: "flex-start",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    aqiButton: {
        backgroundColor: '#3b82f6',
    },
    featuredButtonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 13,
    },
    featuredIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "rgba(255,255,255,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    featuredIconText: {
        fontSize: 30,
    },
});
