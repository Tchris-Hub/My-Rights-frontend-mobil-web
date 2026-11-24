# My Rights: UI, flow and brand improvements

Status: proposal. Written after reading the mobile app source (`mobile/src`), `theme.ts`, `design_documentation.md`, the onboarding/splash screens and every file in `mobile/assets`.

## 1. Verdict

The engineering underneath is serious. The surface is not. It reads as a generated app because several things on screen are generated, copied from another project, or written in generic marketing voice. None of this needs a rewrite of the app logic. It needs a new brand layer, a new first-run flow, and a smaller set of better-chosen screens.

## 2. Why it looks AI-generated (evidence)

| Where | What is wrong |
|---|---|
| `assets/onboarding/rights.png` and the glowing "R + scales + shield" image | Classic image-model output: glowing arcs, translucent 3D glass, fake document text, and a stray chart with the numbers "13 31 50". A legal app cannot carry a logo with gibberish text in it. |
| `assets/premium_logo.png` | A gold coat of arms with an eagle and two horses on a green field. It imitates the Nigerian national coat of arms. In a legal app that implies government endorsement, and use of official national insignia is normally restricted. Ask a Nigerian lawyer before shipping anything like it. It is also a second, different logo. |
| `assets/onboarding/classroom_bg.png` | A generic stock-style classroom (looks like a US campus, with an EXIT sign). It has nothing to do with legal rights or Nigeria. |
| `src/constants/theme.ts` | The first comment says "Lincoln College color tokens". The palette was carried over from the hostel project. |
| `design_documentation.md` vs `theme.ts` | The doc says Outfit font, dark-first, `#00A86B`. The code uses Plus Jakarta Sans, light-first, `#047857`. There is no single source of truth. |
| `SplashScreen.tsx` | A random joke each launch: "Suing your problems into oblivion", "Squashing bugs and legal thugs", "Objection! (just kidding)". In a product people open when they are scared or in trouble, jokes destroy trust. Four staggered animations plus an endless float loop also delay the first useful screen. |
| `OnboardingScreen.tsx` | Three marketing slides with all-caps badges ("EDITORIAL AUTHORITY", "LEGAL PRECISION") and lines like "Command Your Future" and "Precision at scale". This is generic AI copy. It says nothing about what the app does for a Nigerian in a specific situation. |
| Visual system | Glassmorphism tab bar, emerald plus gold gradients, identical rounded cards. This is the default "premium AI app" look. |
| `mobile/` root | Scratch files committed: `bugui/*.mp4` (WhatsApp videos), `temp_onboarding.html`, `ts_errors.txt`, `clean_errors.txt`, `test_payload.json`, `fix-prompts.md`, `example.md`. |
| Navigation | Chat, Tools and Profile as three stacks with 17+ screens. Document review, document generator and Constitution explorer are tools you browse to, not part of a person's problem. |

## 3. Design direction

### Subject and audience
Ordinary Nigerians facing a real situation: stopped by police, threatened with eviction, owed salary, arrested, cheated online. Often stressed, often on a low-end Android phone, often on expensive or weak data. The job of the app: tell me what my rights are in this situation, show me where the law says so, and get me to a human when I need one.

### One memorable idea: answers come with receipts
Every answer is followed by numbered receipts. Tap one and the exact section of the law slides up from the bottom, in full. The user can see that the answer is backed by real text, not by an AI's confidence. This is the signature interaction. Everything else stays quiet.

### Palette (replace emerald/gold glass)
Rooted in the indigo dye pits of Kano and the adire cloth of Abeokuta, with the yellow of Lagos danfo buses for action.

| Role | Name | Hex |
|---|---|---|
| Ink and primary surface | Dye-pit indigo | `#1E2A5E` |
| Deep text | Indigo black | `#121838` |
| Page | Cool paper | `#F2F4F9` |
| Action and emphasis | Danfo yellow | `#F5B800` |
| Emergency only | Signal red | `#D7332B` |
| "Verified source" only | Verified green | `#1F7A4D` |

Rules: green appears only to mean "verified". Red appears only on emergency. Yellow is the single action color. No gradients, no blur.

### Type
- Headings and UI: Bricolage Grotesque. Chunky, slightly irregular, with a sign-painted feel without being a costume. (Check the `@expo-google-fonts/bricolage-grotesque` package is available for your SDK.)
- Law text and long answers: Literata. Designed for reading on small screens, which is what statutes are. Give it generous line height.
- Drop Plus Jakarta Sans and Inter. Sentence case everywhere. No all-caps badges.

### Layout
Left-aligned. Situations are a typographic list with dividers, not a grid of identical cards. Cards are reserved for the one thing that deserves a card: a saved matter.

### Texture without images
Generate adire-inspired resist-dye patterns in code with `react-native-svg` (circles, squares, lines on an indigo field). Use it as the header texture and splash background. It is tiny, works offline, themes automatically, and is far more Nigerian than stock photos. Have a Nigerian designer review the pattern so it respects its cultural source.

### Review of this plan against the defaults
Checked against the usual generated looks: the cream-and-terracotta serif page, black with a neon accent, the card-grid SaaS kit, and caps-label chrome. This plan avoids all four. One change made during review: the first draft put a yellow badge on every answer. That was removed. Yellow now appears only on the action button.

## 4. New app flow

Principle: value first, account later. Today a new user sees splash, three slides, login, consent, and only then the app. Target: first useful answer within three taps.

