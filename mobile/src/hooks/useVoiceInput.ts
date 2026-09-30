import { useState, useCallback, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import {
    AudioModule,
    RecordingPresets,
    setAudioModeAsync,
    useAudioRecorder,
} from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { logger } from '../utils/logger';

export const useVoiceInput = (onTranscription: (text: string) => void) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);

    const onTranscriptionRef = useRef(onTranscription);
    onTranscriptionRef.current = onTranscription;

    // useAudioRecorder owns the native recorder lifecycle and disposes it when
    // the component unmounts. Do not call native methods from an effect cleanup:
    // React can run that cleanup after Expo Audio has already released the
    // shared native recorder object.
    const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

    const startRecording = useCallback(async () => {
        try {
            const permission = await AudioModule.requestRecordingPermissionsAsync();
            if (!permission.granted) {
                Alert.alert('Permission Denied', 'Please enable microphone access to use voice-to-text.');
                return;
            }

            await setAudioModeAsync({
                allowsRecording: true,
                playsInSilentMode: true,
            });

            await audioRecorder.prepareToRecordAsync();
            audioRecorder.record();

            setIsRecording(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (err) {
            logger.error('Failed to start recording', err);
            Alert.alert('Error', 'Could not start recording. Please try again.');
        }
    }, [audioRecorder]);

    const stopRecording = useCallback(async () => {
        if (!isRecording) return;

        setIsRecording(false);
        setIsTranscribing(true);

        try {
            await audioRecorder.stop();
            const uri = audioRecorder.uri;

            if (uri) {
                try {
                    Alert.alert(
                        'Voice-to-text unavailable',
                        'Voice recording is available, but transcription is not currently supported. Please type your question instead.'
                    );
                } finally {
                    try {
                        const { deleteAsync } = await import('expo-file-system/legacy');
                        await deleteAsync(uri, { idempotent: true });
                    } catch {
                        // Safe to ignore cleanup failures.
                    }
                }
            }
        } catch (err) {
            logger.error('Failed to transcribe', err);
            Alert.alert('Transcription Failed', 'Could not process your voice. Please try typing.');
        } finally {
            setIsTranscribing(false);
        }
    }, [audioRecorder, isRecording]);

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
        toggleRecording,
    };
};
