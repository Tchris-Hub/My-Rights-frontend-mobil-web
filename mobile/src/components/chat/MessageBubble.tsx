/**
 * Message Bubble Component
 * Reusable chat message display
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import type { ChatMessage } from '../../types';

interface MessageBubbleProps {
    message: ChatMessage;
}

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

                {message.sources && message.sources.length > 0 && (
                    <View style={[styles.sources, { borderTopColor: isUser ? colors.onPrimary + '30' : colors.border }]}>
                        <View style={styles.sourcesHeader}>
                            <Ionicons name="book-outline" size={12} color={isUser ? colors.onPrimary : colors.textSecondary} />
                            <Text style={[styles.sourcesLabel, { color: isUser ? colors.onPrimary : colors.textSecondary }]}>
                                Sources
                            </Text>
                        </View>
                        {message.sources.map((source, idx) => (
                            <Text key={idx} style={[styles.source, { color: isUser ? colors.onPrimary : colors.textSecondary }]}>
                                • {source}
                            </Text>
                        ))}
                    </View>
                )}

                {message.legal_disclaimer && (
                    <Text style={[styles.disclaimer, { color: isUser ? colors.onPrimary + 'CC' : colors.textTertiary }]}>
                        {message.legal_disclaimer}
                    </Text>
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
});
