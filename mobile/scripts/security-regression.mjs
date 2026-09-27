import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));

const packageJson = JSON.parse(read('package.json'));
const envExample = read('.env.example');
const api = read('src/services/api.ts');
const authClient = read('src/services/auth-client.ts');
const authService = read('src/services/auth.service.ts');
const logger = read('src/utils/logger.ts');

const checks = [
    ['release .env is absent', !exists('.env')],
    ['legacy Supabase client is absent', !exists('src/services/supabaseClient.ts')],
    ['legacy API service path is absent', !exists('src/services/legacy-api.ts')],
    ['public API configuration uses the canonical variable', envExample.includes('EXPO_PUBLIC_API_BASE_URL=')],
    ['env example contains no server secret names', !/SERVICE_ROLE|OPENROUTER_API_KEY|PRIVATE_KEY|SECRET_KEY/.test(envExample)],
    ['API requests use the canonical production base URL fallback', api.includes('https://alpha01-pink.vercel.app')],
    ['API requests omit ambient browser credentials', api.includes("credentials: 'omit'")],
    ['API request headers are sourced from Better Auth', api.includes('authClient.getCookie()')],
    ['authentication client uses Better Auth', authClient.includes("createAuthClient") && authClient.includes("better-auth/react")],
    ['authentication client stores session material in SecureStore', authClient.includes("expo-secure-store") && authClient.includes('storage: SecureStore')],
    ['logout delegates to Better Auth sign-out', authService.includes('authClient.signOut()')],
    ['logger redacts authentication material', logger.includes("'access_token'") && logger.includes("'refresh_token'") && logger.includes("'Authorization'")],
    ['logger redacts legal/document content', logger.includes("'content'") && logger.includes("'documentText'") && logger.includes("'prompt'")],
    ['production logging is disabled', logger.includes('if (__DEV__)')],
    ['HTTP client dependency is not installed', !packageJson.dependencies?.axios],
];

const failures = checks.filter(([, ok]) => !ok);
for (const [name, ok] of checks) {
    console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
}

if (failures.length) process.exitCode = 1;
