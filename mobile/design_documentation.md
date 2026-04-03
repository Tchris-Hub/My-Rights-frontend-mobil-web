# My Rights: Comprehensive Design Documentation
*Single Source of Truth for the "Stitch" Redesign*

---

## 1. Project Overview
**My Rights** is a specialized legal empowerment mobile application designed for the Nigerian landscape. It leverages AI to provide citizens with instant legal assistance, document analysis, and procedural guidance.

**Core Objective**: To bridge the gap between complex legal statutes and everyday citizen needs through a premium, accessible, and high-trust interface.

---

## 2. Brand & Aesthetic Identity: The "Emerald" System
The visual language, internally dubbed the **Emerald System**, is built on a foundation of trust, authority, and modern Nigerian heritage.

### 2.1 Color Palette (Nigerian Emerald)
*   **Primary (Emerald Hub)**:
    *   `#00A86B` (Nigerian Green - Brand Pillar)
    *   `#00875A` (Deep Emerald - Pressed/Active states)
    *   `#E6F4EA` (Emerald Tint - Soft Backgrounds)
*   **Secondary/Accent (Legacy Gold)**:
    *   `#D4AF37` (Metallic Gold - Premium badges/Special features)
*   **Semantic Colors**:
    *   **Success**: `#2E7D32` (Deep Forest)
    *   **Warning/Caution**: `#F57C00` (Amber Alert)
    *   **Error/Risk**: `#D32F2F` (Urgency Red)
*   **Neutral Surfaces (Dark Mode Primary)**:
    *   `Background`: `#0F172A` (Slate Dark)
    *   `Surface`: `#1E293B` (Elevated Cards)
    *   `Border`: `#334155` (Subtle Dividers)

### 2.2 Typography Hierarchy
*   **System Fonts**: `Inter` (Functional/Body) & `Outfit` (Headings/Branding).
*   **H1 (Hero)**: `32px / Bold / Outfit` (Used in Splash/Onboarding Headers).
*   **H2 (Section)**: `24px / SemiBold / Inter` (Screen titles).
*   **H3 (Card Header)**: `18px / Medium / Inter`.
*   **Body (Primary)**: `16px / Regular / Inter` (Line Height: 1.5).
*   **Caption (Legal Trace)**: `12px / Medium / Inter` (Monospaced style for article references).

### 2.3 Visual Signatures
*   **Glassmorphism**: 15px-20px blur on the bottom navigation bar and situational modals.
*   **Rounding**: `16px` standard corner radius for all primary cards.
*   **Elevation**: Using `shadowOpacity: 0.1` on light mode; subtle border glows on dark mode.

---

## 3. Navigation Architecture
The app follows a state-driven navigation logic managed by `RootNavigator`.

### 3.1 Flow Logic
1.  **Identity Phase**: `Splash` -> `Onboarding` (if first time).
2.  **Gate Phase**: `Login` / `Signup` / `Forgot Password`.
3.  **Main Application**: `MainTabs` (Persistent Glassmorphic Tab Bar).
    *   **Tab 1: Focus Hub (Chat)**: Centralized AI Assistant.
    *   **Tab 2: Tools**: Grid of specialized legal engines.
    *   **Tab 3: Profile**: User settings and history.

---

## 4. Screen-by-Screen Specifications

### 4.1 Onboarding Suite (`OnboardingScreen`)
*   **Structure**: 3-slide horizontal carousel (`FlatList` paging).
*   **Slide 1 (Authority)**: "Know Your Rights" - Illustration of Justice Scales.
*   **Slide 2 (Assistance)**: "AI Legal Companion" - Abstract AI node visualization.
*   **Slide 3 (Empowerment)**: "Document Architect" - Symbolic paper/pen graphic.
*   **Interactive Elements**:
    *   `Progress Dots`: Synchronized with scroll position.
    *   `CTA Button`: "Get Started" (Green Primary) becomes active on final slide.
    *   `Skip Button`: Subtle top-right anchor for repeat users.

