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
    Platform,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import theme, { typography } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import type { ChatMessage } from '../../types';

import { TypewriterText } from './TypewriterText';

interface MessageBubbleProps {
    message: ChatMessage;
}

const SourceBadge = ({ type, colors }: { type: string; colors: any }) => {
    let icon = 'document-text-outline';
    let label = 'Source';
    let bgColor = colors.surfaceContainerHighest;
    let textColor = colors.onSurfaceVariant;

    if (type === 'web_search' || type === 'live_research') {
        icon = 'globe-outline';
        label = 'Live Search';
        bgColor = '#E3F2FD';
        textColor = '#1976D2';
    } else if (type === 'legal_news' || type === 'official_guidance' || type === 'statute') {
        icon = 'newspaper-outline';
        label = 'Legal Pulse';
        bgColor = '#FFF3E0';
        textColor = '#E65100';
    } else if (type === 'constitution') {
        icon = 'shield-checkmark-outline';
        label = 'Constitution';
        bgColor = '#FCE4EC';
        textColor = '#C2185B';
    }

    return (
        <View style={[styles.badge, { backgroundColor: bgColor }]}>
            <Ionicons name={icon as any} size={10} color={textColor} />
            <Text style={[styles.badgeText, { color: textColor }]}>{label}</Text>
        </View>
    );
};

