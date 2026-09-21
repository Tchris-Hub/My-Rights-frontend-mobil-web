import { useState, useCallback, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { logger } from '../utils/logger';

export const useVoiceInput = (onTranscription: (text: string) => void) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    // Use ref so callbacks always see the latest recording instance
    const recordingRef = useRef<Audio.Recording | null>(null);
    // Keep a stable reference to the latest onTranscription callback
    const onTranscriptionRef = useRef(onTranscription);
    onTranscriptionRef.current = onTranscription;

    // Clean up recording on unmount
    useEffect(() => {
        return () => {
            if (recordingRef.current) {
                recordingRef.current.stopAndUnloadAsync();
            }
        };
    }, []);

    const startRecording = useCallback(async () => {
        try {
            const permission = await Audio.requestPermissionsAsync();
            if (permission.status !== 'granted') {
                Alert.alert('Permission Denied', 'Please enable microphone access to use voice-to-text.');
                return;
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            recordingRef.current = recording;
            setIsRecording(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (err) {
            logger.error('Failed to start recording', err);
            Alert.alert('Error', 'Could not start recording. Please try again.');
        }
    }, []);

    const stopRecording = useCallback(async () => {
        const currentRecording = recordingRef.current;
        if (!currentRecording) return;

        setIsRecording(false);
        setIsTranscribing(true);

        try {
            await currentRecording.stopAndUnloadAsync();
            const uri = currentRecording.getURI();
            recordingRef.current = null;

            if (uri) {
                try {
                    // Server-side voice transcription is not currently implemented.
                    // Do not invent a transcription result or call a nonexistent API.
                    Alert.alert('Voice-to-text unavailable', 'Voice recording is available, but transcription is not currently supported. Please type your question instead.');
                } finally {
                    // Always clean up the temp file after use
                    // NOTE: expo-file-system SDK 54+ moved legacy functions to /legacy path
                    try {
                        const { deleteAsync } = await import('expo-file-system/legacy');
                        await deleteAsync(uri, { idempotent: true });
                    } catch {
                        // Safe to ignore cleanup failures
                    }
                }
            }
        } catch (err) {
            logger.error('Failed to transcribe', err);
            Alert.alert('Transcription Failed', 'Could not process your voice. Please try typing.');
        } finally {
            setIsTranscribing(false);
        }
    }, []);

    const toggleRecording = useCallback(() => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    }, [isRecording, startRecording, stopRecording]);

    return {
        isRecording,
        isTranscribing,
        toggleRecording
    };
};
