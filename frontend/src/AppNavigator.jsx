// src/AppNavigator.jsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WelcomeScreen from './screens/WelcomeScreen';
import RegisterScreen from './screens/RegisterScreen';
import LoginScreen from './screens/LoginScreen';
import MainLayout from './MainLayout';
import StorytellingGame from './screens/StorytellingGame';
import ChapterScreen from './screens/ChapterScreen';   // <-- ADD THIS

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{ headerShown: false }}
      >
        {/* Auth Screens */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />

        {/* Bottom Tabs */}
        <Stack.Screen name="Main" component={MainLayout} />

        {/* Story Game */}
        <Stack.Screen
          name="StorytellingGame"
          component={StorytellingGame}
        />

        {/* <-- YOU MUST ADD THIS TO FIX NAVIGATION */}
        <Stack.Screen
          name="ChapterScreen"
          component={ChapterScreen}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
