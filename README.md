# Rewrite AI

**Your message, just better.** Rewrite AI is a mobile app (iOS and Android, built with Expo and React Native) that turns a rough draft into clear, natural English in one tap. Paste a message, pick the tones you want, and get ready-to-send versions you can copy straight into any chat or email.

## The problem it solves

Most of us write quick messages that are unclear, too blunt, or full of typos, then spend time rewording them or paste them into a general chatbot and write a prompt each time. Rewrite AI removes that friction:

- **No prompting.** You paste text; the app knows what to do with it.
- **Several tones at once.** Get a *Better*, *Professional*, *Casual* and *Polite* version side by side and choose the one that fits.
- **One-tap copy.** Every version has its own Copy button.
- **Nothing gets lost.** Your recent rewrites are kept on the device, with all their versions, so you can reopen and copy them later.

## How it works

1. **Sign in** with Google (handled by Supabase Auth).
2. **Write or paste** your draft into the message box.
3. **Choose versions** with the **+** button: toggle Better, Professional, Casual and Polite. Pick the output language (English or Hindi) from the dropdown.
4. **Send.** Your draft appears as a bubble on the right, an AI "thinking" line shows progress, then each version types itself out in order on a timeline.
5. **Copy** any version, or open **Recent rewrites** to revisit older drafts.

Under the hood, the app sends your text, the language and the chosen styles to a Supabase Edge Function named `rewrite-message` (see [`src/lib/rewriteApi.js`](src/lib/rewriteApi.js)). It returns one output per requested style, which the app renders and saves locally.

## Screens and features

### Workspace
The main screen: a message composer with Paste and Clear actions, a language dropdown, and a version picker. The input border plays a soft gradient sweep in the app's purple and pink palette when idle, inviting you to start typing.

![Choosing versions](docs/screenshots/choose-versions.png)
![Language dropdown](docs/screenshots/language-dropdown.png)

### AI response
Results appear below your sent message as a vertical timeline, one version after another. Each version types out character by character, with light haptic feedback while typing and a success haptic when it finishes.

![Rewrite results](docs/screenshots/results.png)

### Recent rewrites and details
Saved rewrites are shown as cards. Tap any card to open a bottom sheet with your original message and every version generated for it, each with a Copy button.

![Recent rewrites](docs/screenshots/recent-rewrites.png)
![Rewrite details](docs/screenshots/rewrite-details.png)

### Profile
Shows your Google account, how many rewrites are saved, a shortcut to your history, and a choice of 11 profile icons. The account menu in the header (Profile, Sign out) closes when you tap outside it.

![Profile menu](docs/screenshots/profile-menu.png)

### Also included
- Light and dark themes (toggle in the header)
- A fixed header with scrolling content on every screen
- Keyboard-aware composer that stays above the keyboard on iOS and Android
- A branded loading screen while sign-in completes

> Screenshots were captured during development; spacing and sizes may differ slightly from the latest build.

## Tech stack

- Expo SDK 58, React Native 0.88, Expo Router
- Supabase (Auth with Google, Edge Functions)
- React Native Reanimated, `react-native-svg`, `expo-haptics`
- AsyncStorage for on-device history, theme and profile icon

## Getting started

Requires Node.js 22.13 or newer.

```bash
git clone https://github.com/aniket-raikwar-dev/rewrite-app.git
cd rewrite-app
npm install
```

Create a `.env` file in the project root (it is not committed):

```
EXPO_PUBLIC_SUPABASE_URL=your-supabase-project-url
EXPO_PUBLIC_SUPABASE_KEY=your-supabase-anon-key
```

Then start the app:

```bash
npx expo start
```

Google sign-in uses the `rewrite-ai://auth/callback` link, so it needs a development build rather than Expo Go:

```bash
npx expo run:android
```

Add `rewrite-ai://auth/callback` to the Redirect URLs in your Supabase project (Authentication → URL Configuration).

## Project structure

```
src/
  app/          Expo Router routes (login, workspace, history, profile, auth callback)
  components/   Screens and shared UI
  lib/          Supabase client, auth, rewrite API, haptics helpers
  state/        App-wide state (session, history, theme)
```

## Scripts

```bash
npx expo lint        # lint
npx tsc --noEmit     # typecheck
```
