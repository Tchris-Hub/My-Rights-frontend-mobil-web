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
import { ProfessionalEnquiryScreen } from '../screens/main/ProfessionalEnquiryScreen';
import { FirmDetailsScreen } from '../screens/main/FirmDetailsScreen';
import { ProfessionalDetailsScreen } from '../screens/main/ProfessionalDetailsScreen';
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
            <Stack.Screen
                name="ProfessionalDetails"
                component={ProfessionalDetailsScreen}
                options={{ title: 'Professional profile' }}
            />
            <Stack.Screen
                name="ProfessionalEnquiry"
                component={ProfessionalEnquiryScreen}
                options={{ title: 'Contact professional' }}
            />
            <Stack.Screen
                name="FirmDetails"
                component={FirmDetailsScreen}
                options={{ title: 'Firm details' }}
            />
        </Stack.Navigator>
    );
};
