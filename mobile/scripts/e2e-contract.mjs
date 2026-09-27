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
  'maestro/flows/03-tools-constitution.yaml',
  'maestro/flows/04-document-workflow.yaml',
  'maestro/flows/05-document-review.yaml',
  'maestro/flows/06-legal-discovery.yaml',
  'maestro/flows/07-profile-privacy-support.yaml',
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
requireText('src/screens/main/ConstitutionExplorerScreen.tsx', 'testID="constitution-search"');
requireText('src/screens/main/ConstitutionExplorerScreen.tsx', 'constitution-save-');
requireText('src/screens/main/DocumentGeneratorScreen.tsx', 'document-intake-continue');
requireText('src/screens/main/DocumentGeneratorScreen.tsx', 'document-consult-input');
requireText('src/screens/main/DocumentReviewScreen.tsx', 'testID="document-review-input"');
requireText('src/screens/main/DocumentReviewScreen.tsx', 'testID="document-review-submit"');
requireText('src/screens/main/ProfessionalEnquiryScreen.tsx', 'testID="professional-enquiry-message"');
requireText('src/screens/main/ProfessionalEnquiryScreen.tsx', 'testID="professional-enquiry-submit"');
requireText('src/screens/main/LegalAidMapScreen.tsx', 'testID="legal-discovery-experts"');
requireText('src/screens/main/LegalAidMapScreen.tsx', 'testID="legal-discovery-firms"');
requireText('src/screens/profile/EditProfileScreen.tsx', 'testID="profile-save"');
requireText('src/screens/profile/PrivacyCenterScreen.tsx', 'testID="privacy-request-export"');
requireText('src/screens/profile/SupportCenterScreen.tsx', 'testID="support-submit"');
requireText('src/navigation/GlassmorphicTabBar.tsx', 'testID={`tab-${route.name.toLowerCase()}`}');

if (failures.length) {
  console.error('E2E contract check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('E2E contract checks passed.');
