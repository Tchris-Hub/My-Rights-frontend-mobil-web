/**
 * Emergency mode: being stopped, searched or arrested. Short steps, big call button,
 * no marketing. Works without an account and without a network (static content).
 */
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Button } from '../../components/ui/Button';
import theme from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { ARREST_PROMPT } from '../../content/situations';

const STEPS: Array<{ title: string; body: string }> = [
    { title: 'Stay calm and do not resist', body: 'Do not run or fight. Keep your hands where the officer can see them.' },
    { title: 'Ask why', body: 'Ask for the reason, the officer’s name and the station they come from.' },
    { title: 'You can stay silent', body: 'You do not have to answer questions until you have spoken to a lawyer or someone you trust. (Constitution, section 35)' },
    { title: 'Get the reason in writing', body: 'You must be told the reason for your arrest in writing within 24 hours, in a language you understand. (Constitution, section 35)' },
    { title: 'Tell someone where you are', body: 'Call a family member or friend. Do not sign a statement you have not read or do not understand.' },
    { title: 'You cannot be held forever', body: 'The police must take you to court within a reasonable time. (Constitution, section 35)' },
];

export const EmergencyScreen: React.FC = () => {
    const { colors } = useTheme();
    const navigation = useNavigation<any>();

    return (
        <View style={[styles.root, { backgroundColor: colors.surface }]}>
            <ScreenHeader title="If you are stopped or arrested" />
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={[styles.danger, { backgroundColor: colors.errorContainer, borderColor: colors.error }]}>
                    <Ionicons name="warning" size={22} color={colors.error} />
                    <Text style={[styles.dangerText, { color: colors.onErrorContainer }]}>
                        If anyone is hurt or in immediate danger, call 112 first.
                    </Text>
                </View>
                <Button title="Call 112" variant="danger" size="large" fullWidth onPress={() => Linking.openURL('tel:112')} testID="emergency-call" icon={<Ionicons name="call" size={20} color="#FFFFFF" />} style={styles.call} />

                <View style={[styles.steps, { backgroundColor: colors.card, borderColor: colors.line }]}>
                    {STEPS.map((s, i) => (
                        <View key={s.title} style={[styles.step, i > 0 && { borderTopWidth: 1, borderTopColor: colors.line }]}>
                            <View style={[styles.num, { backgroundColor: colors.primary }]}>
                                <Text style={styles.numText}>{i + 1}</Text>
                            </View>
                            <View style={styles.stepText}>
                                <Text style={[styles.stepTitle, { color: colors.onSurface }]}>{s.title}</Text>
                                <Text style={[styles.stepBody, { color: colors.onSurfaceVariant }]}>{s.body}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <Button
                    title="Ask My Rights about this"
                    variant="primary"
                    size="large"
                    fullWidth
                    onPress={() => navigation.navigate('AskTab', { initialMessage: ARREST_PROMPT, nonce: Date.now() })}
                    testID="emergency-ask"
                />
                <Button title="Find free legal help near me" variant="outline" size="large" fullWidth onPress={() => navigation.navigate('HelpTab', { screen: 'LegalAidMap' })} style={styles.second} />
                <Text style={[styles.legal, { color: colors.onSurfaceVariant }]}>General information, not legal advice. Source: Constitution of the Federal Republic of Nigeria 1999.</Text>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1 },
    scroll: { padding: 16, paddingBottom: 32 },
    danger: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: theme.borderRadius.md, borderWidth: 1 },
    dangerText: { ...theme.typography.labelMd, flex: 1, color: undefined },
    call: { marginTop: 12 },
    steps: { marginTop: 18, marginBottom: 18, borderRadius: theme.borderRadius.lg, borderWidth: 1, overflow: 'hidden' },
    step: { flexDirection: 'row', gap: 12, padding: 14 },
    num: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
    numText: { fontFamily: theme.typography.fontFamily.headline, color: '#FFFFFF', fontSize: 14 },
    stepText: { flex: 1 },
    stepTitle: { ...theme.typography.titleMd },
    stepBody: { ...theme.typography.bodyMd, marginTop: 2 },
    second: { marginTop: 10 },
    legal: { ...theme.typography.caption, textAlign: 'center', marginTop: 18 },
});
