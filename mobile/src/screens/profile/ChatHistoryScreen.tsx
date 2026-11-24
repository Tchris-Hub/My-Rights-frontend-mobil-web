import React, { useState, useEffect, useCallback } from 'react';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Pressable,
    ActivityIndicator,
    RefreshControl,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { chatService } from '../../services/chat.service';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

interface ConversationSummary {
    id: string;
    title: string | null;
    updated_at: string;
}



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
        navigation.navigate('AskTab', { conversationId: id });
    };

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    const renderItem = ({ item }: { item: ConversationSummary }) => (
        <Pressable
            accessibilityRole="button"
            onPress={() => handleConversationPress(item.id)}
            style={({ pressed }) => [styles.card, { backgroundColor: pressed ? colors.surfaceContainer : colors.card, borderColor: colors.line }]}
        >
            <View style={styles.cardText}>
                <Text style={[styles.cardTitle, { color: colors.onSurface }]} numberOfLines={2}>
                    {item.title || 'Untitled question'}
                </Text>
                <Text style={[styles.dateText, { color: colors.onSurfaceVariant }]}>{formatDate(item.updated_at)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.outline} />
        </Pressable>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
            <ScreenHeader title="Past conversations" />

            {isLoading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : conversations.length === 0 ? (
                <View style={styles.centered}>
                    <View style={[styles.emptyIconBox, { backgroundColor: colors.surface }]}>
                        <Ionicons name="archive-outline" size={48} color={colors.primary} />
                    </View>
                    <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>No conversations yet</Text>
                    <Text style={[styles.emptySubtitle, { color: colors.onSurfaceVariant }]}>
                        Questions you ask while signed in show up here so you can go back to them.
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
    emptyIconBox: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    emptyTitle: { ...theme.typography.titleLg, marginBottom: 8 },
    emptySubtitle: { ...theme.typography.bodyMd, textAlign: 'center' },
    listContent: { padding: 16, paddingBottom: 32, gap: 10 },
    card: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: theme.borderRadius.lg, borderWidth: 1, padding: 14, minHeight: 68 },
    cardText: { flex: 1 },
    cardTitle: { ...theme.typography.titleMd },
    dateText: { ...theme.typography.caption, marginTop: 4 },
});
