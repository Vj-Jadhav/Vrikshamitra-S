// src/AppNavigator.jsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import SimpleMap from './screens/Simplemap'

import WelcomeScreen from './screens/WelcomeScreen';
import RegisterScreen from './screens/RegisterScreen';
import LoginScreen from './screens/LoginScreen';
import MainLayout from './MainLayout'; // Import the MainLayout
import StorytellingGame from './screens/StorytellingGame';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{ headerShown: false }}
      >
        {/* Auth Screens - No Bottom Navigation */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        {/* <Stack.Screen name="Map" component={SimpleMap} /> */}
        {/* Main App with Bottom Tabs */}
        <Stack.Screen name="Main" component={MainLayout} />
        <Stack.Screen
          name="StorytellingGame"
          component={StorytellingGame}
          options={{ title: 'Eco Chronicles' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}