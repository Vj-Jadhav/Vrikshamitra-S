// // src/MainLayout.jsx
// import React from 'react';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
// import Svg, { Path } from "react-native-svg";

// import HomeScreen from './screens/HomeScreen';
// import GamesScreen from './screens/GamesScreen';
// import LearningModuleScreen from './screens/LearningModuleScreen';
// import ChallengesScreen from './screens/ChallengesScreen';

// const Tab = createBottomTabNavigator();
// const { width: screenWidth } = Dimensions.get('window');

// function CustomTabBar({ state, descriptors, navigation }) {
//   return (
//     <View style={styles.wrapper}>
//       <View style={styles.tabContainer}>
//         {state.routes.map((route, index) => {
//           const isFocused = state.index === index;

//           const onPress = () => {
//             if (!isFocused) navigation.navigate(route.name);
//           };

//           const iconColor = isFocused ? "#fff" : "#555";

//           const getIcon = (name) => {
//             switch (name) {
//               case "Home":
//                 return (
//                   <Svg width={22} height={22} viewBox="0 0 576 512">
//                     <Path fill={iconColor} d="M280.37 148.26L96 300.11V464a16 16 0 0 0 16 16l112.06-.29a16 16 0 0 0 15.92-16V368a16 16 0 0 1 16-16h64a16 16 0 0 1 16 16v95.64a16 16 0 0 0 16 16.05L464 480a16 16 0 0 0 16-16V300L295.67 148.26a12.19 12.19 0 0 0-15.3 0M571.6 251.47L488 182.56V44.05a12 12 0 0 0-12-12h-56a12 12 0 0 0-12 12v72.61L318.47 43a48 48 0 0 0-61 0L4.34 251.47a12 12 0 0 0-1.6 16.9l25.5 31A12 12 0 0 0 45.15 301l235.22-193.74a12.19 12.19 0 0 1 15.3 0L530.9 301a12 12 0 0 0 16.9-1.6l25.5-31a12 12 0 0 0-1.7-16.93"/>
//                   </Svg>
//                 );

//               case "Games":
//                 return (
//                   <Svg width={22} height={22} viewBox="0 0 512 512">
//                     <Path fill={iconColor} d="M483.13 245.38C461.92 149.49 430 98.31 382.65 84.33A107.1 107.1 0 0 0 352 80c-13.71 0-25.65 3.34-38.28 6.88C298.5 91.15 281.21 96 256 96s-42.51-4.84-57.76-9.11C185.6 83.34 173.67 80 160 80a115.7 115.7 0 0 0-31.73 4.32c-47.1 13.92-79 65.08-100.52 161C4.61 348.54 16 413.71 59.69 428.83a56.6 56.6 0 0 0 18.64 3.22c29.93 0 53.93-24.93 70.33-45.34c18.53-23.1 40.22-34.82 107.34-34.82c59.95 0 84.76 8.13 106.19 34.82c13.47 16.78 26.2 28.52 38.9 35.91c16.89 9.82 33.77 12 50.16 6.37c25.82-8.81 40.62-32.1 44-69.24c2.57-28.48-1.39-65.89-12.12-114.37M208 240h-32v32a16 16 0 0 1-32 0v-32h-32a16 16 0 0 1 0-32h32v-32a16 16 0 0 1 32 0v32h32a16 16 0 0 1 0 32m84 4a20 20 0 1 1 20-20a20 20 0 0 1-20 20m44 44a20 20 0 1 1 20-19.95A20 20 0 0 1 336 288m0-88a20 20 0 1 1 20-20a20 20 0 0 1-20 20m44 44a20 20 0 1 1 20-20a20 20 0 0 1-20 20"/>
//                   </Svg>
//                 );

//               case "Learn":
//                 return (
//                   <Svg width={22} height={22} viewBox="0 0 24 24">
//                     <Path fill={iconColor} d="M4 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm4.625 5.63a1.235 1.235 0 0 1 1.715-.992c.504.216 1.568.702 2.916 1.48a28 28 0 0 1 2.74 1.786a1.234 1.234 0 0 1 0 1.98a28 28 0 0 1-2.74 1.784a28 28 0 0 1-2.916 1.482a1.234 1.234 0 0 1-1.715-.992a29 29 0 0 1-.176-3.264c0-1.551.112-2.719.176-3.264"/>
//                   </Svg>
//                 );

