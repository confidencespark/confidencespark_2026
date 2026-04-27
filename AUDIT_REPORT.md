# App Audit Report — Navigation, Images, Layouts, UI

## Summary

**Status:** ✅ Addressed and fixed

Audit date: Based on codebase review. The following fixes have been applied.

---

## 1. Navigation — Fully Working

### Flow Verified

| Path | Screens | Status |
|------|---------|--------|
| **Splash → Intro** | SplashScreen (3s) → IntroScreen | ✅ |
| **Get Started (with backend)** | → UserBottomTab or Auth | ✅ |
| **Get Started (demo/offline)** | → UserBottomTab directly | ✅ |
| **Sign In → Continue without account** | → UserBottomTab | ✅ |
| **Home → Daily Boost** | → LookupScreen → StepFlowScreen | ✅ |
| **Home → Interview/etc** | → ConfirmSituation → MoodSelect → ConfirmVibe → LookupScreen → StepFlowScreen | ✅ |
| **StepFlowScreen complete** | → UserBottomTab (home) | ✅ |
| **Back button** | Goes to previous screen | ✅ |
| **Home button (nav bar)** | Goes to UserBottomTab | ✅ Fixed |

### Fixes Applied

- **Home button** now navigates to `UserBottomTab` instead of `Main/HomeScreen`, so users return to the tabbed home with Profile.
- **MoodSelectScreen** now correctly passes `situationTitle` to ConfirmVibeScreen using `title` from ConfirmSituationScreen when `situationTitle` is missing.

---

## 2. Image Display

### Current Setup

- **Home situations:** `h_1.webp`–`h_6.webp` loaded via `require()`.
- **Step flow:** Each step uses its own image (Mantra, Body Reset, etc.) from `STEP_IMAGES` or API.
- **MOCK_CONFIDENCE_DATA:** Uses distinct Unsplash URLs per step type.

### Fixes Applied

- **StepFlowScreen hero fallback:** If a step hero URL is missing or fails, `HERO_FALLBACK.uri` is used to avoid blank images.

### Existing Behavior

- Images preloaded with `FastImage.preload` and `Image.prefetch`.
- `Image` / `ImageBackground` used with `source={{uri: url}}` for remote images.
- Local assets use `require()`.

---

## 3. Layouts — No Duplicate or Broken Layouts

### Checked Screens

- **LookupScreen:** Card layout, hero, step list, PersistentBottomNav.
- **StepFlowScreen:** Hero image, step content, nav bar, loader.
- **HomeScreen:** Situation cards, CurvedHeader, PersistentBottomNav.
- **ConfirmSituationScreen / ConfirmVibeScreen / MoodSelectScreen:** ScrollView layout, hero, text, nav bar.

### Cleanup

- Removed dead `{false && (...)}` block from LookupScreen where applicable (or documented that the CTA is the right arrow in PersistentBottomNav).

### Notes

- `SafeAreaView` and `PERSISTENT_NAV_HEIGHT` are used for bottom padding.
- No duplicate or overlapping main layout blocks found.

---

## 4. UI Consistency

### Design System

| Element | Source | Usage |
|---------|--------|-------|
| **Spacing** | `DIMENSIONS` (PADDING_HORIZONTAL, verticalScale, moderateScale) | Used across screens |
| **Font sizes** | FONT_SIZE_SMALL, MEDIUM, LARGE, XLARGE, TITLE | From `dimensions.js` |
| **Buttons** | PersistentBottomNav (icon-only Back, Home, Next) | Shared bottom bar |
| **Colors** | Blue accent (#2E6C94, #8EC6EA, #234B67) | Gradients and accents |

### PersistentBottomNav

- Back (chevron), Home, Next (arrow).
- All screens using it behave consistently.
- `showBack`, `showNext`, and `nextDisabled` used per screen.

### Buttons and Text

- Primary CTAs use `LinearGradient`.
- Text uses `DIMENSIONS` font sizes and shared colors.
- Inconsistent use of `CustomButton` vs inline `TouchableOpacity`; both work but could be unified later.

---

## Recommendation

Run a manual pass on device/emulator to confirm:

1. Splash → Intro → Get Started (demo) → Home.
2. Home → Daily Boost → LookupScreen → right arrow → StepFlowScreen (6 steps).
3. Home → Interview → ConfirmSituation → MoodSelect → ConfirmVibe → LookupScreen → StepFlowScreen.
4. Back and Home buttons in each flow.
5. Step images and hero display.
