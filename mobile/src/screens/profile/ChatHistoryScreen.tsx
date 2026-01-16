/**
 * Chat History Screen
 * Displays a list of past conversations fetched from the backend.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { chatService } from '../../services/chat.service';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { FloatingChatButton } from '../../components/common/FloatingChatButton';

interface ConversationSummary {
    id: string;
    title: string | null;
    legal_topic: string | null;
    risk_level: string | null;
    is_escalated: boolean;
    message_count: number;
    created_at: string;
    updated_at: string;
}

const getRiskColor = (level: string | null): string => {
    switch (level) {
        case 'high': return '#EF4444';
        case 'medium': return '#F59E0B';
        case 'low': return '#10B981';
        default: return '#94A3B8';
    }
};

export const ChatHistoryScreen: React.FC = () => {
    const { colors } = useTheme();
    const navigation = useNavigation<any>();
    const [conversations, setConversations] = useState<ConversationSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchHistory = useCallback(async (showFullLoader = true) => {
        if (showFullLoader) setIsLoading(true);
        try {
            const data = await chatService.getChatHistory();
            setConversations(data);
        } catch (error) {
            console.error('Failed to fetch chat history:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchHistory();
        }, [fetchHistory])
    );

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchHistory(false);
    };

    const handleConversationPress = (id: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // Navigate to Chat with conversation context
        navigation.navigate('Chat', { conversationId: id });
    };

    const renderItem = ({ item }: { item: ConversationSummary }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.surfaceElevated1 }]}
            onPress={() => handleConversationPress(item.id)}
            activeOpacity={0.7}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.riskDot, { backgroundColor: getRiskColor(item.risk_level) }]} />
                <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                    {item.title || 'Untitled Conversation'}
                </Text>
                {item.is_escalated && (
                    <View style={[styles.escalatedBadge, { backgroundColor: colors.error + '20' }]}>
                        <Text style={[styles.escalatedText, { color: colors.error }]}>Escalated</Text>
                    </View>
                )}
            </View>
            <View style={styles.cardMeta}>
                <View style={styles.metaItem}>
                    <Ionicons name="chatbubbles-outline" size={14} color={colors.textTertiary} />
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                        {item.message_count} messages
                    </Text>
                </View>
                <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={14} color={colors.textTertiary} />
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                        {new Date(item.updated_at).toLocaleDateString()}
                    </Text>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} style={styles.chevron} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View>
                    <Text style={[styles.title, { color: colors.text }]}>Chat History</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Your past legal consultations
                    </Text>
                </View>
            </View>

            {isLoading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : conversations.length === 0 ? (
                <View style={styles.centered}>
                    <Ionicons name="chatbubbles-outline" size={80} color={colors.textTertiary} />
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>No Conversations Yet</Text>
                    <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                        Start a new chat to see your history here.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={conversations}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
                    }
                />
            )}
            <FloatingChatButton />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        gap: 16,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        ...theme.typography.h3,
    },
    subtitle: {
        ...theme.typography.bodySmall,
    },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        gap: 16,
    },
    emptyTitle: {
        ...theme.typography.h4,
    },
    emptySubtitle: {
        ...theme.typography.bodySmall,
        textAlign: 'center',
    },
    listContent: {
        padding: 24,
        paddingTop: 0,
        paddingBottom: 100,
        gap: 12,
    },
    card: {
        padding: 20,
        borderRadius: 24,
        ...theme.shadows.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    riskDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    cardTitle: {
        ...theme.typography.body,
        fontWeight: '700',
        flex: 1,
    },
    escalatedBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    escalatedText: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    cardMeta: {
        flexDirection: 'row',
        gap: 16,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        ...theme.typography.caption,
    },
    chevron: {
        position: 'absolute',
        right: 20,
        top: '50%',
    },
});
