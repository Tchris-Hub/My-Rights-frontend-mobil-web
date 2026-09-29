/**
 * Navigation Type Definitions
 * Type-safe navigation for the entire app
 */

import type { NavigatorScreenParams } from '@react-navigation/native';

// Root Stack (Onboarding → Auth → Main)
export type RootStackParamList = {
    Onboarding: undefined;
    Auth: NavigatorScreenParams<AuthStackParamList>;
    AccountType: undefined;
    PractitionerOnboarding: undefined;
    Chat: { initialMessage?: string; conversationId?: string } | undefined;
    Tools: NavigatorScreenParams<ToolsStackParamList>;
    Profile: NavigatorScreenParams<ProfileStackParamList>;
};

// Auth Stack (Login, Signup)
export type AuthStackParamList = {
    Login: undefined;
    MagicLinkSent: { email: string };
    Consent: undefined;
};

// Tools Stack (Document Review, Generate)
export type ToolsStackParamList = {
    ToolsHome: undefined;
    DocumentReview: undefined;
    DocumentGenerate: undefined;
    LawyerDirectory: undefined;
    ConstitutionExplorer: undefined;
    LegalAidMap: undefined;
    ProfessionalEnquiry: { professionalId?: string; firmId?: string; professionalName: string; practiceArea?: string };
    FirmDetails: { firm: any };
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
