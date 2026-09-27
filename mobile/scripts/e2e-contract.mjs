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
  'maestro/flows/03-constitution.yaml',
  'maestro/flows/04-constitution-navigation.yaml',
  'maestro/flows/05-legal-aid.yaml',
  'maestro/flows/06-privacy.yaml',
  'maestro/flows/07-legal-aid-experts.yaml',
  'maestro/flows/08-document-review.yaml',
  'maestro/flows/09-document-generator.yaml',
  'maestro/flows/10-professional-enquiry.yaml',
  'maestro/flows/11-saved-rights.yaml',
  'maestro/flows/12-document-review-keyboard.yaml',
  'maestro/flows/13-navigation-accessibility.yaml',
  'maestro/flows/14-state-coverage.yaml',
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
requireText('src/screens/auth/ConsentScreen.tsx', 'testID="consent-checkbox"');
requireText('src/screens/auth/ConsentScreen.tsx', 'testID="consent-accept"');
requireText('src/screens/auth/ConsentScreen.tsx', 'testID="consent-error"');
requireText('src/screens/main/ChatScreen.tsx', 'testID="chat-input"');
requireText('src/screens/main/ChatScreen.tsx', 'testID="chat-send"');
requireText('src/screens/main/ChatScreen.tsx', 'testID="chat-empty-state"');
requireText('src/screens/main/ChatScreen.tsx', 'testID="chat-loading-state"');
requireText('src/screens/main/ChatScreen.tsx', 'testID="chat-attachment"');
requireText('src/screens/main/ChatScreen.tsx', 'testID="chat-attachment-state"');
requireText('src/screens/main/ConstitutionExplorerScreen.tsx', 'testID="constitution-search"');
requireText('src/screens/main/ConstitutionExplorerScreen.tsx', 'testID="constitution-save-citation"');
requireText('src/screens/main/ProfessionalEnquiryScreen.tsx', 'testID="enquiry-message"');
requireText('src/screens/main/ProfessionalEnquiryScreen.tsx', 'testID="enquiry-submit"');
requireText('src/screens/profile/SavedRightsScreen.tsx', 'testID="saved-rights-list"');
requireText('src/screens/profile/PrivacyCenterScreen.tsx', 'testID="privacy-export"');
requireText('src/screens/profile/PrivacyCenterScreen.tsx', 'testID="privacy-delete"');
requireText('src/screens/main/LegalAidMapScreen.tsx', 'testID="legal-aid-centers"');
requireText('src/screens/main/LegalAidMapScreen.tsx', 'testID="legal-aid-experts"');
requireText('src/screens/main/LegalAidMapScreen.tsx', 'testID="legal-aid-firms"');
requireText('src/screens/main/LegalAidMapScreen.tsx', 'testID="legal-aid-send-enquiry"');
requireText('src/screens/main/LegalAidMapScreen.tsx', 'testID="legal-aid-loading"');
requireText('src/screens/main/LegalAidMapScreen.tsx', 'testID="legal-aid-empty"');

requireText('src/screens/main/DocumentReviewScreen.tsx', 'testID="document-review-upload"');
requireText('src/screens/main/DocumentReviewScreen.tsx', 'testID="document-review-text"');
requireText('src/screens/main/DocumentReviewScreen.tsx', 'testID="document-review-submit"');
requireText('src/screens/main/DocumentReviewScreen.tsx', 'testID="document-review-loading"');
requireText('src/screens/main/DocumentReviewScreen.tsx', 'testID="document-review-result"');
requireText('src/screens/main/DocumentGeneratorScreen.tsx', 'testID="document-generator-continue"');
requireText('src/screens/main/DocumentGeneratorScreen.tsx', 'testID="document-generator-consult-input"');
requireText('src/screens/main/DocumentGeneratorScreen.tsx', 'testID="document-generator-build"');
requireText('src/screens/main/DocumentGeneratorScreen.tsx', 'testID="document-generator-loading"');
requireText('src/screens/main/DocumentGeneratorScreen.tsx', 'testID="document-generator-consult-loading"');
requireText('src/screens/main/DocumentGeneratorScreen.tsx', 'testID="document-generator-build-loading"');
requireText('src/screens/main/DocumentGeneratorScreen.tsx', 'testID="document-generator-result"');
requireText('src/screens/profile/EditProfileScreen.tsx', 'testID="profile-save"');
requireText('src/screens/profile/SupportCenterScreen.tsx', 'testID="support-submit"');
requireText('src/screens/profile/SupportCenterScreen.tsx', 'testID="support-message"');
requireText('src/screens/profile/ProfileHomeScreen.tsx', 'testID="profile-logout"');
requireText('src/screens/profile/PrivacyCenterScreen.tsx', 'testID="privacy-loading"');
requireText('src/screens/profile/PrivacyCenterScreen.tsx', 'testID="privacy-empty-consents"');
requireText('src/screens/profile/PrivacyCenterScreen.tsx', 'testID="privacy-request-history"');
requireText('src/screens/profile/SavedRightsScreen.tsx', 'testID="saved-rights-loading"');
requireText('src/screens/profile/SavedRightsScreen.tsx', 'testID="saved-rights-empty"');
requireText('src/navigation/GlassmorphicTabBar.tsx', 'testID={`tab-${route.name.toLowerCase()}`}');
requireText('src/components/common/BackgroundJobOverlay.tsx', 'testID="background-job-overlay"');
requireText('src/components/common/BackgroundJobOverlay.tsx', 'testID="background-job-dismiss"');
requireText('src/components/common/FloatingChatButton.tsx', 'testID="floating-chat"');
requireText('src/screens/main/ToolsHomeScreen.tsx', 'testID={`tool-${tool.id}`}');

if (failures.length) {
  console.error('E2E contract check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('E2E contract checks passed.');
