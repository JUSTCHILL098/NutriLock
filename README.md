# NutriLock

A private health-information workspace for organising a basic health profile, checking food labels, and managing health reports. Built with React, Vite, and Firebase, and created by Jeevika for everyday wellbeing.

## Demo

Start the development server:

```bash
npm install
npm run dev
```

Then open:

```text
http://localhost:5173
```

Use `localhost` rather than `127.0.0.1` so Google sign-in matches Firebase's authorised local domain. If sign-in reports an unauthorised domain, add `localhost` under **Firebase Authentication > Settings > Authorised domains**.

The first screen asks you to continue with Google. After signing in, the workspace opens with the home overview. The app uses the Firebase project and data paths from the original build.

## Routes

The app supports direct paths and hash equivalents:

| Page | Path | Hash |
| --- | --- | --- |
| Home | `/` | `#home` |
| Health profile | `/profile` | `#profile` |
| Food check | `/food` | `#food` |
| Reports | `/reports` | `#reports` |
| About | `/about` | `#about` |
| Not found | any unknown path | `#not-found` |

The 404 page renders independently of authentication. Production hosting should rewrite unknown paths to `index.html`; the hash routes work without server configuration.

## What is included

- **Google sign-in** through Firebase Authentication.
- **Home overview** with a short guide to each tool.
- **Health profile** that saves a display name in the signed-in user's Firestore profile document.
- **Food check** that compares user-entered words against a pasted ingredient list. It explains that this is word matching only and is not an allergy detector.
- **Reports** that validate a PDF, JPG, or PNG up to 10 MB, upload it to a per-user Firebase Storage path with progress, then request email analysis through the `processHealthReport` Firebase Function.
- **About page** describing the project and its creator, Jeevika.
- **Custom 404 page**, a centred broken-screen recovery state, and an error boundary.
- **Responsive, accessible layout** with a mobile navigation drawer, keyboard focus styles, live-region feedback, page-specific titles, and reduced-motion support.

All original Firebase project settings and data paths have been preserved.

## Mobile behaviour

- The layout is tested from 320 px upward.
- Below 900 px the sidebar becomes a drawer with a scrim, a close control, Escape-to-close, and background scroll locking.
- Form fields use 16 px text so iOS Safari does not zoom the page on focus.
- Primary controls, navigation rows, and icon buttons use touch targets of at least 44 px where space allows.
- Long content, filenames, and email addresses wrap or truncate instead of pushing the page sideways.

## Design notes

The visual system uses a restrained wine and cream palette, Fraunces display type, Manrope body text, hairline rules, solid surfaces, and small radii. There are no gradient hero treatments, glass panels, decorative card borders, emoji headings, or scroll-triggered fades. Lucide is used only for the functional menu and close controls.

## Project structure

```text
src/
  App.jsx                   authentication gate, routing, page titles
  firebase.js               Firebase app, auth, Firestore, storage, functions
  styles.css                full visual system and responsive styles
  components/
    AuthScreen.jsx          Google sign-in experience
    Brand.jsx               text wordmark
    ErrorBoundary.jsx       broken-screen recovery state
    Feedback.jsx            inline success/error/notice messages
    NotFound.jsx            standalone 404 page
    PageHeader.jsx          shared page heading
    Sidebar.jsx             desktop sidebar and mobile drawer
    Topbar.jsx              account bar and mobile menu trigger
  views/
    HomeView.jsx
    ProfileView.jsx
    FoodCheckView.jsx
    ReportsView.jsx
    AboutView.jsx
```

## Firebase notes

The Firebase web configuration is retained from the original project. Web API keys are intended to be public; security is enforced by Firebase Authentication rules, Firestore rules, Storage rules, and App Check where configured.

Before this is used with real health information, the project supervisor should review and test:

- Firestore and Storage security rules, including per-user access.
- Privacy notices, consent, retention, and deletion processes.
- Firebase Functions deployment and the external AI and email services it calls.
- Authorised domains for Google sign-in.

The app's automated food and report tools are informational only. They must not be presented as diagnosis or medical advice.

## Checks

```bash
npm run lint
npm run build
```

The production build is written to `dist/`. The only current build warning is the Firebase bundle size; the SDK is large but the project already depends on it.
