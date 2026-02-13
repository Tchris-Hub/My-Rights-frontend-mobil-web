/**
 * Message Bubble Component
 * Reusable chat message display
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import type { ChatMessage } from '../../types';

interface MessageBubbleProps {
    message: ChatMessage;
}

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
                style={[styles.collapseHeader, { backgroundColor: isUser ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.03)' }]}
            >
                <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={14} color={isUser ? colors.onPrimary : colors.textSecondary} />
                <Text style={[styles.collapseHeaderText, { color: isUser ? colors.onPrimary : colors.textSecondary }]}>
                    {expanded ? "Hide Details" : "Show Legal Notice & Sources"}
                </Text>
            </TouchableOpacity>

            {expanded && (
                <View style={[styles.collapseContent, { borderColor: isUser ? 'rgba(255,255,255,0.1)' : colors.border }]}>
                    {sources && sources.length > 0 && (
                        <View style={styles.sourcesSection}>
                            <Text style={[styles.sectionTitle, { color: isUser ? colors.onPrimary : colors.textSecondary }]}>Sources:</Text>
                            {sources.map((source: any, idx: number) => {
                                const sourceText = typeof source === 'string'
                                    ? source
                                    : [source.title, source.section].filter(Boolean).join(' • ');
                                return (
                                    <Text key={idx} style={[styles.sourceText, { color: isUser ? colors.onPrimary : colors.textSecondary }]}>
                                        • {sourceText}
                                    </Text>
                                );
                            })}
                        </View>
                    )}

                    {!!disclaimer && (
                        <View style={styles.disclaimerSection}>
                            <Ionicons name="alert-circle-outline" size={14} color={isUser ? colors.onPrimary : colors.textTertiary} />
                            <Text style={[styles.disclaimerText, { color: isUser ? colors.onPrimary : colors.textTertiary }]}>
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

    return (
        <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
            {!isUser && (
                <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                    <Ionicons name="chatbubble" size={16} color={colors.onPrimary} />
                </View>
            )}

            <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble, { backgroundColor: isUser ? colors.primary : colors.surfaceElevated2 }]}>
                <Text style={[styles.content, { color: isUser ? colors.onPrimary : colors.text }]}>
                    {message.content}
                </Text>

                {/* Collapsible Sources & Disclaimer */}
                {((message.sources?.length ?? 0) > 0 || !!message.legal_disclaimer) && (
                    <CollapsibleInfo
                        sources={message.sources}
                        disclaimer={message.legal_disclaimer}
                        isUser={isUser}
                        colors={colors}
                    />
                )}


            </View>

            {isUser && (
                <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
                    <Ionicons name="person" size={16} color={colors.onSecondary} />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginBottom: theme.spacing.md,
        gap: theme.spacing.sm,
    },
    userContainer: {
        justifyContent: 'flex-end',
    },
    assistantContainer: {
        justifyContent: 'flex-start',
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bubble: {
        maxWidth: '75%',
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        ...theme.shadows.sm,
    },
    userBubble: {
        borderBottomRightRadius: 4,
    },
    assistantBubble: {
        borderBottomLeftRadius: 4,
    },
    content: {
        ...theme.typography.body,
    },
    sources: {
        marginTop: theme.spacing.sm,
        paddingTop: theme.spacing.sm,
        borderTopWidth: 1,
    },
    sourcesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 4,
    },
    sourcesLabel: {
        ...theme.typography.caption,
        fontWeight: '600',
    },
    source: {
        ...theme.typography.caption,
        marginTop: 2,
    },
    disclaimer: {
        ...theme.typography.caption,
        marginTop: theme.spacing.sm,
        fontStyle: 'italic',
    },
    collapseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 12,
        alignSelf: 'flex-start',
        gap: 6,
    },
    collapseHeaderText: {
        ...theme.typography.caption,
        fontWeight: '600',
    },
    collapseContent: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        gap: 8,
    },
    sourcesSection: {
        gap: 4,
    },
    sectionTitle: {
        ...theme.typography.caption,
        fontWeight: '700',
        marginBottom: 2,
    },
    sourceText: {
        fontSize: 11,
        lineHeight: 16,
    },
    disclaimerSection: {
        flexDirection: 'row',
        gap: 6,
        marginTop: 4,
    },
    disclaimerText: {
        fontSize: 10,
        fontStyle: 'italic',
        flex: 1,
    }
});