### 4.2 Authentication Suite
#### Login Screen
*   **Fields**: Email/Username, Password (w/ toggle visibility).
*   **Social Auth**: Google/Apple OAuth buttons in a horizontal row.
*   **CTA**: Full-width Emerald button with loading spinner state.
#### Signup Screen
*   **Fields**: Full Name, Email, Password (Confirm), Phone (Optional).
*   **Password Strength Meter**: 4-segment color indicator (Red -> Green).
*   **Validation**: Real-time error text under fields.

### 4.3 The Legal Assistant (`ChatScreen`)
*   **Navigation Icon**: Floating bubble in the Tab Bar Hub.
*   **UI Components**:
    *   `Message Bubble`: Emerald (User), Dark Slate (AI).
    *   `Incognito Mode`: Toggle at top; turns UI to a grayscale/stealth theme.
    *   `Voice Intake`: Waveform animation during holding the mic button.
    *   `Guest Guard`: Modal appears after 3 messages for unauthenticated users.
*   **Features**: Markdown support for bolding legal citations.

### 4.4 Legal Power Tools (`ToolsHomeScreen`)
*   **Layout**: 2-column Masonry grid.
*   **Tool Cards**:
    1.  **Document Review**: Icon: Magnifying Glass + Doc.
    2.  **Document Architect**: Icon: Blueprints/T-Square.
    3.  **Constitution Explorer**: Icon: Coat of Arms / Book.
    4.  **Legal Aid Discovery**: Icon: Map Pin + Scale.
*   **Status Indicators**: "Beta" or "Premium" tags in top-right corners of cards.

### 4.5 Document Review Screen
*   **Process Flow**: `Capture/Upload` -> `Scanning` -> `Analysis` -> `Verdict`.
*   **Risk Gauge**: Semi-circular dial (Green to Red) showing "Legal Safety Score".
*   **Clause Breakdown**: List of identified "Red Flags" with expandable mitigation advice.

### 4.6 Document Architect (`DocumentGeneratorScreen`)
*   **Multi-Step Wizard**:
    1.  `Select`: Template list (NDA, Tenancy, Demand Letter).
    2.  `Intake`: Dynamic form generator based on selection.
    3.  `Chat-Consult`: AI-led interview to fill remaining gaps.
    4.  `Preview`: Live text viewer with highlighted variables.
    5.  `Finalize`: PDF/Word Export options.

### 4.7 Constitution Explorer (`ConstitutionExplorerScreen`)
*   **Navigation Hierarchy**: `Chapter` -> `Section` -> `Article`.
*   **Search Interface**: Global search bar with "Article #" filter.
*   **Content View**: Large clear typography with the ability to "Share Article" or "Ask AI about this".

### 4.8 Legal Aid Discovery (`LegalAidMapScreen`)
*   **Map Interface**: Full-screen Google Maps integration with custom Emerald pins.
*   **Filters**: "Pro-Bono", "Public Defender", "Civil Rights NGO".
*   **Provider Drawer**: Bottom-sheet that slides up showing provider contact details, directions, and "Request Appointment" link.

---

## 5. User Profile & Data (`ProfileStack`)
### 5.1 Profile Home
*   **Header**: Avatar, Name, Subscription Tier (Free/Pro).
*   **Menu Items**: My Documents, Saved Articles, Privacy Policy, Help Center.
### 5.2 Chat History
*   **Card Design**: Summary of the topic + Timestamp + "Risk Assessment" color dot.
*   **Action**: Tap to resume conversation with full context.
### 5.3 Settings
*   **Toggles**: Dark Mode (System/On/Off), Haptic Feedback, Biometric Login.
*   **Account**: "Delete Data" (Hidden under red caution footer).

---

## 6. Redesign Requirements for "Stitch"
*   **Haptic Consistency**: Every button press must have a `Medium` impact.
*   **Transitions**: Use `LayoutAnimation` for expanding cards and page transitions.
*   **Stateful UI**: Always include Skeleton Loaders for data-heavy views (Map, History).
*   **Legality**: Ensure the "Disclaimers" are visible in footer areas of AI responses.
