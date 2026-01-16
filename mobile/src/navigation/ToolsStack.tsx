/**
 * Tools Stack Navigator
 * Document review, generation, and lawyer directory
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DocumentReviewScreen } from '../screens/main/DocumentReviewScreen';
import { DocumentGeneratorScreen } from '../screens/main/DocumentGeneratorScreen';
import { ConstitutionExplorerScreen } from '../screens/main/ConstitutionExplorerScreen';
import { LegalAidMapScreen } from '../screens/main/LegalAidMapScreen';
import { ToolsHomeScreen } from '../screens/main/ToolsHomeScreen';
import type { ToolsStackParamList } from './types';

const Stack = createNativeStackNavigator<ToolsStackParamList>();

export const ToolsNavigator: React.FC = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="ToolsHome"
                component={ToolsHomeScreen}
                options={{ title: 'Legal Power Tools' }}
            />
            <Stack.Screen
                name="DocumentReview"
                component={DocumentReviewScreen}
                options={{ title: 'Review Document' }}
            />
            <Stack.Screen
                name="DocumentGenerate"
                component={DocumentGeneratorScreen}
                options={{ title: 'Generate Document' }}
            />
            <Stack.Screen
                name="ConstitutionExplorer"
                component={ConstitutionExplorerScreen}
                options={{ title: '1999 Constitution' }}
            />
            <Stack.Screen
                name="LegalAidMap"
                component={LegalAidMapScreen}
                options={{ title: 'Legal Aid Near Me' }}
            />
        </Stack.Navigator>
    );
};
