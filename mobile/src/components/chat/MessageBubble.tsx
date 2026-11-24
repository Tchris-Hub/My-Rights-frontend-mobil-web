/**
 * Message bubble.
 * - Your message: right-aligned indigo bubble.
 * - Answer: a full-width card in a reading serif, with a "receipts" block listing the sources it relied on,
 *   whether each was checked, and a plain warning when nothing backs the answer.
 */
import React, { useState } from 'react';
import { Alert, Clipboard, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import type { ChatMessage, SourceCitation } from '../../types';

interface MessageBubbleProps {
    message: ChatMessage;
}

const LIVE_TYPES = ['web_search', 'live_research', 'live_official', 'live_authoritative'];

const kindLabel = (type?: string) => {
    if (!type) return 'Source';
    if (type === 'constitution') return 'Constitution';
    if (type === 'statute') return 'Statute';
    if (type === 'official_guidance' || type === 'legal_news') return 'Official guidance';
    if (LIVE_TYPES.includes(type)) return 'Web';
    return 'Source';
};

const formatDate = (iso?: string) => {
    if (!iso) return null;
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const Receipt: React.FC<{ source: SourceCitation }> = ({ source }) => {
    const { colors } = useTheme();
    const [open, setOpen] = useState(false);
    const checked = formatDate(source.verified_at);
    const heading = source.citation || [source.title, source.section].filter(Boolean).join(', ');

    return (
        <View style={[styles.receipt, { borderTopColor: colors.line }]}>
            <Pressable accessibilityRole="button" onPress={() => setOpen((v) => !v)} style={styles.receiptHead}>
                <View style={styles.receiptText}>
                    <Text style={[styles.receiptTitle, { color: colors.onSurface }]} selectable>{heading}</Text>
                    <Text style={[styles.receiptMeta, { color: colors.onSurfaceVariant }]}>
                        {kindLabel(source.source_type)}
                        {source.issuing_authority ? `, ${source.issuing_authority}` : ''}
                    </Text>
                </View>
                <View style={[styles.stamp, { backgroundColor: checked ? colors.verifiedContainer : colors.tertiaryContainer }]}>
                    <Ionicons name={checked ? 'checkmark-circle' : 'help-circle'} size={13} color={checked ? colors.verified : colors.onTertiaryContainer} />
                    <Text style={[styles.stampText, { color: checked ? colors.verified : colors.onTertiaryContainer }]}>{checked ? `Checked ${checked}` : 'Not yet checked'}</Text>
                </View>
            </Pressable>
            {open ? (
                <View style={styles.receiptBody}>
                    {source.excerpt ? (
                        <Text style={[styles.excerpt, { color: colors.onSurface, borderLeftColor: colors.danfo }]} selectable>{source.excerpt}</Text>
                    ) : (
                        <Text style={[styles.receiptMeta, { color: colors.onSurfaceVariant }]}>No excerpt available for this source.</Text>
                    )}
                    {source.source_url ? (
                        <Pressable
                            accessibilityRole="link"
                            onPress={() => {
                                if (typeof source.source_url === 'string') {
                                    Linking.openURL(source.source_url).catch(() => Alert.alert('Could not open the link', 'Try again, or copy the source name and search for it.'));
                                }
                            }}
                            style={styles.openLink}
                        >
                            <Text style={[styles.openLinkText, { color: colors.primary }]}>Open the source</Text>
                            <Ionicons name="open-outline" size={14} color={colors.primary} />
                        </Pressable>
                    ) : null}
                </View>
            ) : null}
        </View>
    );
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    const { colors } = useTheme();
    const isUser = message.role === 'user';

    const copy = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Clipboard.setString(message.content);
        Alert.alert('Copied', 'The message is on your clipboard.');
    };

    if (isUser) {
        return (
            <View style={styles.userRow}>
                <Pressable onLongPress={copy} style={[styles.userBubble, { backgroundColor: colors.primary }]}>
                    <Text selectable style={[styles.userText, { color: colors.onPrimary }]}>{message.content}</Text>
                </Pressable>
            </View>
        );
    }

    const sources = (message.sources ?? []) as SourceCitation[];
    const hasSources = sources.length > 0;
    const grounded = !!message.isVerified && hasSources;

    if (message.error) {
        return (
            <View style={[styles.card, { backgroundColor: colors.errorContainer, borderColor: colors.error }]}>
                <Text style={[styles.errorTitle, { color: colors.onErrorContainer }]}>That did not go through</Text>
                <Text style={[styles.errorBody, { color: colors.onErrorContainer }]}>{message.content}</Text>
            </View>
        );
    }

    return (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.line }]}>
            <View style={[styles.status, { backgroundColor: grounded ? colors.verifiedContainer : colors.tertiaryContainer }]}>
                <Ionicons name={grounded ? 'checkmark-circle' : 'alert-circle'} size={16} color={grounded ? colors.verified : colors.onTertiaryContainer} />
                <Text style={[styles.statusText, { color: grounded ? colors.verified : colors.onTertiaryContainer }]}>
                    {grounded
                        ? 'Based on the sources below'
                        : hasSources
                            ? 'Sources found, but not yet checked'
                            : 'No source found. Treat this with care.'}
                </Text>
            </View>

            <Pressable onLongPress={copy} style={styles.answer}>
                <Markdown
                    style={{
                        body: { ...theme.typography.reading, color: colors.onSurface },
                        heading1: { color: colors.onSurface, fontFamily: theme.typography.fontFamily.headline, fontSize: 22, marginVertical: 10 },
                        heading2: { color: colors.onSurface, fontFamily: theme.typography.fontFamily.headline, fontSize: 19, marginVertical: 8 },
                        heading3: { color: colors.onSurface, fontFamily: theme.typography.fontFamily.headlineMedium, fontSize: 17, marginVertical: 6 },
                        strong: { fontFamily: theme.typography.fontFamily.readingBold, color: colors.onSurface },
                        em: { fontStyle: 'italic' },
                        link: { color: colors.primary, textDecorationLine: 'underline' },
                        paragraph: { marginVertical: 5 },
                        bullet_list: { marginVertical: 4 },
                        ordered_list: { marginVertical: 4 },
                        blockquote: { borderLeftColor: colors.danfo, borderLeftWidth: 3, backgroundColor: colors.surfaceContainer, paddingHorizontal: 10, marginVertical: 6 },
                        code_inline: {
                            backgroundColor: colors.surfaceContainer,
                            color: colors.primary,
                            borderRadius: 4,
                            paddingHorizontal: 5,
                            fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
                        },
                    }}
                >
                    {message.content}
                </Markdown>
            </Pressable>

            {hasSources ? (
                <View style={styles.receipts}>
                    <Text style={[styles.receiptsTitle, { color: colors.onSurface }]}>Sources</Text>
                    {sources.map((s, i) => (
                        <Receipt key={s.id ?? i} source={s} />
                    ))}
                </View>
            ) : null}

            {message.legal_disclaimer ? (
                <Text style={[styles.disclaimer, { color: colors.onSurfaceVariant }]} selectable>
                    {message.legal_disclaimer.replace(/⚠️/g, '').trim()}
                </Text>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    userRow: { alignItems: 'flex-end' },
    userBubble: { maxWidth: '84%', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 18, borderBottomRightRadius: 4 },
    userText: { fontFamily: theme.typography.fontFamily.body, fontSize: 16, lineHeight: 23 },
    card: { borderWidth: 1, borderRadius: theme.borderRadius.lg, overflow: 'hidden' },
    status: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 9 },
    statusText: { ...theme.typography.labelSm, fontFamily: theme.typography.fontFamily.headlineMedium, flex: 1 },
    answer: { paddingHorizontal: 14, paddingVertical: 8 },
    receipts: { paddingHorizontal: 14, paddingBottom: 6 },
    receiptsTitle: { ...theme.typography.labelMd, fontFamily: theme.typography.fontFamily.headline, marginBottom: 2 },
    receipt: { borderTopWidth: 1, paddingVertical: 10 },
    receiptHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    receiptText: { flex: 1 },
    receiptTitle: { ...theme.typography.labelMd, fontFamily: theme.typography.fontFamily.headlineMedium },
    receiptMeta: { ...theme.typography.caption, marginTop: 2 },
    stamp: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, flexShrink: 1 },
    stampText: { fontFamily: theme.typography.fontFamily.headlineMedium, fontSize: 11.5 },
    receiptBody: { marginTop: 8, gap: 8 },
    excerpt: { ...theme.typography.readingSm, borderLeftWidth: 3, paddingLeft: 10 },
    openLink: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 4 },
    openLinkText: { ...theme.typography.labelMd, fontFamily: theme.typography.fontFamily.headlineMedium },
    disclaimer: { ...theme.typography.caption, paddingHorizontal: 14, paddingBottom: 12, paddingTop: 4 },
    errorTitle: { ...theme.typography.titleMd, padding: 14, paddingBottom: 2 },
    errorBody: { ...theme.typography.bodyMd, padding: 14, paddingTop: 2, color: undefined },
});
