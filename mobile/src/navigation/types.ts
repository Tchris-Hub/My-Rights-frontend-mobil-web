/**
 * Navigation Type Definitions
 * Type-safe navigation for the entire app
 */

import type { NavigatorScreenParams } from '@react-navigation/native';

// Root Stack (Onboarding → Auth → Main)
export type RootStackParamList = {
    Onboarding: undefined;
    Auth: NavigatorScreenParams<AuthStackParamList>;
    Chat: { initialMessage?: string } | undefined;
    Tools: NavigatorScreenParams<ToolsStackParamList>;
    Profile: NavigatorScreenParams<ProfileStackParamList>;
};

// Auth Stack (Login, Signup)
export type AuthStackParamList = {
    Login: undefined;
    Signup: undefined;
    ForgotPassword: undefined;
    ResetPassword: undefined;
};

// Tools Stack (Document Review, Generate)
export type ToolsStackParamList = {
    ToolsHome: undefined;
    DocumentReview: undefined;
    DocumentGenerate: undefined;
    LawyerDirectory: undefined;
    ConstitutionExplorer: undefined;
    LegalAidMap: undefined;
};

// Profile Stack (Profile, Settings)
export type ProfileStackParamList = {
    ProfileHome: undefined;
    Settings: undefined;
    EditProfile: undefined;
    ChatHistory: undefined;
};

declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList { }
    }
}
