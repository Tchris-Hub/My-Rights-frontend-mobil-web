/**
 * Main app shell: four tabs, each with its own stack so the tab bar is always visible
 * and back behaviour is predictable.
 */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabBar } from './TabBar';
import { ProfileNavigator } from './ProfileStack';
import { HomeScreen } from '../screens/main/HomeScreen';
import { EmergencyScreen } from '../screens/main/EmergencyScreen';
import { ChatScreen } from '../screens/main/ChatScreen';
import { HelpHomeScreen } from '../screens/main/HelpHomeScreen';
import { DocumentReviewScreen } from '../screens/main/DocumentReviewScreen';
import { DocumentGeneratorScreen } from '../screens/main/DocumentGeneratorScreen';
import { ConstitutionExplorerScreen } from '../screens/main/ConstitutionExplorerScreen';
import { LegalAidMapScreen } from '../screens/main/LegalAidMapScreen';
import { ProfessionalEnquiryScreen } from '../screens/main/ProfessionalEnquiryScreen';
import { FirmDetailsScreen } from '../screens/main/FirmDetailsScreen';
import type { HelpStackParamList, HomeStackParamList, MainTabParamList } from './types';

const Tabs = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const HelpStack = createNativeStackNavigator<HelpStackParamList>();

const HomeNavigator: React.FC = () => (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
        <HomeStack.Screen name="Home" component={HomeScreen} />
        <HomeStack.Screen name="Emergency" component={EmergencyScreen} />
        <HomeStack.Screen name="DocumentReview" component={DocumentReviewScreen} />
        <HomeStack.Screen name="DocumentGenerate" component={DocumentGeneratorScreen} />
        <HomeStack.Screen name="ConstitutionExplorer" component={ConstitutionExplorerScreen} />
    </HomeStack.Navigator>
);

const HelpNavigator: React.FC = () => (
    <HelpStack.Navigator screenOptions={{ headerShown: false }}>
        <HelpStack.Screen name="HelpHome" component={HelpHomeScreen} />
        <HelpStack.Screen name="LegalAidMap" component={LegalAidMapScreen} />
        <HelpStack.Screen name="ProfessionalEnquiry" component={ProfessionalEnquiryScreen} />
        <HelpStack.Screen name="FirmDetails" component={FirmDetailsScreen} />
    </HelpStack.Navigator>
);

export const MainTabs: React.FC = () => (
    <Tabs.Navigator tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }} initialRouteName="HomeTab">
        <Tabs.Screen name="HomeTab" component={HomeNavigator} />
        <Tabs.Screen name="AskTab" component={ChatScreen} />
        <Tabs.Screen name="HelpTab" component={HelpNavigator} />
        <Tabs.Screen name="MeTab" component={ProfileNavigator} />
    </Tabs.Navigator>
);