```
Native splash (indigo + mark, under 1 s)
   |
First launch only: "Which state are you in?"  (+ English / Pidgin)
   |         (this sets the jurisdiction, which drives which law applies)
   v
HOME  --------------------------------------------------------------
  "What is happening?"   [ type or hold to speak ]
  Police stopped me
  My landlord wants me out
  My boss has not paid me
  I was arrested
  Someone cheated me online
  More situations
  [ I am being stopped now ]   <- always visible, red
  --------------------------------------------------------------
  tabs:  Ask | Matters | Get help | Me
```

- Tab 1, Ask: situation list, free-text and voice question, answers with receipts.
- Tab 2, Matters: a saved situation with its chat, documents, notes, and deadlines. This is what needs an account. Prompt to sign in only when the user taps Save.
- Tab 3, Get help: legal aid centres, verified professionals, map, enquiry form.
- Tab 4, Me: language, state, privacy center, support.
- Document review and document writing appear inside a matter and as two shortcuts on Home. They stop being a separate Tools area.
- Constitution explorer becomes "Read the law", reached from any receipt.

### Consent
Keep it, but move it. A full consent screen before value is friction. Show a plain-language bottom sheet the first time the user sends a question: what is sent, to whom, and that this is legal information and not a lawyer. Keep the server-side consent check; only the placement changes.

### Emergency mode
One tap from anywhere. Full-screen red, large type, works offline from a cached script. Content (what to say, what not to say, who to call) must be written and signed off by a Nigerian lawyer. The code should treat it as content with a version and a review date, not as strings in a component.

## 5. Start animation

Replace the four-stage splash with one orchestrated moment.

1. Native splash (`expo-splash-screen`): solid indigo plus the mark. No text, no jokes.
2. On cold start only: the mark draws itself in about 700 ms (stroke-dashoffset on an SVG path with Reanimated, both already in `package.json`), then the screen cross-fades to Home or to the first-run state picker.
3. Warm start: no animation.
4. Respect "reduce motion".
5. Delete the float loop and the subtitle array.

## 6. Onboarding

Delete the three-slide carousel. Replace with one screen: state and language. If a short orientation is wanted, show a single sentence under the Home input ("Ask about a real situation. You will see the law behind every answer."). People learn the receipts idea the first time they tap one.

## 7. Asset rebuild

| Asset | Action |
|---|---|
| `premium_logo.png`, the glowing R image | Delete. Do not ship either. |
| `onboarding/rights.png`, `precision.png`, `justice.png`, `classroom_bg.png` | Delete. |
| New mark | Draw it by hand in Figma or Illustrator, not with an image model. Suggested concept: a speech bubble with a folded page corner (rights that are spoken and written). Simple geometry, readable at 48 px, easy to animate as one path. |
| Wordmark | "My Rights" set in Bricolage Grotesque with the mark. |
| App icon | Mark on indigo, no text. |
| Situation illustrations | Commission 8 to 10 flat spot illustrations from Nigerian illustrators, one per top situation, in a single consistent style. Without budget, use icon-only rows and skip illustrations. |
| Photos | Avoid stock photos of people unless they are Nigerian and licensed. Better none than the classroom. |
| Pattern | Procedural adire SVG, see section 3. |

## 8. Copy rules

- Sentence case. Plain verbs. Say what happens: "Save to my matters", then a toast "Saved to my matters".
- No jokes, no hype words (command, precision, empower, premium).
- Describe the user's situation, not the system. "Police stopped me", not "Rights Engine".
- Errors say what happened and what to do. No apologies and no vagueness.
- Pidgin: have a native speaker review every string. Machine-written Pidgin often sounds wrong and reads as mockery.
- Never claim certainty the system cannot back ("100% justice", "AI lawyer"). The backend README already tells the truth about limits; the UI should too.

## 9. Code changes

1. One tokens file (`src/constants/theme.ts`): remove the "Lincoln College" header, remove the "compat layers", rename tokens by role (`ink`, `paper`, `action`, `emergency`, `verified`).
2. Delete `design_documentation.md` and rewrite it from the new tokens, or generate it from `theme.ts`, so doc and code cannot drift again.
3. Rebuild `Button`, `Card`, `Input` on the new tokens. Remove the blur and glass tab bar (`GlassmorphicTabBar.tsx`), replace with a flat four-tab bar.
4. New components: `SituationRow`, `Receipt` (citation chip), `LawSheet` (bottom sheet with full provision text), `EmergencyButton`, `StatePicker`.
5. Navigation: `RootNavigator` becomes splash, first-run, tabs. Auth moves to a modal triggered by Save.
6. Fonts: swap `@expo-google-fonts/inter` and `plus-jakarta-sans` for the two chosen families and subset if possible to keep the bundle small.
7. Remove the scratch files listed in section 2.
8. Update `CLAUDE.md`. It currently describes Expo 54, Supabase and a Railway backend, while `package.json` shows Expo 57 and Better Auth with a separate backend repo. Anything that reads that file (including AI assistants) will be misled.

## 10. Test it on real people

- Five people who are not developers, on low-end Android phones (Tecno, Infinix, itel class), ideally on a weak connection.
- Task: "A policeman has just taken your phone. Use the app." Measure time to first useful answer and whether they open a receipt.
- Fix what they stumble on before polishing anything else.

## 11. Order of work

1. Week 1: tokens, fonts, new mark, delete bad assets, scratch cleanup.
2. Week 2: first-run state picker, new Home, situation rows, flat tab bar, start animation.
3. Week 3: receipts and `LawSheet`, emergency mode shell (content from a lawyer), matters tab.
4. Week 4: copy pass, Pidgin review, five-person test, fix list.

The data side of this (situation cards, jurisdiction, provision text for receipts) is described in the backend repo's `docs/DATA_ARCHITECTURE.md`. The receipts UI depends on it.
