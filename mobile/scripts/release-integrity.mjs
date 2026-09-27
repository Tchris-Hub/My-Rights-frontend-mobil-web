import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const failures = [];

const fail = (message) => failures.push(message);

if (existsSync(join(root, '.env'))) fail('mobile/.env must not exist in a release checkout.');
if (!existsSync(join(root, '.env.example'))) fail('mobile/.env.example is required.');
if (existsSync(join(root, 'app.json'))) fail('Duplicate mobile/app.json configuration detected; app.config.ts is canonical.');
if (existsSync(join(root, 'src/services/supabaseClient.ts'))) fail('Legacy src/services/supabaseClient.ts must not exist.');

const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const lockJson = JSON.parse(readFileSync(join(root, 'package-lock.json'), 'utf8'));

for (const script of ['start', 'typecheck', 'doctor', 'verify:release']) {
  if (typeof packageJson.scripts?.[script] !== 'string') fail(`Required npm script missing: ${script}`);
}

const canonicalize = (value) => {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, entry]) => [key, canonicalize(entry)]));
  }
  return value;
};

if (lockJson.packages?.['']?.dependencies && JSON.stringify(canonicalize(lockJson.packages[''].dependencies)) !== JSON.stringify(canonicalize(packageJson.dependencies))) {
  fail('package-lock.json root dependencies do not match package.json.');
}

if (lockJson.packages?.['']?.devDependencies && JSON.stringify(canonicalize(lockJson.packages[''].devDependencies)) !== JSON.stringify(canonicalize(packageJson.devDependencies))) {
  fail('package-lock.json root devDependencies do not match package.json.');
}

const appConfig = readFileSync(join(root, 'app.config.ts'), 'utf8');
if (!appConfig.includes("slug: 'my-rights'")) fail('Canonical Expo config is missing the expected app slug.');
if (!appConfig.includes("projectId: '4cd8d457-fde8-43c2-bab7-b8a31df28fd4'")) fail('Canonical EAS project ID is missing.');
if (appConfig.includes('railway.app') || appConfig.includes('EXPO_PUBLIC_API_URL')) fail('Legacy backend configuration remains in app.config.ts.');

const envExample = readFileSync(join(root, '.env.example'), 'utf8');
if (!envExample.includes('EXPO_PUBLIC_API_BASE_URL=')) {
  fail('.env.example must document the public backend origin as EXPO_PUBLIC_API_BASE_URL.');
}
if (/SUPABASE|SERVICE_ROLE|OPENROUTER_API_KEY|SECRET|PRIVATE_KEY|ANON_KEY/.test(envExample)) {
  fail('.env.example contains a legacy provider name or server-secret key name.');
}

const eas = JSON.parse(readFileSync(join(root, 'eas.json'), 'utf8'));
if (!eas.build?.production?.android?.buildType) fail('Production EAS Android build type is not explicit.');
if (eas.build.production.android.buildType !== 'app-bundle') fail('Production Android release must use app-bundle.');
if (!eas.build?.preview?.android?.buildType) fail('Preview EAS Android build type is not explicit.');

if (failures.length) {
  console.error('Release integrity check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Release integrity checks passed.');
