---
description: How to switch to Native Development Builds for Document Scanner functionality
---
# Workflow: Native Build Transition

This app uses `react-native-document-scanner-plugin`, which requires native code not present in Expo Go.

## 1. Detection
The app automatically falls back to the standard camera in Expo Go. You will see: 
"Using standard camera mode for compatibility."

## 2. When to Switch
Switch to a **Development Build** when you need to test or deploy:
- Professional edge detection
- Perspective correction
- High-level computer vision features

## 3. Switching Steps
// turbo
1. Install native dependencies: `npx expo install react-native-document-scanner-plugin`
// turbo
2. Build for Android: `npx expo run:android`
// turbo
3. Build for iOS: `npx expo run:ios` (Requires macOS)

## 4. Maintenance Reminder
Whenever updating native dependencies (`expo-constants`, `react-native-document-scanner-plugin`), **ALWAYS** rebuild the native binaries using the commands above.
