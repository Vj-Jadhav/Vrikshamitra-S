import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import GarbageParticipate from '../components/Garbage/GarbageParticipate';
import GarbageReport from '../components/Garbage/GarbageReport';         // Reusing existing report screen
import MyScheduledReports from '../components/Garbage/MyScheduledReports'; // New screen
import {
    CalendarCheckIcon,
    AddIcon,
    LocationOnIcon,
} from '../components/CustomIcon';

const GarbageHubScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('list'); // 'list', 'scheduled', 'report'

    const renderContent = () => {
        switch (activeTab) {
            case 'list':
                return <GarbageParticipate navigation={navigation} />;
            case 'scheduled':
                return <MyScheduledReports navigation={navigation} />;
            case 'report':
                return <GarbageReport navigation={navigation} />;
            default:
                return <GarbageParticipate navigation={navigation} />;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Garbage Management Hub</Text>
            </View>

            {/* Custom Tab Bar */}
            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={[styles.tabItem, activeTab === 'list' && styles.activeTabItem]}
                    onPress={() => setActiveTab('list')}
                >
                    <LocationOnIcon size={20} color={activeTab === 'list' ? '#fff' : '#666'} />
                    <Text style={[styles.tabText, activeTab === 'list' && styles.activeTabText]}>
                        Reported Places
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tabItem, activeTab === 'scheduled' && styles.activeTabItem]}
                    onPress={() => setActiveTab('scheduled')}
                >
                    <CalendarCheckIcon size={20} color={activeTab === 'scheduled' ? '#fff' : '#666'} />
                    <Text style={[styles.tabText, activeTab === 'scheduled' && styles.activeTabText]}>
                        My Schedules
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tabItem, activeTab === 'report' && styles.activeTabItem]}
                    onPress={() => setActiveTab('report')}
                >
                    <AddIcon size={20} color={activeTab === 'report' ? '#fff' : '#666'} />
                    <Text style={[styles.tabText, activeTab === 'report' && styles.activeTabText]}>
                        Report New
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content Area */}
            <View style={styles.contentArea}>
                {renderContent()}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingHorizontal: 8,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
        marginHorizontal: 4,
        borderRadius: 12,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        gap: 4,
    },
    activeTabItem: {
        backgroundColor: '#2196F3',
    },
    tabText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
    },
    activeTabText: {
        color: '#fff',
    },
    contentArea: {
        flex: 1,
    },
});

export default GarbageHubScreen;
