import type { Ionicons } from '@expo/vector-icons';

export interface Situation {
    id: string;
    title: string;
    hint: string;
    icon: keyof typeof Ionicons.glyphMap;
    /** Sent to the assistant when the person taps the row. */
    prompt: string;
}

export const SITUATIONS: Situation[] = [
    {
        id: 'police',
        title: 'Police stopped or arrested me',
        hint: 'Searches, detention, bail, statements',
        icon: 'shield-half-outline',
        prompt: 'I have been stopped by the police in Nigeria. What are my rights, and what should I do right now?',
    },
    {
        id: 'landlord',
        title: 'My landlord wants me out',
        hint: 'Eviction, rent increase, deposits',
        icon: 'home-outline',
        prompt: 'My landlord wants me to leave the house I rent. What are my rights as a tenant in Nigeria?',
    },
    {
        id: 'work',
        title: 'Problem at work',
        hint: 'Sacked, unpaid, no contract',
        icon: 'briefcase-outline',
        prompt: 'My employer in Nigeria has sacked me or is not paying me. What are my rights as an employee?',
    },
    {
        id: 'loan',
        title: 'A loan app is threatening me',
        hint: 'Harassment, calls to your contacts',
        icon: 'phone-portrait-outline',
        prompt: 'A loan app is threatening me and calling my contacts about a debt. What are my rights in Nigeria?',
    },
    {
        id: 'family',
        title: 'Family or domestic violence',
        hint: 'Protection, custody, inheritance',
        icon: 'people-outline',
        prompt: 'I need help with a family problem involving violence or abuse. What protection does Nigerian law give me, and where can I get help?',
    },
    {
        id: 'land',
        title: 'Land or property dispute',
        hint: 'Someone is claiming what is yours',
        icon: 'map-outline',
        prompt: 'Someone is claiming land or property that I own or rent in Nigeria. What can I do?',
    },
];

export const ARREST_PROMPT =
    'I am being arrested or detained by the police in Nigeria right now. Tell me, step by step, what I should do and what I am allowed to refuse.';
