/**
 * Android Navigation Bar Utilities
 *
 * Helpers to control the visibility of the Android system navigation bar (bottom buttons).
 * Useful for immersive experiences.
 */
import { Platform } from 'react-native';
import SystemNavigationBar from 'react-native-system-navigation-bar';

export const hideNavBar = () => {
  if (Platform.OS !== 'android') return;
  try {
    SystemNavigationBar.navigationHide();
  } catch (_e) {
    // Ignore - some emulators/configs don't support this
  }
};
export const showNavBar = () => {
  if (Platform.OS !== 'android') return;
  try {
    SystemNavigationBar.navigationShow();
  } catch (_e) {
    // Ignore
  }
};
// ConfidenceSpark workspace batch
