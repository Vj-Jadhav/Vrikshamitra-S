import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';

export default function HelpSupportScreen({ navigation }) {
    const faqs = [
        {
            question: "How do I earn Eco Points?",
            answer: "You can earn Eco Points by completing daily challenges, reporting garbage, and participating in community events."
        },
        {
            question: "How do I claim my certificate?",
            answer: "Once you complete 100% of your assigned challenges, a 'Claim Certificate' button will appear in the Challenges screen."
        },
        {
            question: "Can I change my avatar?",
            answer: "Yes, go to your Profile screen and tap on your avatar image or the 'Edit' badge to choose a new one."
        }
    ];

    const handleContactSupport = () => {
        Linking.openURL('mailto:support@vrikshamitra.com?subject=Support Request');
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help & Support</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

                {faqs.map((faq, index) => (
                    <View key={index} style={styles.faqCard}>
                        <Text style={styles.question}>{faq.question}</Text>
                        <Text style={styles.answer}>{faq.answer}</Text>
                    </View>
                ))}

                <Text style={styles.sectionTitle}>Contact Us</Text>
                <View style={styles.contactCard}>
                    <Text style={styles.contactText}>Need more help? Our team is here for you.</Text>
                    <TouchableOpacity style={styles.contactButton} onPress={handleContactSupport}>
                        <Text style={styles.contactButtonText}>Email Support</Text>
                    </TouchableOpacity>
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
        fontSize: 18,
        color: '#333',
        fontWeight: 'bold',
        marginBottom: 15,
        marginTop: 10,
    },
    faqCard: {
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
    question: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3a9322ff',
        marginBottom: 8,
    },
    answer: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
    },
    contactCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    contactText: {
        fontSize: 16,
        color: '#555',
        marginBottom: 20,
        textAlign: 'center',
    },
    contactButton: {
        backgroundColor: '#3a9322ff',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    contactButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    }
});
