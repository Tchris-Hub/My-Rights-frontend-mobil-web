import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const repoRoot = path.resolve(root, '..');
const failures = [];
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const required = [
  '../docs/PHASE-13-E2E-MATRIX.md',
  'maestro/README.md',
  'maestro/flows/01-auth-validation.yaml',
  'maestro/flows/02-guest-chat-shell.yaml',
  'scripts/e2e-contract.mjs',
];

for (const file of required) {
  const resolved = path.resolve(root, file);
  if (!fs.existsSync(resolved)) failures.push(`Missing release-gate artifact: ${file}`);
}

const appConfig = read('app.config.ts');
if (!appConfig.includes("package: 'com.myrights.app'")) {
  failures.push('Android application package must remain com.myrights.app.');
}
if (!appConfig.includes("softwareKeyboardLayoutMode: 'resize'")) {
  failures.push('Android software keyboard layout mode must remain resize.');
}

const phase12Contracts = [
  ['src/components/common/ErrorBoundary.tsx', 'export class ErrorBoundary'],
  ['src/utils/logger.ts', 'const SENSITIVE_KEYS'],
  ['src/components/common/BackgroundJobOverlay.tsx', 'useSafeAreaInsets'],
  ['src/components/common/FloatingChatButton.tsx', 'Keyboard'],
  ['src/navigation/GlassmorphicTabBar.tsx', 'Keyboard'],
  ['src/screens/main/ChatScreen.tsx', 'keyboardShouldPersistTaps'],
];

for (const [file, marker] of phase12Contracts) {
  if (!fs.existsSync(path.join(root, file))) {
    failures.push(`Missing Phase 12 hardening file: ${file}`);
  } else if (!read(file).includes(marker)) {
    failures.push(`Phase 12 hardening contract missing from ${file}: ${marker}`);
  }
}

const packageJson = JSON.parse(read('package.json'));
for (const script of ['typecheck', 'verify:release', 'test:e2e-contract']) {
  if (typeof packageJson.scripts?.[script] !== 'string') {
    failures.push(`Missing release verification script: ${script}`);
  }
}

if (failures.length) {
  console.error('Release gate contract failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Release gate contract passed.');
