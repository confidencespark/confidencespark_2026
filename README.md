# Taking Your Stage (Confidence Catalyst)

## 1. Project Overview

"Taking Your Stage" is a mobile application built to help users build confidence through guided "Situations" (e.g., Interviews, Pitches, Daily Boosts). It was originally designed for Bravo Studio but has been successfully migrated to a custom **React Native** codebase for greater flexibility and control.

## 2. Architecture & Flow

The application follows a clean, modern architecture separating the UI, State, and API layers.

### High-Level Flow Summary:

1.  **Mobile App (React Native)**: The interface the user interacts with.
2.  **API Layer**: **Supabase** for confidence content (situations, vibes, kits). Xano for auth (if used).
3.  **Services**:
    - **Brevo**: Handles transactional emails (via Xano).

---

## 3. Technology Stack

### Core

- **Framework**: React Native (CLI)
- **Language**: JavaScript / TypeScript

### State Management & API

- **Redux Toolkit**: Global state management (User session, Theme).
- **RTK Query**: Efficient data fetching and caching.
- **Supabase**: Backend for confidence content (situations, vibes, kits). See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md).

### Navigation

- **React Navigation v7**:
  - Native Stack (Push/Pop screens)
  - Bottom Tabs (Main Dashboard)

### Styling

- **Unistyles**: Performance-first styling system.
- **Vanilla Stylesheets**: Standard RN styling.

---

## 4. Folder Structure (`src/`)

```
src/
├── assets/          # Images, Fonts, Icons
├── components/      # Reusable UI elements (Buttons, Headers)
├── constants/       # Global constants (Colors, Dimensions, Strings)
├── features/        # Feature-based modules (The core app logic)
│   ├── auth/        # Login, Signup, Forgot Password
│   ├── intro/       # Onboarding/Intro screens
│   ├── main/        # Core "Situation" flows (Home, Lookup, Steps)
│   ├── profile/     # User profile management
│   ├── splash/      # Splash screen logic
│   └── tabs/        # Bottom tab navigator configuration
├── navigation/      # Navigator definitions (AuthNavigator, MainNavigator)
├── store/           # Redux setup & API definitions
│   ├── api/         # RTK Query endpoints (confidenceApi.js)
│   └── slices/      # Redux slices (authSlice.js)
└── utils/           # Helper functions (Storage, DeviceID, formatting)
```

---

## 5. Setup & Installation

### Prerequisites

- Node.js (> 18)
- Watchman
- **iOS**: Xcode & CocoaPods
- **Android**: Android Studio & JDK

### Installation Steps

1.  **Clone the repository**:

    ```bash
    git clone <repo-url>
    cd tys-react-native
    ```

2.  **Install JS Dependencies**:

    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Install iOS Dependencies (Mac Only)**:
    ```bash
    cd ios && pod install && cd ..
    ```

---

## 6. Running the App

**Start Metro Bundler:**

```bash
npm start
```

**Run on Android:**

```bash
npm run android
```

**Windows (long project path):** If the project path is long and you see CMake/ninja "Permission denied" or path length errors, use the short-path helper (builds from a virtual drive):

```bash
npm run android:win
```

**Run on iOS:**

```bash
npm run ios
```

---

## 7. Key Configuration & Credentials

- **Supabase**: Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `.env`. See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for full setup.
- **API Base URL** (for auth): `API_URL` and `AUTH_API_URL` in `.env`.

---

## 8. Deployment

### Android (Play Store)

1.  Update `versionCode` and `versionName` in `android/app/build.gradle`.
2.  Run the build command:
    ```bash
    cd android && ./gradlew bundleRelease
    ```
3.  The `.aab` file will be generated in `android/app/build/outputs/bundle/release/`.

### iOS (App Store)

1.  Open `ios/ConfidenceCatalyst.xcworkspace` in Xcode.
2.  Update Version and Build number.
3.  Select "Any iOS Device (arm64)".
4.  Go to **Product -> Archive**.
5.  Follow the organizer steps to upload to TestFlight/App Store Connect.

---

ConfidenceSpark workspace batch.
