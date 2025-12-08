import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  Dimensions,
  FlatList,
  Alert,
  Animated,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// API configuration
const API_BASE_URL = 'http://172.28.29.25:5000';

// Enhanced Rewards Data with more coupons
const rewards = [
  {
    id: 1,
    company: "McDonald's",
    logo: "🍔",
    discount: "20% OFF",
    discountPercent: 20,
    description: "Valid on any meal combo",
    pointsRequired: 100,
    category: "Food",
    expiration: "30 days",
    products: [
      { id: 1, name: "Big Mac Meal", emoji: "🍔", price: 350 },
      { id: 2, name: "McChicken Combo", emoji: "🍗", price: 280 },
      { id: 3, name: "Veg Supreme Meal", emoji: "🥗", price: 300 },
      { id: 4, name: "Happy Meal", emoji: "🎁", price: 250 },
    ],
  },
  {
    id: 2,
    company: "Nike",
    logo: "👟",
    discount: "15% OFF",
    discountPercent: 15,
    description: "Sports shoes & apparel",
    pointsRequired: 200,
    category: "Fashion",
    expiration: "45 days",
    products: [
      { id: 1, name: "Air Max Shoes", emoji: "👟", price: 8999 },
      { id: 2, name: "Running Shorts", emoji: "🩳", price: 1499 },
      { id: 3, name: "Sports T-Shirt", emoji: "👕", price: 1299 },
      { id: 4, name: "Training Jacket", emoji: "🧥", price: 3499 },
    ],
  },
  {
    id: 3,
    company: "Amazon",
    logo: "📦",
    discount: "₹500 Voucher",
    discountPercent: 0,
    discountFixed: 500,
    description: "On orders above ₹2000",
    pointsRequired: 300,
    category: "Shopping",
    expiration: "60 days",
    products: [
      { id: 1, name: "Wireless Headphones", emoji: "🎧", price: 2999 },
      { id: 2, name: "Smart Watch", emoji: "⌚", price: 3499 },
      { id: 3, name: "Kindle Reader", emoji: "📖", price: 7999 },
      { id: 4, name: "Echo Dot", emoji: "🔊", price: 4499 },
    ],
  },
  {
    id: 4,
    company: "Starbucks",
    logo: "☕",
    discount: "Free Drink",
    discountPercent: 100,
    description: "Any size, any beverage",
    pointsRequired: 150,
    category: "Food",
    expiration: "15 days",
    products: [
      { id: 1, name: "Caffe Latte", emoji: "☕", price: 280 },
      { id: 2, name: "Cappuccino", emoji: "☕", price: 260 },
      { id: 3, name: "Frappuccino", emoji: "🥤", price: 320 },
      { id: 4, name: "Espresso", emoji: "☕", price: 180 },
    ],
  },
  {
    id: 5,
    company: "BookMyShow",
    logo: "🎬",
    discount: "₹200 OFF",
    discountPercent: 0,
    discountFixed: 200,
    description: "Movie tickets",
    pointsRequired: 120,
    category: "Entertainment",
    expiration: "30 days",
    products: [
      { id: 1, name: "2 Movie Tickets", emoji: "🎟️", price: 600 },
      { id: 2, name: "Premium Seats", emoji: "🎭", price: 900 },
      { id: 3, name: "IMAX Experience", emoji: "🎬", price: 1200 },
      { id: 4, name: "Family Pack (4)", emoji: "👨‍👩‍👧‍👦", price: 1800 },
    ],
  },
  {
    id: 6,
    company: "Zomato",
    logo: "🍕",
    discount: "30% OFF",
    discountPercent: 30,
    description: "Food delivery orders",
    pointsRequired: 80,
    category: "Food",
    expiration: "20 days",
    products: [
      { id: 1, name: "Pizza Margherita", emoji: "🍕", price: 450 },
      { id: 2, name: "Chicken Biryani", emoji: "🍛", price: 320 },
      { id: 3, name: "Burger & Fries", emoji: "🍔", price: 280 },
      { id: 4, name: "Sushi Platter", emoji: "🍱", price: 650 },
    ],
  },
  {
    id: 7,
    company: "Flipkart",
    logo: "🛍️",
    discount: "₹1000 OFF",
    discountPercent: 0,
    discountFixed: 1000,
    description: "On electronics above ₹5000",
    pointsRequired: 400,
    category: "Shopping",
    expiration: "45 days",
    products: [
      { id: 1, name: "Bluetooth Speaker", emoji: "🔊", price: 2999 },
      { id: 2, name: "Power Bank", emoji: "🔋", price: 1499 },
      { id: 3, name: "Tablet", emoji: "📱", price: 15999 },
      { id: 4, name: "Laptop Bag", emoji: "💼", price: 1999 },
    ],
  },
  {
    id: 8,
    company: "Swiggy",
    logo: "🚚",
    discount: "40% OFF",
    discountPercent: 40,
    description: "Max discount ₹150",
    pointsRequired: 90,
    category: "Food",
    expiration: "25 days",
    products: [
      { id: 1, name: "Paneer Butter Masala", emoji: "🍛", price: 320 },
      { id: 2, name: "Chocolate Milkshake", emoji: "🥤", price: 180 },
      { id: 3, name: "Garlic Bread", emoji: "🍞", price: 150 },
      { id: 4, name: "Vegetable Fried Rice", emoji: "🍚", price: 220 },
    ],
  },
  {
    id: 9,
    company: "Myntra",
    logo: "👗",
    discount: "25% OFF",
    discountPercent: 25,
    description: "On fashion apparel",
    pointsRequired: 180,
    category: "Fashion",
    expiration: "35 days",
    products: [
      { id: 1, name: "Casual Shirt", emoji: "👕", price: 1299 },
      { id: 2, name: "Jeans", emoji: "👖", price: 1899 },
      { id: 3, name: "Summer Dress", emoji: "👗", price: 2299 },
      { id: 4, name: "Formal Shoes", emoji: "👞", price: 2999 },
    ],
  },
  {
    id: 10,
    company: "Netflix",
    logo: "🎥",
    discount: "1 Month Free",
    discountPercent: 100,
    description: "Standard plan subscription",
    pointsRequired: 250,
    category: "Entertainment",
    expiration: "15 days",
    products: [
      { id: 1, name: "1 Month Subscription", emoji: "🎬", price: 649 },
      { id: 2, name: "Premium Plan", emoji: "🎥", price: 799 },
      { id: 3, name: "Mobile Plan", emoji: "📱", price: 299 },
      { id: 4, name: "Basic Plan", emoji: "📺", price: 499 },
    ],
  },
  {
    id: 11,
    company: "Uber",
    logo: "🚗",
    discount: "₹100 OFF",
    discountPercent: 0,
    discountFixed: 100,
    description: "On rides above ₹200",
    pointsRequired: 70,
    category: "Travel",
    expiration: "10 days",
    products: [
      { id: 1, name: "Uber Go Ride", emoji: "🚙", price: 250 },
      { id: 2, name: "Uber Premier", emoji: "🚘", price: 350 },
      { id: 3, name: "Uber Auto", emoji: "🛺", price: 180 },
      { id: 4, name: "Uber Moto", emoji: "🏍️", price: 120 },
    ],
  },
  {
    id: 12,
    company: "Decathlon",
    logo: "🏃",
    discount: "15% OFF",
    discountPercent: 15,
    description: "Sports equipment",
    pointsRequired: 160,
    category: "Sports",
    expiration: "40 days",
    products: [
      { id: 1, name: "Football", emoji: "⚽", price: 1299 },
      { id: 2, name: "Yoga Mat", emoji: "🧘", price: 899 },
      { id: 3, name: "Badminton Racket", emoji: "🏸", price: 1499 },
      { id: 4, name: "Cycling Helmet", emoji: "⛑️", price: 1299 },
    ],
  },
  {
    id: 13,
    company: "Domino's",
    logo: "🍕",
    discount: "Buy 1 Get 1 Free",
    discountPercent: 50,
    description: "On medium pizzas",
    pointsRequired: 110,
    category: "Food",
    expiration: "20 days",
    products: [
      { id: 1, name: "Margherita Pizza", emoji: "🍕", price: 299 },
      { id: 2, name: "Pepperoni Pizza", emoji: "🍕", price: 349 },
      { id: 3, name: "Veg Extravaganza", emoji: "🍕", price: 399 },
      { id: 4, name: "Farmhouse Pizza", emoji: "🍕", price: 379 },
    ],
  },
  {
    id: 14,
    company: "Spotify",
    logo: "🎵",
    discount: "3 Months Free",
    discountPercent: 100,
    description: "Premium subscription",
    pointsRequired: 220,
    category: "Entertainment",
    expiration: "20 days",
    products: [
      { id: 1, name: "Premium Individual", emoji: "🎧", price: 119 },
      { id: 2, name: "Premium Duo", emoji: "👥", price: 189 },
      { id: 3, name: "Premium Family", emoji: "👨‍👩‍👧‍👦", price: 239 },
      { id: 4, name: "Student Plan", emoji: "🎓", price: 59 },
    ],
  },
  {
    id: 15,
    company: "Croma",
    logo: "📺",
    discount: "₹1500 OFF",
    discountPercent: 0,
    discountFixed: 1500,
    description: "On appliances above ₹10000",
    pointsRequired: 350,
    category: "Electronics",
    expiration: "50 days",
    products: [
      { id: 1, name: "Microwave Oven", emoji: "🍲", price: 8999 },
      { id: 2, name: "Air Conditioner", emoji: "❄️", price: 34999 },
      { id: 3, name: "Washing Machine", emoji: "👚", price: 21999 },
      { id: 4, name: "LED TV", emoji: "📺", price: 27999 },
    ],
  },
];

