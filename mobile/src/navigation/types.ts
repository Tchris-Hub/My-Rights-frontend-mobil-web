/**
 * Navigation Type Definitions
 * Type-safe navigation for the entire app
 */

import type { NavigatorScreenParams } from '@react-navigation/native';

// Root Stack (Onboarding -> Auth -> Main)
export type RootStackParamList = {
    Onboarding: undefined;
    Auth: NavigatorScreenParams<AuthStackParamList>;
    Main: NavigatorScreenParams<MainTabParamList>;
};

export type MainTabParamList = {
    HomeTab: NavigatorScreenParams<HomeStackParamList>;
    AskTab: { initialMessage?: string; conversationId?: string; nonce?: number } | undefined;
    HelpTab: NavigatorScreenParams<HelpStackParamList>;
    MeTab: NavigatorScreenParams<ProfileStackParamList>;
};

export type HomeStackParamList = {
    Home: undefined;
    Emergency: undefined;
    DocumentReview: { jobId?: string } | undefined;
    DocumentGenerate: { jobId?: string } | undefined;
    ConstitutionExplorer: undefined;
};

export type HelpStackParamList = {
    HelpHome: undefined;
    LegalAidMap: undefined;
    ProfessionalEnquiry: { professionalId?: string; firmId?: string; professionalName: string; practiceArea?: string };
    FirmDetails: { firm: any };
};

// Auth Stack (Login, Signup)
export type AuthStackParamList = {
    Login: undefined;
    MagicLinkSent: { email: string };
    Consent: undefined;
};

// Profile Stack (Profile, Settings)
export type ProfileStackParamList = {
    ProfileHome: undefined;
    Settings: undefined;
    EditProfile: undefined;
    ChatHistory: undefined;
    LegalEnquiries: undefined;
    ProfessionalProfile: undefined;
    SavedRights: undefined;
    PrivacyCenter: undefined;
    SupportCenter: undefined;
    FirmDetails: { firm: any };
};

declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList { }
    }
}
