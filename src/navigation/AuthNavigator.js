import {createNativeStackNavigator} from '@react-navigation/native-stack';

// Auth Screens
import SignInScreen from '@features/auth/SignInScreen';
import SignupScreen from '@features/auth/SignupScreen';
import ForgotPasswordScreen from '@features/auth/ForgotPasswordScreen';
import OtpScreen from '@features/auth/OtpScreen';
import ResetPasswordScreen from '@features/auth/ResetPasswordScreen';

const Stack = createNativeStackNavigator();

/**
 * Authentication Navigator
 *
 * Manages the stack of screens for the authentication flow:
 * - Sign In
 * - Sign Up
 * - Forgot / Reset Password
 *
 * This navigator is shown when the user is NOT authenticated.
 */
const AuthNavigator = () => {
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
        name="SignInScreen"
        component={SignInScreen}
      />
      <Stack.Screen
        options={{
          animation: 'fade',
        }}
        name="SignUpScreen"
        component={SignupScreen}
      />

      <Stack.Screen
        options={{
          animation: 'fade',
        }}
        name="ForgotPasswordScreen"
        component={ForgotPasswordScreen}
      />

      <Stack.Screen
        options={{
          animation: 'fade',
        }}
        name="OtpScreen"
        component={OtpScreen}
      />

      <Stack.Screen
        options={{
          animation: 'fade',
        }}
        name="ResetPasswordScreen"
        component={ResetPasswordScreen}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
