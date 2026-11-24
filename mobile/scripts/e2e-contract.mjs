import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];

const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));
const requireText = (relativePath, text) => {
  if (!read(relativePath).includes(text)) {
    failures.push(`${relativePath} is missing E2E contract: ${text}`);
  }
};

const requiredFlows = [
  'maestro/flows/01-auth-validation.yaml',
  'maestro/flows/02-guest-chat-shell.yaml',
];

for (const flow of requiredFlows) {
  if (!exists(flow)) failures.push(`Missing E2E flow: ${flow}`);
}

requireText('src/screens/auth/OnboardingScreen.tsx', 'testID="onboarding-skip"');
requireText('src/screens/auth/OnboardingScreen.tsx', 'testID="onboarding-primary"');
requireText('src/screens/auth/LoginScreen.tsx', 'testID="auth-email"');
requireText('src/screens/auth/LoginScreen.tsx', 'testID="auth-magic-link"');
requireText('src/screens/auth/LoginScreen.tsx', 'testID="auth-google"');
requireText('src/screens/auth/LoginScreen.tsx', 'testID="auth-guest"');
requireText('src/screens/main/ChatScreen.tsx', 'testID="chat-input"');
requireText('src/screens/main/ChatScreen.tsx', 'testID="chat-send"');
requireText('src/screens/main/ChatScreen.tsx', 'chatService.sendMessage');
requireText('src/services/chat.service.ts', "'/api/ai/chat'");
requireText('src/services/chat.service.ts', 'validateChatResponse(response)');

const chatScreen = read('src/screens/main/ChatScreen.tsx');
const chatService = read('src/services/chat.service.ts');
const apiService = read('src/services/api.ts');
for (const [label, source] of [
  ['ChatScreen', chatScreen],
  ['chat.service', chatService],
  ['api.ts', apiService],
]) {
  if (source.includes('streamMessage') || source.includes('streamApiRequest') || source.includes('/api/ai/chat/stream')) {
    failures.push(`Legacy chat streaming transport remains in ${label}.`);
  }
}


if (failures.length) {
  console.error('E2E contract check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('E2E contract checks passed.');
