import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WelcomeScreen from './src/screens/WelcomeScreen';   // 👈 Add this
import HomeScreen from './src/screens/HomeScreen';         // Optional
import RegisterScreen from './src/screens/RegisterScreen'; // 👈 Add this
import LoginScreen from './src/screens/LoginScreen';
import LeaderboardScreen from "./src/screens/LeaderboardScreen";       // 👈 Add this
import LearningModuleScreen from "./src/screens/LearningModuleScreen";  
import GamesScreen from "./src/screens/GamesScreen";
import ChallengesScreen from "./src/screens/ChallengesScreen";

import Games from "./src/screens/Games.jsx";  


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="GarbageReport"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="LeaderboardScreen" component={LeaderboardScreen} />
        <Stack.Screen name="LearningModuleScreen" component={LearningModuleScreen} />
        <Stack.Screen name="GamesScreen" component={GamesScreen} />
        <Stack.Screen name="ChallengesScreen" component={ChallengesScreen} />
 
        <Stack.Screen name="Games" component={Games} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
