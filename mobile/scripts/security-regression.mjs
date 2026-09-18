import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));

const checks = [
    ['release .env is absent', !exists('.env')],
    ['legacy Supabase client is absent', !exists('src/services/supabaseClient.ts')],
    ['legacy API client is absent', !exists('src/services/api.ts')],
    ['Supabase client uses SecureStore', read('src/services/supabase.ts').includes("from 'expo-secure-store'")],
    ['Supabase client does not import AsyncStorage', !read('src/services/supabase.ts').includes('AsyncStorage')],
    ['Supabase client rejects missing public config', read('src/services/supabase.ts').includes('Supabase configuration is missing')],
    ['gateway requires JWT verification in config', read('../supabase/config.toml').includes('[functions.legal-advisor]') && read('../supabase/config.toml').includes('verify_jwt = true')],
    ['gateway has no wildcard CORS', !read('../supabase/functions/legal-advisor/index.ts').includes("'Access-Control-Allow-Origin': '*'")],
    ['gateway accepts only user messages', read('../supabase/functions/legal-advisor/index.ts').includes('Only user messages are accepted from the client.')],
    ['gateway does not synthesize stream completion on size overflow', !read('../supabase/functions/legal-advisor/index.ts').includes("controller.enqueue(new TextEncoder().encode('data: [DONE]")],
    ['gateway sanitizes unexpected errors', read('../supabase/functions/legal-advisor/index.ts').includes("Request could not be completed safely.")],
    ['chat history DB failures fail closed', read('src/services/chat.service.ts').includes("Unable to load conversation history.")],
    ['chat stream requires explicit completion', read('src/services/chat.service.ts').includes("AI stream ended before a complete response was received.")],
    ['document extraction does not return a fake placeholder', !read('src/services/document.service.ts').includes('Feature coming soon: OCR integration')],
    ['document authenticity does not fabricate Unknown result', !read('src/services/document.service.ts').includes('Visual verification is not currently available.')],
    ['escalation table has RLS', read('../supabase/migrations/20260918000400_legal_escalation_requests.sql').includes('enable row level security')],
    ['escalation table requires authenticated ownership', read('../supabase/migrations/20260918000400_legal_escalation_requests.sql').includes('user_id = auth.uid()')],
    ['logger redacts legal content', read('src/utils/logger.ts').includes("'documentText'") && read('src/utils/logger.ts').includes("'content'")],
    ['removed HTTP client dependency', !JSON.parse(read('package.json')).dependencies.axios],
    ['removed unused web-browser dependency', !JSON.parse(read('package.json')).dependencies['expo-web-browser']],
];

const failures = checks.filter(([, ok]) => !ok);
for (const [name, ok] of checks) {
    console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
}

if (failures.length) {
    process.exitCode = 1;
}