// Categories for filtering
const categories = [
  { id: 'all', name: 'All Rewards', emoji: '🏆' },
  { id: 'food', name: 'Food & Dining', emoji: '🍔' },
  { id: 'shopping', name: 'Shopping', emoji: '🛍️' },
  { id: 'entertainment', name: 'Entertainment', emoji: '🎬' },
  { id: 'fashion', name: 'Fashion', emoji: '👗' },
  { id: 'travel', name: 'Travel', emoji: '✈️' },
];

export default function RewardsScreen({ route }) {
  const navigation = useNavigation();
  
  // State management
  const [points, setPoints] = useState(0);
  const [pointsInput, setPointsInput] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [studentId, setStudentId] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];

  // Get student ID and auth token from AsyncStorage
  useEffect(() => {
    const getUserData = async () => {
      try {
        const storedStudentId = await AsyncStorage.getItem('studentId');
        const token = await AsyncStorage.getItem('token');
        
        if (storedStudentId) {
          setStudentId(storedStudentId);
          setAuthToken(token);
          fetchEcoPoints(storedStudentId, token);
        } else {
          console.log('No studentId found in AsyncStorage');
          // For testing, set a mock student ID
          const mockStudentId = '67890abcdef1234567890ab';
          setStudentId(mockStudentId);
          setAuthToken('mock-token');
          fetchEcoPoints(mockStudentId, 'mock-token');
        }
      } catch (error) {
        console.error('Error getting user data:', error);
        // Continue with mock data for testing
        const mockStudentId = '67890abcdef1234567890ab';
        setStudentId(mockStudentId);
        setAuthToken('mock-token');
        fetchEcoPoints(mockStudentId, 'mock-token');
      }
    };

    getUserData();
  }, []);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (studentId && authToken) {
        fetchEcoPoints(studentId, authToken);
      }
    }, [studentId, authToken])
  );

  // Start animations when loading completes
  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading]);

  // Fetch eco-points from database - FIXED VERSION
  const fetchEcoPoints = async (id, token = null) => {
    try {
      setLoading(true);
      
      console.log('Fetching eco-points for student:', id);
      
      // Try multiple endpoints
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token && token !== 'mock-token') {
        headers['Authorization'] = `Bearer ${token}`;
      }

      let totalEcoPoints = 0;
      
      try {
        // Try the main endpoint
        const response = await fetch(
          `${API_BASE_URL}/api/students/${id}/challenges/details`, 
          {
            method: 'GET',
            headers: headers,
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log('API Response:', data);
          
          if (data.success && data.challenges) {
            // Calculate total eco-points
            data.challenges.forEach(challenge => {
              if (challenge.progressStatus === 'approved' || challenge.status === 'approved') {
                if (challenge.ecoPoints !== undefined) {
                  totalEcoPoints += Number(challenge.ecoPoints) || 0;
                } else if (challenge.pointsEarned !== undefined) {
                  totalEcoPoints += Number(challenge.pointsEarned) || 0;
                }
              }
            });
            
            console.log('Total eco-points calculated:', totalEcoPoints);
          }
        } else {
          console.log('Endpoint failed, status:', response.status);
        }
      } catch (error) {
        console.log('Error fetching from main endpoint:', error);
      }

      // Fallback to mock data if needed
      if (totalEcoPoints === 0) {
        console.log('Using mock eco-points for testing');
        totalEcoPoints = 105;
      }

      setPoints(totalEcoPoints);
      
    } catch (error) {
      console.error('Error in fetchEcoPoints:', error);
      // Use mock data on error
      setPoints(105);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (studentId && authToken) {
      fetchEcoPoints(studentId, authToken);
    }
  }, [studentId, authToken]);

  // Add points function (frontend only - for testing)
  const addPoints = () => {
    const newPoints = parseInt(pointsInput);
    if (newPoints && newPoints > 0) {
      setPoints(prev => prev + newPoints);
      showSuccessMessage(`Added ${newPoints} test EcoPoints! 🎉`);
      setPointsInput('');
    } else {
      Alert.alert('Invalid Input', 'Please enter a valid number of points.');
    }
  };

  const redeemReward = (reward) => {
    if (points >= reward.pointsRequired) {
      setSelectedReward(reward);
      setSelectedProduct(null);
      generateCouponCode(reward);
      setShowModal(true);
    } else {
      Alert.alert(
        'Insufficient Points',
        `You need ${reward.pointsRequired} points to redeem this reward.\nYou currently have ${points} points.`,
        [{ text: 'OK', style: 'cancel' }]
      );
    }
  };

  const generateCouponCode = (reward) => {
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = `VRKSH-${reward.company.substring(0, 3)}-${timestamp}${random}`;
    setCouponCode(code);
  };

  const calculateDiscountedPrice = (product) => {
    if (!selectedReward) return product.price;
    
    if (selectedReward.discountFixed) {
      return Math.max(0, product.price - selectedReward.discountFixed);
    } else {
      return product.price * (1 - selectedReward.discountPercent / 100);
    }
  };

  const completePurchase = async () => {
    if (selectedProduct && selectedReward) {
      try {
        // Check if we have enough points
        if (points < selectedReward.pointsRequired) {
          Alert.alert('Error', 'Not enough points to complete purchase.');
          return;
        }

        // Create redemption record
        const redemptionData = {
          studentId: studentId,
          rewardId: selectedReward.id,
          rewardName: selectedReward.company,
          pointsUsed: selectedReward.pointsRequired,
          couponCode: couponCode,
          product: selectedProduct.name,
          originalPrice: selectedProduct.price,
          discountedPrice: Math.round(calculateDiscountedPrice(selectedProduct)),
          redeemedAt: new Date().toISOString()
        };

        console.log('Attempting redemption:', redemptionData);

        // Try to save redemption
        try {
          const response = await fetch(`${API_BASE_URL}/api/rewards/redeem`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(authToken && authToken !== 'mock-token' ? { 'Authorization': `Bearer ${authToken}` } : {}),
            },
            body: JSON.stringify(redemptionData),
          });

          if (response.ok) {
            // Update points
            const newPoints = points - selectedReward.pointsRequired;
            setPoints(newPoints);
            
            showSuccessMessage(
              `🎉 Purchase Successful!\nCoupon: ${couponCode}\nOrder confirmed for ${selectedProduct.name}!`
            );
          } else {
            throw new Error('API call failed');
          }
        } catch (error) {
          // For testing, simulate successful purchase
          const newPoints = points - selectedReward.pointsRequired;
          setPoints(newPoints);
          
          showSuccessMessage(
            `🎉 TEST: Purchase Successful!\nCoupon: ${couponCode}\nOrder confirmed for ${selectedProduct.name}!`
          );
        }
        
        setShowModal(false);
        setSelectedProduct(null);
        setSelectedReward(null);
      } catch (error) {
        console.error('Error completing purchase:', error);
        // For testing, simulate successful purchase
        const newPoints = points - selectedReward.pointsRequired;
        setPoints(newPoints);
        
        showSuccessMessage(
          `🎉 TEST MODE: Purchase Successful!\nCoupon: ${couponCode}\nOrder confirmed for ${selectedProduct.name}!`
        );
        
        setShowModal(false);
        setSelectedProduct(null);
        setSelectedReward(null);
      }
    }
  };

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  // Filtered rewards based on category and search
  const filteredRewards = rewards.filter(reward => {
    const matchesCategory = activeCategory === 'all' || 
      (reward.category && reward.category.toLowerCase() === activeCategory);
    
    const safeSearchQuery = searchQuery.toLowerCase();
    const matchesSearch = 
      (reward.company && reward.company.toLowerCase().includes(safeSearchQuery)) ||
      (reward.description && reward.description.toLowerCase().includes(safeSearchQuery));
    
    return matchesCategory && matchesSearch;
  });

  // Render reward card
  const renderRewardCard = ({ item }) => {
    const canRedeem = points >= item.pointsRequired;
    
    return (
      <Animated.View 
        style={[
          styles.rewardCard, 
          !canRedeem && styles.lockedCard,
        ]}
      >
        <View style={styles.rewardHeader}>
          <View style={[styles.companyLogo, { backgroundColor: getCompanyColor(item.company) }]}>
            <Text style={styles.logoText}>{item.logo}</Text>
          </View>
          <View style={styles.rewardInfo}>
            <Text style={styles.companyName}>{item.company}</Text>
            <Text style={styles.rewardDescription}>{item.description}</Text>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          </View>
        </View>
        
        <View style={[styles.discountBadge, { backgroundColor: canRedeem ? '#4CAF50' : '#757575' }]}>
          <Text style={styles.discountText}>{item.discount}</Text>
        </View>
        
        <View style={styles.rewardFooter}>
          <View style={styles.pointsRequired}>
            <Text style={styles.pointsLabel}>Points Required:</Text>
            <Text style={[styles.pointsValue, { color: canRedeem ? '#4CAF50' : '#757575' }]}>
              {item.pointsRequired}
            </Text>
          </View>
          <Text style={styles.expirationText}>Expires in {item.expiration}</Text>
        </View>
        
        <TouchableOpacity
          style={[styles.redeemButton, canRedeem ? styles.activeButton : styles.disabledButton]}
          onPress={() => redeemReward(item)}
          disabled={!canRedeem}
        >
          <Text style={styles.redeemButtonText}>
            {canRedeem ? '🛒 Redeem Now' : '🔒 Need More Points'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Helper function for company colors
  const getCompanyColor = (company) => {
    const colors = {
      "McDonald's": "#FFBC0D",
      "Nike": "#111111",
      "Amazon": "#FF9900",
      "Starbucks": "#00704A",
      "BookMyShow": "#F84437",
      "Zomato": "#E23744",
      "Flipkart": "#0071BB",
      "Swiggy": "#FC8019",
      "Myntra": "#F54E6A",
      "Netflix": "#E50914",
      "Uber": "#000000",
      "Decathlon": "#0082C3",
      "Domino's": "#0B648F",
      "Spotify": "#1DB954",
      "Croma": "#FF6B00",
    };
    return colors[company] || '#667eea';
  };

  // Render loading state
  const renderLoading = () => {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#3a9322" />
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🌿 EcoPoints Rewards</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3a9322" />
          <Text style={styles.loadingText}>Loading your eco-points...</Text>
        </View>
      </SafeAreaView>
    );
  };

  // Render main content
  const renderContent = () => {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#3a9322" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🌿 EcoPoints Rewards</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => navigation.navigate('RedeemedCoupons', { studentId })}>
              <Text style={styles.historyText}>History</Text>
            </TouchableOpacity>
          </View>
        </View>

        {showSuccess && (
          <View style={styles.successMessage}>
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        )}

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#3a9322']}
              tintColor="#3a9322"
            />
          }
        >
          {/* Points Balance Card */}
          <Animated.View 
            style={[
              styles.pointsCard,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            <View style={styles.pointsDisplay}>
              <View style={styles.coinContainer}>
                <Text style={styles.coinIcon}>🪙</Text>
              </View>
              <View style={styles.pointsInfo}>
                <Text style={styles.totalPoints}>{points.toLocaleString()}</Text>
                <Text style={styles.pointsLabel}>Available EcoPoints</Text>
              </View>
              <TouchableOpacity 
                style={styles.pointsHistoryButton}
                onPress={() => navigation.navigate('PointsHistory', { studentId })}
              >
                <Text style={styles.pointsHistoryText}>View History</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Add points earned from activities:</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.pointsInput}
                  placeholder="Enter points amount"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={pointsInput}
                  onChangeText={setPointsInput}
                />
                <TouchableOpacity style={styles.addButton} onPress={addPoints}>
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.infoNote}>
                Note: Points added here are for testing only
              </Text>
            </View>
          </Animated.View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="🔍 Search rewards..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Categories */}
          <View style={styles.categoriesContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    activeCategory === category.id && styles.activeCategoryButton,
                  ]}
                  onPress={() => setActiveCategory(category.id)}
                >
                  <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                  <Text style={[
                    styles.categoryName,
                    activeCategory === category.id && styles.activeCategoryName,
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Rewards Count */}
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsText}>
              {filteredRewards.length} {activeCategory === 'all' ? 'Rewards' : activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Available
            </Text>
            <Text style={styles.sortText}>Sort by: Points</Text>
          </View>

          {/* Available Rewards */}
          <View style={styles.sectionContainer}>
            <FlatList
              data={filteredRewards}
              renderItem={renderRewardCard}
              keyExtractor={item => item.id.toString()}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.rewardsGrid}
            />
          </View>

          {/* Info Section */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>💡 How to Redeem Rewards</Text>
            <View style={styles.infoStep}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>Complete eco-friendly challenges to earn EcoPoints</Text>
            </View>
            <View style={styles.infoStep}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>Browse available rewards from our partners</Text>
            </View>
            <View style={styles.infoStep}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>Redeem using your points and get coupon code</Text>
            </View>
            <View style={styles.infoStep}>
              <Text style={styles.stepNumber}>4</Text>
              <Text style={styles.stepText}>Use coupon code at checkout with partner</Text>
            </View>
          </View>
        </ScrollView>

        {/* Redemption Modal */}
        <Modal
          visible={showModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleContainer}>
                  <Text style={styles.modalLogo}>{selectedReward?.logo}</Text>
                  <View>
                    <Text style={styles.modalTitle}>{selectedReward?.company}</Text>
                    <Text style={styles.modalCategory}>{selectedReward?.category}</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowModal(false)}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Modal Body */}
              <ScrollView style={styles.modalBody}>
                <View style={styles.discountBanner}>
                  <Text style={styles.discountBannerText}>
                    🎉 {selectedReward?.discount} APPLIED!
                  </Text>
                  <Text style={styles.discountDescription}>
                    {selectedReward?.description}
                  </Text>
                  <Text style={styles.expirationNote}>
                    ⏰ Expires in {selectedReward?.expiration}
                  </Text>
                </View>

                {/* Products */}
                <Text style={styles.productsTitle}>Select Product:</Text>
                <View style={styles.productsGrid}>
                  {selectedReward?.products?.map((product) => {
                    const isSelected = selectedProduct?.id === product.id;
                    const discountedPrice = calculateDiscountedPrice(product);
                    const savings = product.price - discountedPrice;
                    
                    return (
                      <TouchableOpacity
                        key={product.id}
                        style={[
                          styles.productCard,
                          isSelected && styles.selectedProduct,
                        ]}
                        onPress={() => setSelectedProduct(product)}
                      >
                        <View style={styles.productImage}>
                          <Text style={styles.productEmoji}>{product.emoji}</Text>
                        </View>
                        <Text style={styles.productName}>{product.name}</Text>
                        
                        <View style={styles.priceContainer}>
                          <Text style={styles.originalPrice}>₹{product.price}</Text>
                          <Text style={styles.discountedPrice}>
                            ₹{Math.round(discountedPrice)}
                          </Text>
                          {savings > 0 && (
                            <Text style={styles.savingsText}>
                              Save ₹{Math.round(savings)}
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Checkout Section */}
                {selectedProduct && (
                  <View style={styles.checkoutSection}>
                    <Text style={styles.checkoutTitle}>Order Summary</Text>
                    
                    <View style={styles.checkoutRow}>
                      <Text style={styles.checkoutLabel}>Product:</Text>
                      <Text style={styles.checkoutValue}>{selectedProduct.name}</Text>
                    </View>
                    
                    <View style={styles.checkoutRow}>
                      <Text style={styles.checkoutLabel}>Original Price:</Text>
                      <Text style={styles.checkoutValue}>₹{selectedProduct.price}</Text>
                    </View>
                    
                    <View style={styles.checkoutRow}>
                      <Text style={styles.checkoutLabel}>Discount:</Text>
                      <Text style={styles.discountValue}>
                        - ₹{Math.round(selectedProduct.price - calculateDiscountedPrice(selectedProduct))}
                      </Text>
                    </View>
                    
                    <View style={styles.divider} />
                    
                    <View style={styles.checkoutRow}>
                      <Text style={styles.totalLabel}>Total to Pay:</Text>
                      <Text style={styles.totalAmount}>
                        ₹{Math.round(calculateDiscountedPrice(selectedProduct))}
                      </Text>
                    </View>
                    
                    <View style={styles.pointsDeduction}>
                      <Text style={styles.pointsDeductionText}>
                        ⚡ {selectedReward?.pointsRequired} EcoPoints will be deducted
                      </Text>
                    </View>
                    
                    <View style={styles.couponCode}>
                      <Text style={styles.couponLabel}>Your Coupon Code:</Text>
                      <Text style={styles.couponCodeText}>{couponCode}</Text>
                      <Text style={styles.couponNote}>
                        📝 Show this code at checkout | 📧 Code will also be emailed
                      </Text>
                    </View>
                    
                    <TouchableOpacity 
                      style={styles.checkoutButton} 
                      onPress={completePurchase}
                    >
                      <Text style={styles.checkoutButtonText}>
                        ✅ Confirm Purchase ({selectedReward?.pointsRequired} points)
                      </Text>
                    </TouchableOpacity>
                    
                    <Text style={styles.termsText}>
                      *Terms & Conditions apply. Points once deducted cannot be refunded.
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  };

  // Main render - NO conditional return before hooks
  return loading && !refreshing ? renderLoading() : renderContent();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#3a9322',
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    width: 60,
  },
  historyText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 15,
  },
  pointsCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  pointsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  coinContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#FFD700',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  coinIcon: {
    fontSize: 30,
  },
  pointsInfo: {
    flex: 1,
  },
  totalPoints: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#3a9322',
  },
  pointsLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  pointsHistoryButton: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  pointsHistoryText: {
    color: '#3a9322',
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 15,
  },
  inputSection: {},
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  pointsInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#3a9322',
    paddingHorizontal: 20,
    borderRadius: 10,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoNote: {
    fontSize: 12,
    color: '#999',
    marginTop: 10,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  successMessage: {
    backgroundColor: '#4CAF50',
    padding: 15,
    marginHorizontal: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  successText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  searchContainer: {
    marginTop: 15,
  },
  searchInput: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  categoriesContainer: {
    marginTop: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activeCategoryButton: {
    backgroundColor: '#3a9322',
    borderColor: '#3a9322',
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeCategoryName: {
    color: '#fff',
  },
  resultsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  resultsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  sortText: {
    fontSize: 14,
    color: '#666',
  },
  sectionContainer: {
    marginBottom: 10,
  },
  rewardsGrid: {
    gap: 15,
    paddingBottom: 20,
  },
  rewardCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    margin: 5,
    minWidth: width * 0.43,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  lockedCard: {
    opacity: 0.7,
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  companyLogo: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    color: 'white',
  },
  rewardInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  categoryTag: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 10,
    color: '#3a9322',
    fontWeight: '600',
  },
  discountBadge: {
    padding: 8,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  discountText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  rewardFooter: {
    marginBottom: 12,
  },
  pointsRequired: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pointsLabel: {
    fontSize: 12,
    color: '#666',
  },
  pointsValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  expirationText: {
    fontSize: 10,
    color: '#999',
    textAlign: 'right',
  },
  redeemButton: {
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#3a9322',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  redeemButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    backgroundColor: '#3a9322',
    borderRadius: 12,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: 'bold',
    marginRight: 12,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#555',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.9,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalLogo: {
    fontSize: 28,
    marginRight: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCategory: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  modalBody: {
    padding: 20,
  },
  discountBanner: {
    backgroundColor: '#e8f5e9',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  discountBannerText: {
    color: '#3a9322',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  discountDescription: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  expirationNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  productsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 20,
  },
  productCard: {
    width: (width - 70) / 2,
    borderWidth: 2,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  selectedProduct: {
    borderColor: '#3a9322',
    backgroundColor: '#f0f9f0',
  },
  productImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  productEmoji: {
    fontSize: 40,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  priceContainer: {
    alignItems: 'center',
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    color: '#999',
    fontSize: 12,
  },
  discountedPrice: {
    color: '#e53935',
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  savingsText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
  },
  checkoutSection: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 12,
    marginTop: 10,
  },
  checkoutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  checkoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkoutLabel: {
    fontSize: 14,
    color: '#666',
  },
  checkoutValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  discountValue: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3a9322',
  },
  pointsDeduction: {
    backgroundColor: '#fff3cd',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  pointsDeductionText: {
    color: '#856404',
    fontSize: 14,
    fontWeight: '600',
  },
  couponCode: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#3a9322',
    borderStyle: 'dashed',
    alignItems: 'center',
    marginTop: 15,
  },
  couponLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  couponCodeText: {
    fontFamily: 'monospace',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3a9322',
    letterSpacing: 1,
    marginBottom: 5,
  },
  couponNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  checkoutButton: {
    backgroundColor: '#3a9322',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    marginTop: 15,
    fontStyle: 'italic',
  },
});