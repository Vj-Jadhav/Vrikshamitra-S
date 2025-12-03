// src/AppNavigator.jsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// ================= Auth Screens =================
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

// ================= Original Feature Screens =================
import HomeScreen from './screens/HomeScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import LearningModuleScreen from './screens/LearningModuleScreen';
import GamesScreen from './screens/GamesScreen';
import ChallengesScreen from './screens/ChallengesScreen';
import ProfileScreen from './screens/ProfileScreen';
import NotificationsScreen from './screens/NotificationsScreen';

// ================= Story Feature (from story branch) =================
import MainLayout from './MainLayout';
import StorytellingGame from './screens/StorytellingGame';
import ChapterScreen from './screens/ChapterScreen';

// ================= Game Map Screens =================
import HomeMapScreen from './screens/HomeMapScreen';
import StoreScreen from './screens/StoreScreen';
import MiniGamesScreen from './screens/MiniGamesScreen';
import GardenScreen from './screens/GardenScreen';
import RecycleScreen from './screens/RecycleScreen';
import LearningScreen from './screens/LearningScreen';



import GarbageReport from './screens/GarbageReport';
import GarbageParticipate from './screens/GarbageParticipate';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>

        {/* Auth Routes */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />

        {/* Original App Screens */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="LeaderboardScreen" component={LeaderboardScreen} />
        <Stack.Screen name="LearningModuleScreen" component={LearningModuleScreen} />
        <Stack.Screen name="GamesScreen" component={GamesScreen} />
        <Stack.Screen name="ChallengesScreen" component={ChallengesScreen} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />

        {/* Bottom Navigation Layout */}
        <Stack.Screen name="Main" component={MainLayout} />

        {/* Story Mode */}
        <Stack.Screen name="StorytellingGame" component={StorytellingGame} />
        <Stack.Screen name="ChapterScreen" component={ChapterScreen} />

        {/* Game Map */}
        <Stack.Screen name="HomeMap" component={HomeMapScreen} />
        <Stack.Screen name="Store" component={StoreScreen} />
        <Stack.Screen name="MiniGames" component={MiniGamesScreen} />
        <Stack.Screen name="Garden" component={GardenScreen} />
        <Stack.Screen name="Recycle" component={RecycleScreen} />
        <Stack.Screen name="Learning" component={LearningScreen} />


        <Stack.Screen name="GarbageReport" component={GarbageReport} />
        <Stack.Screen name="GarbageParticipate" component={GarbageParticipate} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
