/**
 * Main Tab Navigator
 * Bottom tabs with glassmorphic floating bar
 */

import React from 'react';
// Main navigation component
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GlassmorphicTabBar } from './GlassmorphicTabBar';
import type { MainTabParamList } from './types';

// Import screens (placeholders for now - will be created next)
import { HomeScreen } from '../screens/main/HomeScreen';
import { ChatScreen } from '../screens/main/ChatScreen';
import { ToolsNavigator } from './ToolsStack';
import { ProfileNavigator } from './ProfileStack';

import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

const Tab = createBottomTabNavigator<MainTabParamList>();

const getTabBarVisibility = (route: any) => {
    const routeName = getFocusedRouteNameFromRoute(route);

    // Tools Stack
    if (route.name === 'Tools') {
        // If undefined, it's the initial screen (ToolsHome) - Show Tab Bar
        if (!routeName) return 'flex';
        // Only show on ToolsHome
        return routeName === 'ToolsHome' ? 'flex' : 'none';
    }

    // Profile Stack
    if (route.name === 'Profile') {
        if (!routeName) return 'flex';
        return routeName === 'ProfileHome' ? 'flex' : 'none';
    }

    // Default behavior
    return 'flex';
};

export const MainTabs: React.FC = () => {
    return (
        <Tab.Navigator
            tabBar={(props) => <GlassmorphicTabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Home',
                }}
            />

            <Tab.Screen
                name="Chat"
                component={ChatScreen}
                options={{
                    tabBarLabel: 'Chat',
                    tabBarStyle: { display: 'none' },
                }}
            />

            <Tab.Screen
                name="Tools"
                component={ToolsNavigator}
                options={({ route }) => ({
                    tabBarLabel: 'Tools',
                    tabBarStyle: { display: getTabBarVisibility(route) },
                })}
            />

            <Tab.Screen
                name="Profile"
                component={ProfileNavigator}
                options={({ route }) => ({
                    tabBarLabel: 'Profile',
                    tabBarStyle: { display: getTabBarVisibility(route) },
                })}
            />
        </Tab.Navigator>
    );
};
