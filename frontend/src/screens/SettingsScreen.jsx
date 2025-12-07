import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';

export default function SettingsScreen({ navigation }) {
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [location, setLocation] = useState(true);

    const handleClearCache = () => {
        Alert.alert(
            "Clear Cache",
            "Are you sure you want to clear the app cache?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "OK", onPress: () => Alert.alert("Success", "Cache cleared successfully") }
            ]
        );
    };

    const renderSettingItem = (label, value, onValueChange, type = 'switch') => (
        <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>{label}</Text>
            {type === 'switch' && (
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    trackColor={{ false: "#767577", true: "#81c784" }}
                    thumbColor={value ? "#3a9322ff" : "#f4f3f4"}
                />
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionTitle}>General</Text>
                <View style={styles.section}>
                    {renderSettingItem('Push Notifications', notifications, setNotifications)}
                    {renderSettingItem('Location Services', location, setLocation)}
                    {renderSettingItem('Dark Mode', darkMode, setDarkMode)}
                </View>

                <Text style={styles.sectionTitle}>Account</Text>
                <TouchableOpacity style={styles.buttonItem} onPress={() => navigation.navigate('EditProfileScreen')}>
                    <Text style={styles.buttonText}>Edit Profile</Text>
                    <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonItem} onPress={() => navigation.navigate('ResetPasswordScreen')}>
                    <Text style={styles.buttonText}>Change Password</Text>
                    <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>Data</Text>
                <TouchableOpacity style={styles.buttonItem} onPress={handleClearCache}>
                    <Text style={styles.buttonText}>Clear Cache</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.versionText}>Version 1.0.0</Text>
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
    sectionTitle: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
        marginBottom: 10,
        marginTop: 10,
        marginLeft: 5,
        textTransform: 'uppercase',
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 20,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    settingLabel: {
        fontSize: 16,
        color: '#333',
    },
    buttonItem: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    buttonText: {
        fontSize: 16,
        color: '#333',
    },
    chevron: {
        fontSize: 20,
        color: '#ccc',
        fontWeight: 'bold',
    },
    footer: {
        marginTop: 30,
        alignItems: 'center',
    },
    versionText: {
        color: '#999',
        fontSize: 12,
    }
});
