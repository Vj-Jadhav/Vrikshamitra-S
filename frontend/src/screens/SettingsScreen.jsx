import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function SettingsScreen({ navigation }) {
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [location, setLocation] = useState(true);

    const [languageModalVisible, setLanguageModalVisible] = useState(false);
    const { t, i18n } = useTranslation();

    const languages = [
        { code: 'en', label: 'English' },
        { code: 'hi', label: 'हिन्दी' },
        { code: 'pa', label: 'ਪੰਜਾਬੀ' },
    ];

    const changeLanguage = (langCode) => {
        i18n.changeLanguage(langCode);
        setLanguageModalVisible(false);
    };

    const handleClearCache = () => {
        Alert.alert(
            "Clear Cache",
            t('cache_cleared_confirm'),
            [
                { text: t('cancel'), style: "cancel" },
                { text: t('ok'), onPress: () => Alert.alert("Success", t('cache_cleared_success')) }
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
                <Text style={styles.headerTitle}>{t('settings')}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionTitle}>{t('general')}</Text>
                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.settingItem}
                        onPress={() => setLanguageModalVisible(true)}
                    >
                        <Text style={styles.settingLabel}>{t('change_language')}</Text>
                        <Text style={{ color: '#666' }}>
                            {languages.find(l => l.code === i18n.language)?.label || 'English'}
                        </Text>
                    </TouchableOpacity>
                    {renderSettingItem(t('push_notifications'), notifications, setNotifications)}
                    {renderSettingItem(t('location_services'), location, setLocation)}
                    {renderSettingItem(t('dark_mode'), darkMode, setDarkMode)}
                </View>

                <Text style={styles.sectionTitle}>{t('account')}</Text>
                <TouchableOpacity style={styles.buttonItem} onPress={() => navigation.navigate('EditProfileScreen')}>
                    <Text style={styles.buttonText}>{t('profile')}</Text>
                    <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonItem} onPress={() => navigation.navigate('ResetPasswordScreen')}>
                    <Text style={styles.buttonText}>{t('change_password')}</Text>
                    <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>{t('data')}</Text>
                <TouchableOpacity style={styles.buttonItem} onPress={handleClearCache}>
                    <Text style={styles.buttonText}>{t('clear_cache')}</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.versionText}>{t('version')} 1.0.0</Text>
                </View>
            </ScrollView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={languageModalVisible}
                onRequestClose={() => setLanguageModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{t('select_language')}</Text>
                        {languages.map((lang) => (
                            <TouchableOpacity
                                key={lang.code}
                                style={styles.languageOption}
                                onPress={() => changeLanguage(lang.code)}
                            >
                                <Text style={[
                                    styles.languageText,
                                    i18n.language === lang.code && styles.selectedLanguageText
                                ]}>
                                    {lang.label}
                                </Text>
                                {i18n.language === lang.code && <Text style={styles.checkMark}>✓</Text>}
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setLanguageModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>{t('close')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    languageOption: {
        width: '100%',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    languageText: {
        fontSize: 16,
        color: '#333',
    },
    selectedLanguageText: {
        color: '#3a9322',
        fontWeight: 'bold',
    },
    checkMark: {
        color: '#3a9322',
        fontSize: 18,
    },
    closeButton: {
        marginTop: 20,
        paddingVertical: 10,
        paddingHorizontal: 30,
        backgroundColor: '#f5f5f5',
        borderRadius: 20,
    },
    closeButtonText: {
        color: '#666',
        fontSize: 16,
    }
});
