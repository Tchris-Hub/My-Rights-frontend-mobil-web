/**
 * Message Bubble Component
 * Modern chat bubble with selectable text and copy support
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Clipboard,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import type { ChatMessage } from '../../types';

import { TypewriterText } from './TypewriterText';

interface MessageBubbleProps {
    message: ChatMessage;
}

const CollapsibleInfo = ({ sources, disclaimer, isUser, colors }: any) => {
    const [expanded, setExpanded] = React.useState(false);

    return (
        <View style={{ marginTop: 8 }}>
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setExpanded(!expanded)}
                style={[
                    styles.collapseHeader,
                    { backgroundColor: isUser ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.04)' },
                ]}
            >
                <Ionicons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={12}
                    color={isUser ? colors.onPrimary : colors.textSecondary}
                />
                <Text style={[styles.collapseHeaderText, { color: isUser ? colors.onPrimary : colors.textSecondary }]}>
                    {expanded ? 'Hide Details' : 'Show Notice & Sources'}
                </Text>
            </TouchableOpacity>

            {expanded && (
                <View style={[styles.collapseContent, { borderColor: isUser ? 'rgba(255,255,255,0.15)' : colors.border }]}>
                    {sources && sources.length > 0 && (
                        <View style={styles.sourcesSection}>
                            <Text style={[styles.sectionTitle, { color: isUser ? colors.onPrimary : colors.textSecondary }]}>
                                Sources
                            </Text>
                            {sources.map((source: any, idx: number) => {
                                const sourceText =
                                    typeof source === 'string'
                                        ? source
                                        : [source.title, source.section].filter(Boolean).join(' \u2022 ');
                                return (
                                    <Text
                                        key={idx}
                                        selectable
                                        style={[styles.sourceText, { color: isUser ? colors.onPrimary : colors.textSecondary }]}
                                    >
                                        \u2022 {sourceText}
                                    </Text>
                                );
                            })}
                        </View>
                    )}

                    {!!disclaimer && (
                        <View style={styles.disclaimerSection}>
                            <Ionicons
                                name="alert-circle-outline"
                                size={12}
                                color={isUser ? colors.onPrimary : colors.textTertiary}
                            />
                            <Text
                                selectable
                                style={[styles.disclaimerText, { color: isUser ? colors.onPrimary : colors.textTertiary }]}
                            >
                                {disclaimer.replace(/⚠️/g, '').trim()}
                            </Text>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    const { colors } = useTheme();
    const isUser = message.role === 'user';
    const [skipAnimation, setSkipAnimation] = React.useState(false);

    const handlePress = () => {
        if (!isUser && !skipAnimation) {
            setSkipAnimation(true); // User taps bubble to skip animation
        }
    };

    const handleLongPress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Clipboard.setString(message.content);
        Alert.alert('Copied', 'Message copied to clipboard.');
    };

    return (
        <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
            {/* AI Avatar */}
            {!isUser && (
                <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
                    <Ionicons name="sparkles" size={14} color={colors.primary} />
                </View>
            )}

            <TouchableOpacity
                activeOpacity={0.85}
                onPress={handlePress} // Skip typing on tap
                onLongPress={handleLongPress}
                style={[
                    styles.bubble,
                    isUser ? styles.userBubble : styles.assistantBubble,
                    {
                        backgroundColor: isUser ? colors.primary : colors.surfaceElevated2,
                        // Premium Shadow for bubbles
                        shadowColor: 'rgba(0,0,0,0.1)',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 1,
                        shadowRadius: 4,
                        elevation: 2,
                    },
                ]}
            >
                {/* Selectable message text — user can highlight and copy */}
                {isUser ? (
                    <Text
                        selectable
                        style={[styles.content, { color: colors.onPrimary }]}
                    >
                        {message.content}
                    </Text>
                ) : (
                    <TypewriterText
                        text={message.content}
                        style={[styles.content, { color: colors.text }]}
                        animate={!skipAnimation && message.isNew} // Only animate new messages
                    />
                )}

                {/* Collapsible Sources & Disclaimer (only for AI) */}
                {!isUser && ((message.sources?.length ?? 0) > 0 || !!message.legal_disclaimer) && (
                    <CollapsibleInfo
                        sources={message.sources}
                        disclaimer={message.legal_disclaimer}
                        isUser={isUser}
                        colors={colors}
                    />
                )}

                {/* Subtle copy hint shown on long press (just icon) */}
                <View style={styles.copyHint}>
                    <Ionicons
                        name="copy-outline"
                        size={10}
                        color={isUser ? 'rgba(255,255,255,0.4)' : colors.textTertiary}
                    />
                </View>
            </TouchableOpacity>

            {/* User Avatar */}
            {isUser && (
                <View style={[styles.avatar, { backgroundColor: colors.secondary + '30' }]}>
                    <Ionicons name="person" size={14} color={colors.secondary} />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginBottom: 12,
        gap: 8,
        alignItems: 'flex-end',
    },
    userContainer: {
        justifyContent: 'flex-end',
    },
    assistantContainer: {
        justifyContent: 'flex-start',
    },
    avatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    bubble: {
        maxWidth: '78%',
        borderRadius: 18,
        paddingVertical: 10,
        paddingHorizontal: 14,
        ...theme.shadows.sm,
    },
    userBubble: {
        borderBottomRightRadius: 4,
    },
    assistantBubble: {
        borderBottomLeftRadius: 4,
    },
    content: {
        fontSize: 15,
        lineHeight: 22,
        letterSpacing: 0.1,
    },
    copyHint: {
        alignSelf: 'flex-end',
        marginTop: 4,
        opacity: 0.6,
    },
    collapseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 8,
        borderRadius: 10,
        alignSelf: 'flex-start',
        gap: 5,
        marginTop: 6,
    },
    collapseHeaderText: {
        fontSize: 11,
        fontWeight: '600',
    },
    collapseContent: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        gap: 6,
    },
    sourcesSection: {
        gap: 3,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '700',
        marginBottom: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    sourceText: {
        fontSize: 11,
        lineHeight: 16,
    },
    disclaimerSection: {
        flexDirection: 'row',
        gap: 5,
        marginTop: 2,
        alignItems: 'flex-start',
    },
    disclaimerText: {
        fontSize: 10,
        fontStyle: 'italic',
        flex: 1,
        lineHeight: 14,
    },
});
