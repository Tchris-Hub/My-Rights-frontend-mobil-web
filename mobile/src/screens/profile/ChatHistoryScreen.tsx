import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { chatService } from '../../services/chat.service';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { FloatingChatButton } from '../../components/common/FloatingChatButton';

const { width } = Dimensions.get('window');

interface ConversationSummary {
    id: string;
    title: string | null;
    created_at: string;
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
        navigation.navigate('Chat', { conversationId: id });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric' 
        }).toUpperCase();
    };

    const renderItem = ({ item, index }: { item: ConversationSummary; index: number }) => (
        <Animated.View entering={FadeInRight.delay(index * 100).duration(500).springify()}>
            <TouchableOpacity
                style={[styles.card, { backgroundColor: colors.surface }]}
                onPress={() => handleConversationPress(item.id)}
                activeOpacity={0.8}
            >
                <View style={styles.cardTop}>
                    <Text style={[styles.dateText, { color: colors.primary }]}>{formatDate(item.updated_at)}</Text>
                </View>
                <Text style={[styles.cardTitle, { color: colors.onSurface }]} numberOfLines={2}>
                    {item.title || 'Legal Consultation'}
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.surfaceContainerLow }]} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
                </TouchableOpacity>
                <View>
                    <Text style={[styles.headerSubtitle, { color: colors.primary }]}>CASE FILES</Text>
                    <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Vault Archive</Text>
                </View>
            </View>

            {isLoading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : conversations.length === 0 ? (
                <View style={styles.centered}>
                    <View style={[styles.emptyIconBox, { backgroundColor: colors.surface }]}>
                        <Ionicons name="archive-outline" size={48} color={colors.primary} />
                    </View>
                    <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>The Vault is Empty</Text>
                    <Text style={[styles.emptySubtitle, { color: colors.onSurfaceVariant }]}>
                        Your legal history will be documented here once sessions are initiated.
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
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 16,
        gap: 16,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerSubtitle: {
        fontFamily: theme.typography.fontFamily.headline,
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 2,
        marginBottom: 4,
    },
    headerTitle: {
        fontFamily: theme.typography.fontFamily.headline,
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyIconBox: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontFamily: theme.typography.fontFamily.headline,
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 12,
    },
    emptySubtitle: {
        ...theme.typography.bodyMd,
        textAlign: 'center',
        opacity: 0.7,
        lineHeight: 22,
    },
    listContent: {
        padding: 24,
        paddingTop: 16,
        paddingBottom: 100,
        gap: 20,
    },
    card: {
        borderRadius: 28,
        padding: 20,
        paddingBottom: 0,
        overflow: 'hidden',
    },
    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },

    dateText: {
        fontFamily: theme.typography.fontFamily.headline,
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },




    cardTitle: {
        fontFamily: theme.typography.fontFamily.headline,
        fontSize: 22,
        fontWeight: '800',
        lineHeight: 28,
        letterSpacing: -0.4,
        marginBottom: 24,
    },







});