//               case "Challenges":
//                 return (
//                   <Svg width={22} height={22} viewBox="0 0 24 24">
//                     <Path fill={iconColor} d="M12 2c.896 0 1.764.118 2.59.339l-2.126 2.125A3 3 0 0 0 12.04 5H12a7 7 0 1 0 7 7v-.04q.29-.18.535-.425l2.126-2.125c.221.826.339 1.694.339 2.59c0 5.523-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2m-.414 5.017c0 .851-.042 1.714.004 2.564l-.54.54a2 2 0 1 0 2.829 2.829l.54-.54c.85.046 1.712.004 2.564.004a5 5 0 1 1-5.397-5.397m6.918-4.89a1 1 0 0 1 .617.923v1.83h1.829a1 1 0 0 1 .707 1.707L18.12 10.12a1 1 0 0 1-.707.293H15l-1.828 1.829a1 1 0 0 1-1.415-1.415L13.586 9V6.586a1 1 0 0 1 .293-.708l3.535-3.535a1 1 0 0 1 1.09-.217"/>
//                   </Svg>
//                 );
//             }
//           };

//           return (
//             <TouchableOpacity
//               key={route.key}
//               onPress={onPress}
//               style={[
//                 styles.tabItem,
//                 isFocused ? styles.activeTabItem : styles.inactiveTabItem
//               ]}
//               activeOpacity={0.7}
//             >
//               <View style={[
//                 styles.innerTab,
//                 isFocused && styles.activePill
//               ]}>
//                 {getIcon(route.name)}
//                 {isFocused && (
//                   <Text 
//                     style={styles.activeText}
//                     numberOfLines={1}
//                     ellipsizeMode="tail"
//                   >
//                     {route.name}
//                   </Text>
//                 )}
//               </View>
//             </TouchableOpacity>
//           );
//         })}
//       </View>
//     </View>
//   );
// }

// export default function MainLayout() {
//   return (
//     <Tab.Navigator
//       screenOptions={{ headerShown: false }}
//       tabBar={(props) => <CustomTabBar {...props} />}
//     >
//       <Tab.Screen name="Home" component={HomeScreen} />
//       <Tab.Screen name="Games" component={GamesScreen} />
//       <Tab.Screen name="Learn" component={LearningModuleScreen} />
//       <Tab.Screen name="Challenges" component={ChallengesScreen} />
//     </Tab.Navigator>
//   );
// }

