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
import ChallengeDetailsScreen from './screens/ChallengeDetailsScreen';
import ProfileScreen from './screens/ProfileScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import HelpSupportScreen from './screens/HelpSupportScreen';
import AboutScreen from './screens/AboutScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';

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
import OceanGameScreen from './screens/OceanGameScreen';
import AQIGameScreen from './screens/AQIGameScreen';
import SeedSaverGameScreen from './screens/SeedSaverGameScreen';


import GarbageReport from './screens/GarbageReport';
import GarbageParticipate from './screens/GarbageParticipate';
import PlantTracking from './screens/PlantTracking';

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
        <Stack.Screen
          name="ChallengeDetailsScreen"  // THIS NAME MUST MATCH EXACTLY
          component={ChallengeDetailsScreen}
        />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />
        <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
        <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
        <Stack.Screen name="HelpSupportScreen" component={HelpSupportScreen} />
        <Stack.Screen name="AboutScreen" component={AboutScreen} />
        <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />




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
        <Stack.Screen name="OceanGame" component={OceanGameScreen} />
        <Stack.Screen name="AQIGame" component={AQIGameScreen} />
        <Stack.Screen name="SeedSaverGameScreen" component={SeedSaverGameScreen} />

        <Stack.Screen name="GarbageReport" component={GarbageReport} />
        <Stack.Screen name="GarbageParticipate" component={GarbageParticipate} />
        <Stack.Screen name="PlantTracking" component={PlantTracking} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Force reload
