import React, {useEffect} from 'react';
import 'react-native-reanimated';
import 'react-native-gesture-handler';

import {AppState, InteractionManager, Platform} from 'react-native';
import {Provider} from 'react-redux';
import Toast from 'react-native-toast-message';
import Navigation from '@navigation/Navigation';
import {store} from './src/store/store';
import {AlertProvider} from '@components/ui/AlertProvider';
import {hideNavBar} from './src/utils/androidNavBar';

/**
 * Root Application Component
 *
 * Responsibilities:
 * 1. Global Providers setup (Redux Store, Alerts, Toast)
 * 2. Platform specific tweaks (Hide Android bottom nav bar - deferred until UI ready)
 */
function App() {
  useEffect(() => {
    // Defer hideNavBar until after interactions; avoids crash on some emulators
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active' && Platform.OS === 'android') {
        InteractionManager.runAfterInteractions(() => hideNavBar());
      }
    });
    return () => sub.remove();
  }, []);

  return (
    <Provider store={store}>
      <AlertProvider>
        <Navigation />
        <Toast />
      </AlertProvider>
    </Provider>
  );
}

export default App;
// ConfidenceSpark workspace batch