// const styles = StyleSheet.create({
//   wrapper: {
//     backgroundColor: "transparent",
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     alignItems: 'center',
//   },
//   tabContainer: {
//     flexDirection: "row",
//     backgroundColor: "#fff",
//     paddingVertical: 12,
//     paddingHorizontal: 8,
//     width: screenWidth,
//     borderTopLeftRadius: 25,
//     borderTopRightRadius: 25,
//     shadowColor: "#000",
//     shadowOpacity: 0.15,
//     shadowRadius: 12,
//     shadowOffset: { width: 0, height: -4 },
//     elevation: 20,
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   tabItem: {
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   activeTabItem: {
//     flex: 2, // Active tab takes more space
//     minWidth: 100, // Minimum width for active tab with text
//   },
//   inactiveTabItem: {
//     flex: 1, // Inactive tabs share remaining space equally
//     minWidth: 50, // Compact size for inactive tabs
//   },
//   innerTab: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center", // This ensures both icon and text are centered
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     borderRadius: 20,
//     gap: 6,
//     minHeight: 44,
//   },
//   activePill: {
//     backgroundColor: "#3a9322",
//     paddingHorizontal: 16,
//     borderRadius: 20,
//     // Remove width: '100%' and justifyContent: 'flex-start' to center content
//   },
//   activeText: {
//     color: "#fff",
//     fontSize: 13,
//     fontWeight: "600",
//     letterSpacing: 0.2,
//     marginLeft: 4,
//     flexShrink: 1,
//   },
// });



// src/MainLayout.jsx
// src/MainLayout.jsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path } from "react-native-svg";

import HomeScreen from './screens/HomeScreen';
import GamesScreen from './screens/GamesScreen';
import LearningModuleScreen from './screens/LearningModuleScreen';
import ChallengesScreen from './screens/ChallengesScreen';

// Game Map Screens
import HomeMapScreen from './screens/HomeMapScreen';

const Tab = createBottomTabNavigator();
const { width: screenWidth } = Dimensions.get('window');

function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.tabContainer}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          const onPress = () => {
            if (!isFocused) navigation.navigate(route.name);
          };

          const iconColor = isFocused ? "#fff" : "#555";

          const getIcon = (name) => {
            switch (name) {
              case "Home":
                return (
                  <Svg width={22} height={22} viewBox="0 0 576 512">
                    <Path fill={iconColor} d="M280.37 148.26L96 300.11V464a16 16 0 0 0 16 16l112.06-.29a16 16 0 0 0 15.92-16V368a16 16 0 0 1 16-16h64a16 16 0 0 1 16 16v95.64a16 16 0 0 0 16 16.05L464 480a16 16 0 0 0 16-16V300L295.67 148.26a12.19 12.19 0 0 0-15.3 0M571.6 251.47L488 182.56V44.05a12 12 0 0 0-12-12h-56a12 12 0 0 0-12 12v72.61L318.47 43a48 48 0 0 0-61 0L4.34 251.47a12 12 0 0 0-1.6 16.9l25.5 31A12 12 0 0 0 45.15 301l235.22-193.74a12.19 12.19 0 0 1 15.3 0L530.9 301a12 12 0 0 0 16.9-1.6l25.5-31a12 12 0 0 0-1.7-16.93"/>
                  </Svg>
                );

              case "Map":
                return (
                  <Svg width={22} height={22} viewBox="0 0 24 24">
                    <Path fill={iconColor} d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7M7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 2.88-2.88 7.19-5 9.88C9.92 16.21 7 11.85 7 9m5-3c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3"/>
                  </Svg>
                );

              case "Games":
                return (
                  <Svg width={22} height={22} viewBox="0 0 512 512">
                    <Path fill={iconColor} d="M483.13 245.38C461.92 149.49 430 98.31 382.65 84.33A107.1 107.1 0 0 0 352 80c-13.71 0-25.65 3.34-38.28 6.88C298.5 91.15 281.21 96 256 96s-42.51-4.84-57.76-9.11C185.6 83.34 173.67 80 160 80a115.7 115.7 0 0 0-31.73 4.32c-47.1 13.92-79 65.08-100.52 161C4.61 348.54 16 413.71 59.69 428.83a56.6 56.6 0 0 0 18.64 3.22c29.93 0 53.93-24.93 70.33-45.34c18.53-23.1 40.22-34.82 107.34-34.82c59.95 0 84.76 8.13 106.19 34.82c13.47 16.78 26.2 28.52 38.9 35.91c16.89 9.82 33.77 12 50.16 6.37c25.82-8.81 40.62-32.1 44-69.24c2.57-28.48-1.39-65.89-12.12-114.37M208 240h-32v32a16 16 0 0 1-32 0v-32h-32a16 16 0 0 1 0-32h32v-32a16 16 0 0 1 32 0v32h32a16 16 0 0 1 0 32m84 4a20 20 0 1 1 20-20a20 20 0 0 1-20 20m44 44a20 20 0 1 1 20-19.95A20 20 0 0 1 336 288m0-88a20 20 0 1 1 20-20a20 20 0 0 1-20 20m44 44a20 20 0 1 1 20-20a20 20 0 0 1-20 20"/>
                  </Svg>
                );

              case "Learn":
                return (
                  <Svg width={22} height={22} viewBox="0 0 24 24">
                    <Path fill={iconColor} d="M4 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm4.625 5.63a1.235 1.235 0 0 1 1.715-.992c.504.216 1.568.702 2.916 1.48a28 28 0 0 1 2.74 1.786a1.234 1.234 0 0 1 0 1.98a28 28 0 0 1-2.74 1.784a28 28 0 0 1-2.916 1.482a1.234 1.234 0 0 1-1.715-.992a29 29 0 0 1-.176-3.264c0-1.551.112-2.719.176-3.264"/>
                  </Svg>
                );

              case "Challenges":
                return (
                  <Svg width={22} height={22} viewBox="0 0 24 24">
                    <Path fill={iconColor} d="M12 2c.896 0 1.764.118 2.59.339l-2.126 2.125A3 3 0 0 0 12.04 5H12a7 7 0 1 0 7 7v-.04q.29-.18.535-.425l2.126-2.125c.221.826.339 1.694.339 2.59c0 5.523-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2m-.414 5.017c0 .851-.042 1.714.004 2.564l-.54.54a2 2 0 1 0 2.829 2.829l.54-.54c.85.046 1.712.004 2.564.004a5 5 0 1 1-5.397-5.397m6.918-4.89a1 1 0 0 1 .617.923v1.83h1.829a1 1 0 0 1 .707 1.707L18.12 10.12a1 1 0 0 1-.707.293H15l-1.828 1.829a1 1 0 0 1-1.415-1.415L13.586 9V6.586a1 1 0 0 1 .293-.708l3.535-3.535a1 1 0 0 1 1.09-.217"/>
                  </Svg>
                );
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={[
                styles.tabItem,
                isFocused ? styles.activeTabItem : styles.inactiveTabItem
              ]}
              activeOpacity={0.7}
            >
              <View style={[
                styles.innerTab,
                isFocused && styles.activePill
              ]}>
                {getIcon(route.name)}
                {isFocused && (
                  <Text 
                    style={styles.activeText}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {route.name}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function MainLayout() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Map" component={HomeMapScreen} />
      <Tab.Screen name="Games" component={GamesScreen} />
      <Tab.Screen name="Learn" component={LearningModuleScreen} />
      <Tab.Screen name="Challenges" component={ChallengesScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "transparent",
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 8,
    width: screenWidth,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  activeTabItem: {
    flex: 2,
    minWidth: 100,
  },
  inactiveTabItem: {
    flex: 1,
    minWidth: 50,
  },
  innerTab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
    minHeight: 44,
  },
  activePill: {
    backgroundColor: "#3a9322",
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  activeText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.2,
    marginLeft: 4,
    flexShrink: 1,
  },
});