const CollapsibleInfo = ({ sources, disclaimer, isUser, colors }: any) => {
    const [expanded, setExpanded] = React.useState(false);

    if (!sources?.length && !disclaimer) return null;

    return (
        <View style={styles.infoWrapper}>
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setExpanded(!expanded)}
                style={[
                    styles.collapseHeader,
                    { backgroundColor: isUser ? 'rgba(255,255,255,0.15)' : colors.surfaceContainerLow },
                ]}
            >
                <View style={styles.headerTitleRow}>
                    <Ionicons
                        name={expanded ? 'chevron-up' : 'book-outline'}
                        size={14}
                        color={isUser ? colors.onPrimary : colors.primary}
                    />
                    <Text style={[styles.collapseHeaderText, { 
                        color: isUser ? colors.onPrimary : colors.onSurfaceVariant,
                        fontFamily: theme.typography.fontFamily.bodyMedium 
                    }]}>
                        {expanded ? 'Hide Details' : `View Citations & Sources (${sources?.length || 0})`}
                    </Text>
                </View>
                {!expanded && sources?.some((s: any) => s.source_type === 'web_search' || s.source_type === 'live_research') && (
                    <View style={styles.liveIndicator}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>LIVE</Text>
                    </View>
                )}
            </TouchableOpacity>

            {expanded && (
                <View style={[styles.collapseContent, { 
                    backgroundColor: isUser ? 'rgba(255,255,255,0.08)' : colors.surfaceContainerHigh
                }]}>
                    {sources && sources.length > 0 && (
                        <View style={styles.sourcesSection}>
                            {sources.map((source: any, idx: number) => (
                                <View key={idx} style={styles.sourceItem}>
                                    <View style={styles.sourceHeader}>
                                        <SourceBadge type={source.source_type || 'source'} colors={colors} />
                                        {source.source_url && (
                                            <TouchableOpacity onPress={() => {/* Handle URL open */}}>
                                                <Ionicons name="open-outline" size={12} color={colors.primary} />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    <Text
                                        selectable
                                        style={[styles.sourceTitle, { 
                                            color: isUser ? colors.onPrimary : colors.onSurface,
                                            fontFamily: theme.typography.fontFamily.bodyBold
                                        }]}
                                    >
                                        {typeof source === 'string' ? source : source.title}
                                    </Text>
                                    {source.excerpt && (
                                        <Text style={[styles.sourceExcerpt, { 
                                            color: isUser ? colors.onPrimary + 'CC' : colors.onSurfaceVariant,
                                            fontFamily: theme.typography.fontFamily.body
                                        }]}>
                                            {source.excerpt}
                                        </Text>
                                    )}
                                </View>
                            ))}
                        </View>
                    )}

                    {!!disclaimer && (
                        <View style={[styles.disclaimerSection, { borderTopWidth: 0 }]}>
                            <View style={styles.disclaimerIconBox}>
                                <Ionicons
                                    name="information-circle"
                                    size={16}
                                    color={isUser ? colors.onPrimary : colors.secondary}
                                />
                            </View>
                            <Text
                                selectable
                                style={[styles.disclaimerText, { 
                                    color: isUser ? colors.onPrimary : colors.onSurfaceVariant,
                                    fontFamily: theme.typography.fontFamily.body
                                }]}
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
            setSkipAnimation(true);
        }
    };

    const handleLongPress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Clipboard.setString(message.content);
        Alert.alert('Copied', 'Message copied to clipboard.');
    };

    return (
        <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
            {!isUser && (
                <View style={[styles.avatar, { backgroundColor: colors.surfaceContainerHighest }]}>
                    <Ionicons name="shield-checkmark" size={14} color={colors.primary} />
                </View>
            )}

            <TouchableOpacity
                activeOpacity={0.9}
                onPress={handlePress}
                onLongPress={handleLongPress}
                style={[
                    styles.bubble,
                    isUser ? styles.userBubble : styles.assistantBubble,
                    {
                        backgroundColor: isUser ? colors.primary : colors.surfaceContainerHigh,
                    },
                ]}
            >
                {isUser ? (
                    <Text
                        selectable
                        style={[styles.content, { 
                            color: colors.onPrimary,
                            fontFamily: theme.typography.fontFamily.body,
                            fontSize: 16,
                            lineHeight: 24,
                        }]}
                    >
                        {message.content}
                    </Text>
                ) : (
                    <Markdown
                        style={{
                            body: {
                                color: colors.onSurface,
                                fontSize: 16,
                                lineHeight: 24,
                                fontFamily: theme.typography.fontFamily.body,
                            },
                            heading1: { 
                                color: colors.primary, 
                                fontSize: 24, 
                                fontFamily: theme.typography.fontFamily.headline,
                                marginVertical: 12,
                                letterSpacing: -0.48,
                            },
                            heading2: { 
                                color: colors.primary, 
                                fontSize: 20, 
                                fontFamily: theme.typography.fontFamily.headline,
                                marginVertical: 10,
                                letterSpacing: -0.4,
                            },
                            strong: { 
                                fontFamily: theme.typography.fontFamily.bodyBold,
                                color: colors.onSurface,
                            },
                            em: { fontStyle: 'italic' },
                            link: { color: colors.primary, textDecorationLine: 'underline' },
                            paragraph: { marginVertical: 4 },
                            code_inline: {
                                backgroundColor: colors.surfaceContainerHighest,
                                color: colors.primary,
                                borderRadius: 4,
                                paddingHorizontal: 6,
                                fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
                            },
                        }}
                    >
                        {message.content}
                    </Markdown>
                )}

                {!isUser && ((message.sources?.length ?? 0) > 0 || !!message.legal_disclaimer) && (
                    <CollapsibleInfo
                        sources={message.sources}
                        disclaimer={message.legal_disclaimer}
                        isUser={isUser}
                        colors={colors}
                    />
                )}

                <View style={styles.copyHint}>
                    <Ionicons
                        name="copy-outline"
                        size={10}
                        color={isUser ? colors.onPrimary + '60' : colors.onSurfaceVariant}
                    />
                </View>
            </TouchableOpacity>

            {isUser && (
                <View style={[styles.avatar, { backgroundColor: colors.surfaceContainerHighest }]}>
                    <Ionicons name="person" size={14} color={colors.secondary} />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 12,
        alignItems: 'flex-end',
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
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    bubble: {
        maxWidth: '82%',
        borderRadius: 20,
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    userBubble: {
        borderBottomRightRadius: 4,
    },
    assistantBubble: {
        borderBottomLeftRadius: 4,
    },
    content: {
        letterSpacing: 0.1,
    },
    copyHint: {
        alignSelf: 'flex-end',
        marginTop: 6,
        opacity: 0.4,
    },
    infoWrapper: {
        marginTop: 12,
        width: '100%',
    },
    collapseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 16,
        gap: 8,
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    collapseHeaderText: {
        fontSize: 12,
        letterSpacing: 0.2,
    },
    collapseContent: {
        marginTop: 8,
        padding: 16,
        borderRadius: 20,
        gap: 16,
    },
    sourcesSection: {
        gap: 14,
    },
    sourceItem: {
        gap: 4,
    },
    sourceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    sourceTitle: {
        fontSize: 13,
        lineHeight: 18,
    },
    sourceExcerpt: {
        fontSize: 12,
        lineHeight: 18,
        opacity: 0.9,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        gap: 4,
    },
    badgeText: {
        fontSize: 9,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    liveIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(201, 0, 0, 0.1)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        gap: 4,
    },
    liveDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#C90000',
    },
    liveText: {
        fontSize: 9,
        color: '#C90000',
        fontWeight: '800',
    },
    disclaimerSection: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 4,
        alignItems: 'flex-start',
        paddingTop: 8,
    },
    disclaimerIconBox: {
        marginTop: 2,
    },
    disclaimerText: {
        fontSize: 11,
        fontStyle: 'italic',
        flex: 1,
        lineHeight: 17,
        opacity: 0.75,
    },
});
