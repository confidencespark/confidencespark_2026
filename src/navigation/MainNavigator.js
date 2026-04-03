import {createNativeStackNavigator} from '@react-navigation/native-stack';

// Main Screens
import IntroScreen from '@features/intro/IntroScreen';
import MoodSelectScreen from '@features/main/MoodSelectScreen';
import ConfirmSituationScreen from '@features/main/ConfirmSituationScreen';
import ConfirmVibeScreen from '@features/main/ConfirmVibeScreen';
import LookupScreen from '@features/main/LookupScreen';
import StepFlowScreen from '@features/main/StepFlowScreen';
import HomeScreen from '@features/main/home/HomeScreen';

const Stack = createNativeStackNavigator();

/**
 * Main Application Navigator
 *
 * Manages the stack of screens available to authenticated users.
 * This includes the main "Situation" flows (Home, Mood, Confirmation, Step Flow).
 *
 * Note: The 'UserBottomTab' resides outside this stack in the root Navigation,
 * but this stack handles the deeper flows initiated from those tabs.
 */
const MainNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}>
      <Stack.Screen
        options={{
          animation: 'fade',
        }}
        name="HomeScreen"
        component={HomeScreen}
      />
      <Stack.Screen
        options={{
          animation: 'fade',
        }}
        name="MoodSelectScreen"
        component={MoodSelectScreen}
      />
      <Stack.Screen
        options={{
          animation: 'fade',
        }}
        name="ConfirmSituationScreen"
        component={ConfirmSituationScreen}
      />
      <Stack.Screen
        options={{
          animation: 'fade',
        }}
        name="ConfirmVibeScreen"
        component={ConfirmVibeScreen}
      />
      <Stack.Screen
        options={{
          animation: 'fade',
        }}
        name="LookupScreen"
        component={LookupScreen}
      />
      <Stack.Screen
        options={{
          animation: 'fade',
        }}
        name="StepFlowScreen"
        component={StepFlowScreen}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;
