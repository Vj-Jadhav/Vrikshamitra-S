import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Dimensions,
    StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

const AirStorytellingGame = () => {
    const navigation = useNavigation();

    const chapters = [
        {
            id: 'air',
            title: 'BREATH OF LIFE',
            subtitle: 'Air Pollution Adventure',
            description: 'Help Aura clean the air and make cities fresh again!',
            icon: '💨',
            color: '#4ECDC4',
            pixelColor: '#44B3AC',
            stats: ['5 SCENES', '3 CHOICES', 'FUN LEARNING'],
            animation: require('../assets/animations/air_spirit.json'),
            character: 'Aura'
        }
    ];

    const PixelCard = ({ children, style, pixelColor = '#34495E' }) => (
        <View style={[styles.pixelBorder, { borderColor: pixelColor }]}>
            <View style={[styles.pixelCard, style]}>
                {children}
            </View>
        </View>
    );

    const ChapterCard = ({ chapter, index }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('ChapterScreen', {
                chapterId: chapter.id
            })}
            activeOpacity={0.8}
            style={styles.chapterCardWrapper}
        >
            <PixelCard pixelColor={chapter.pixelColor} style={styles.chapterCard}>
                <View style={styles.chapterHeader}>
                    <View style={styles.chapterLeft}>
                        <View style={[styles.chapterIcon, { backgroundColor: chapter.color }]}>
                            <Text style={styles.chapterIconText}>{chapter.icon}</Text>
                        </View>
                        <View>
                            <Text style={styles.chapterBadge}>CHAPTER {index + 1}</Text>
                            <Text style={styles.characterName}>with {chapter.character}</Text>
                        </View>
                    </View>
                    <View style={styles.chapterAnimation}>
                        <LottieView
                            source={chapter.animation}
                            autoPlay
                            loop
                            style={styles.miniAnimation}
                        />
                    </View>
                </View>

                <View style={styles.chapterContent}>
                    <Text style={styles.chapterTitle}>{chapter.title}</Text>
                    <Text style={styles.chapterSubtitle}>{chapter.subtitle}</Text>
                    <Text style={styles.chapterDescription}>{chapter.description}</Text>

                    <View style={styles.statsContainer}>
                        {chapter.stats.map((stat, statIndex) => (
                            <View key={statIndex} style={[styles.statTag, { backgroundColor: chapter.color }]}>
                                <Text style={styles.statTagText}>{stat}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.startSection}>
                    <View style={styles.progressContainer}>
                        <Text style={styles.progressLabel}>READY TO PLAY!</Text>
                        <View style={[styles.pixelProgress, { backgroundColor: chapter.pixelColor }]}>
                            <View style={[styles.progressFill, { backgroundColor: chapter.color, width: '0%' }]} />
                        </View>
                    </View>
                    <View style={[styles.startButton, { backgroundColor: chapter.color }]}>
                        <Text style={styles.startText}>PLAY NOW</Text>
                        <Text style={styles.startArrow}>🎮</Text>
                    </View>
                </View>
            </PixelCard>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#4ECDC4" />

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.headerContainer}>
                    <Text style={styles.headerTitle}>Air Storytelling Adventure</Text>
                </View>

                {/* Chapters */}
                <View style={styles.chaptersSection}>
                    {chapters.map((chapter, index) => (
                        <ChapterCard key={chapter.id} chapter={chapter} index={index} />
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 30,
    },
    headerContainer: {
        paddingTop: 30,
        paddingBottom: 10,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2C3E50',
    },
    // Chapters Section
    chaptersSection: {
        padding: 20,
    },
    chapterCardWrapper: {
        marginBottom: 16,
    },
    chapterCard: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    chapterHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    chapterLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    chapterIcon: {
        width: 50,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    chapterIconText: {
        fontSize: 20,
    },
    chapterBadge: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 2,
    },
    characterName: {
        fontSize: 11,
        color: '#7F8C8D',
        fontStyle: 'italic',
    },
    chapterAnimation: {
        width: 60,
        height: 60,
    },
    miniAnimation: {
        width: '100%',
        height: '100%',
    },
    chapterContent: {
        marginBottom: 16,
    },
    chapterTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 4,
    },
    chapterSubtitle: {
        fontSize: 14,
        color: '#7F8C8D',
        marginBottom: 8,
        fontWeight: '600',
    },
    chapterDescription: {
        fontSize: 13,
        color: '#34495E',
        lineHeight: 18,
        marginBottom: 12,
    },
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    statTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginRight: 8,
        marginBottom: 4,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    statTagText: {
        fontSize: 9,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    startSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    progressContainer: {
        flex: 1,
    },
    progressLabel: {
        fontSize: 10,
        color: '#7F8C8D',
        fontWeight: '600',
        marginBottom: 4,
    },
    pixelProgress: {
        height: 6,
        backgroundColor: '#ECF0F1',
        borderRadius: 3,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#34495E',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
    startButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        marginLeft: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    startText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginRight: 4,
    },
    startArrow: {
        fontSize: 12,
    },
    // Pixel Art Components
    pixelBorder: {
        borderWidth: 2,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderRadius: 20,
    },
    pixelCard: {
        borderWidth: 2,
        borderTopColor: '#FFFFFF',
        borderLeftColor: '#FFFFFF',
        borderBottomColor: '#BDC3C7',
        borderRightColor: '#BDC3C7',
        borderRadius: 18,
    },
});

export default AirStorytellingGame;
