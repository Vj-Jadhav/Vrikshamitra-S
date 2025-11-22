// src/MainLayout.jsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path } from "react-native-svg";

// Import your main app screens
import HomeScreen from './screens/HomeScreen';
import GamesScreen from './screens/GamesScreen';
import LearningModuleScreen from './screens/LearningModuleScreen';
import ChallengesScreen from './screens/ChallengesScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';

const Tab = createBottomTabNavigator();

// Custom Tab Bar Component
function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.tabContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const getTabIcon = (routeName, isFocused) => {
          const iconColor = isFocused ? '#3a9322ff' : '#000';
          
          switch(routeName) {
            case 'Home':
              return (
                <Svg width={26} height={26} viewBox="0 0 512 512">
                  <Path
                    fill={iconColor}
                    d="M277.8 8.6c-12.3-11.4-31.3-11.4-43.5 0l-224 208c-9.6 9-12.8 22.9-8 35.1S18.8 272 32 272h16v176c0 35.3 28.7 64 64 64h288c35.3 0 64-28.7 64-64V272h16c13.2 0 25-8.1 29.8-20.3s1.6-26.2-8-35.1zM240 320h32c26.5 0 48 21.5 48 48v96H192v-96c0-26.5 21.5-48 48-48"
                  />
                </Svg>
              );
            case 'Games':
              return (
                <Svg width={26} height={26} viewBox="0 0 512 512">
                  <Path
                    fill={iconColor}
                    d="M478 217.9c-13.8-32.4-43.4-53.9-79.3-57.5c-39.1-4-78.5-6.1-117.7-6.1s-78.6 2-117.7 6.1c-35.9 3.7-65.5 25.2-79.3 57.5C63.1 254.7 64 296 80.8 332.5c16 35.2 48.1 59.4 84.9 63.8c2.2.3 4.4.5 6.6-.5c36.8-4.4 68.9-28.6 84.9-63.8c16.8-36.5 17.7-77.8 2-114.6z"
                  />
                </Svg>
              );
            case 'Learn':
              return (
                <Svg width={26} height={26} viewBox="0 0 512 512">
                  <Path
                    fill={iconColor}
                    d="M96 64c-17.7 0-32 14.3-32 32v320c0 17.7 14.3 32 32 32h320c17.7 0 32-14.3 32-32V96c0-17.7-14.3-32-32-32H96zm112 96l160 112l-160 112V160z"
                  />
                </Svg>
              );
            case 'Challenges':
              return (
                <Svg width={26} height={26} viewBox="0 0 512 512">
                  <Path
                    fill={iconColor}
                    d="M256 32C132.3 32 32 132.3 32 256s100.3 224 224 224s224-100.3 224-224S379.7 32 256 32zm0 384c-88.2 0-160-71.8-160-160s71.8-160 160-160s160 71.8 160 160s-71.8 160-160 160zm0-256c-53 0-96 43-96 96s43 96 96 96s96-43 96-96s-43-96-96-96zm0 128c-17.7 0-32-14.3-32-32s14.3-32 32-32s32 14.3 32 32s-14.3 32-32 32z"
                  />
                </Svg>
              );
            case 'Leaderboard':
              return (
                <Svg width={26} height={26} viewBox="0 0 512 512">
                  <Path
                    fill={iconColor}
                    d="M256 32C132.3 32 32 132.3 32 256s100.3 224 224 224s224-100.3 224-224S379.7 32 256 32zm0 384c-88.2 0-160-71.8-160-160s71.8-160 160-160s160 71.8 160 160s-71.8 160-160 160zm0-256c-53 0-96 43-96 96s43 96 96 96s96-43 96-96s-43-96-96-96zm0 128c-17.7 0-32-14.3-32-32s14.3-32 32-32s32 14.3 32 32s-14.3 32-32 32z"
                  />
                </Svg>
              );
            default:
              return null;
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            style={[
              styles.tabItem,
              isFocused && styles.tabItemActive
            ]}
          >
            {getTabIcon(route.name, isFocused)}
            <Text style={[
              styles.tabLabel,
              isFocused ? styles.tabLabelActive : styles.tabLabelInactive
            ]}>
              {route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function MainLayout() {
  return (
    <Tab.Navigator 
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Games" component={GamesScreen} />
      <Tab.Screen name="Learn" component={LearningModuleScreen} />
      <Tab.Screen name="Challenges" component={ChallengesScreen} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  tabItemActive: {
    backgroundColor: '#adffacff',
    borderRadius: 25,
    marginHorizontal: 5,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  tabLabelActive: {
    color: '#3a9322ff',
    fontWeight: '700',
  },
  tabLabelInactive: {
    color: '#666',
  },
});