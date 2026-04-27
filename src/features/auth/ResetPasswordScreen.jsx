// src/features/auth/ForgotPasswordScreen.jsx
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {useForm, Controller} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import Ionicons from 'react-native-vector-icons/Ionicons';

import CurvedHeader from '@components/ui/CurvedHeader';
import {COLORS} from '@constants/colors';
import {DIMENSIONS} from '@constants/dimensions';
import {navigate, resetAndNavigate} from '@utils/NavigationUtils';
import {useResetPasswordMutation} from '@store/api/authApi';
import {useAlert} from '@components/ui/AlertProvider';
import {extractErrorMessage, toFormData} from '@utils/commonFn';
import Toast from 'react-native-toast-message';

// --- validation ---
const Schema = z.object({
  password: z
    .string()
    .min(8, 'Min 8 characters')
    .regex(/[A-Za-z]/, 'Must contain at least one letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
});

/**
 * Reset Password Screen
 *
 * Step 3 of Password Reset Flow (Final Step).
 *
 * Logic:
 * - Accepts the new password from the user.
 * - Uses the previously verified email context (from route params).
 * - Calls `useResetPasswordMutation` to update credentials.
 * - Redirects to Sign In on success.
 */
export default function ResetPasswordScreen({navigation, route}) {
  const insets = useSafeAreaInsets();
  const {alert, confirm} = useAlert();

  const [resetPassword, {isLoading, data, isSuccess, isError, error}] =
    useResetPasswordMutation();
  const frozenBottom = React.useRef(insets.bottom || 0).current;
  const [showPass, setShowPass] = useState(false);

  const prevBody = route?.params?.body || {};

  const {
    control,
    handleSubmit,
    formState: {errors, isValid, isSubmitting},
  } = useForm({
    resolver: zodResolver(Schema),
    mode: 'onChange',
    defaultValues: {password: ''},
  });

  const onSubmit = async ({password}) => {
    // TODO: call your RTK Query "request OTP" mutation here
    try {
      const body = await toFormData({
        email: prevBody?.to?.email || '',
        password: password || '',
      });
      console.log('body', body);

      const res = await resetPassword(body).unwrap();
      console.log('resetPassword', res);
      if (res?.id) {
        Toast.show({
          type: 'success',
          text1: 'Password Updated',
          text2: 'Your password has been reset successfully.',
        });
        resetAndNavigate('Auth', {
          screen: 'SignInScreen',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Reset Failed',
          text2: 'Unable to reset your password. Please try again.',
        });
      }

      // Alert.alert('Sign in failed', extractErrorMessage(err));
    } catch (error) {}
  };

  useEffect(() => {
    if (isError) {
      console.log('err', error);

      // Alert.alert('Sign in failed', extractErrorMessage(error));
      alert({
        title: 'Failed',
        message: extractErrorMessage(error),
        variant: 'danger',
        actions: [{text: 'Try again', style: 'primary'}],
      });
    }
  }, [isError, error]);

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* gradient header with wave at bottom to match your UI */}
      <CurvedHeader edge="bottom" />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: DIMENSIONS.PADDING_HORIZONTAL,
          paddingBottom: frozenBottom + DIMENSIONS.verticalScale(24),
        }}>
        <Text style={styles.title}>Reset Password</Text>

        <Text style={styles.subTitle}>Enter new password</Text>

        {/* Password */}
        <Controller
          control={control}
          name="password"
          render={({field: {onChange, onBlur, value}}) => (
            <>
              <View
                style={[
                  styles.inputWrap,
                  {marginTop: DIMENSIONS.verticalScale(18)},
                  errors.password && styles.inputWrapError,
                ]}>
                <TextInput
                  //   ref={passRef}
                  placeholder="Enter new Password"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry={!showPass}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit(onSubmit)}
                />
                <TouchableOpacity
                  style={styles.eye}
                  onPress={() => setShowPass(s => !s)}
                  activeOpacity={0.7}>
                  <Ionicons
                    name={showPass ? 'eye-outline' : 'eye-off-outline'}
                    size={22}
                    color="#2B2B2B"
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.err}>{errors.password.message}</Text>
              )}
            </>
          )}
        />

        {/* CTA */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleSubmit(onSubmit)}
          disabled={!isValid || isLoading}
          // onPress={() => navigate('Auth', {screen: 'SignInScreen'})}
          style={{marginTop: DIMENSIONS.verticalScale(40)}}>
          <LinearGradient
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            colors={isValid ? ['#8EC6EA', '#234B67'] : ['#C9D7E1', '#C9D7E1']}
            style={styles.button}>
            <Text style={styles.btnText}>
              {isLoading ? 'Please wait…' : 'Reset Password'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Back link */}
        {/* <View style={styles.backWrap}>
          <TouchableOpacity
            onPress={() => navigate('Auth', {screen: 'SignInScreen'})}>
            <Text style={styles.backLink}>Back to log in</Text>
          </TouchableOpacity>
        </View> */}
      </ScrollView>
    </SafeAreaView>
  );
}

// ---- styles ----
const R = DIMENSIONS.moderateScale(26);
const INPUT_H = Math.max(DIMENSIONS.INPUT_HEIGHT, 54);

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#FFFFFF'},

  title: {
    fontSize: DIMENSIONS.FONT_SIZE_TITLE,
    fontWeight: '600',
    color: '#111827',
    marginTop: DIMENSIONS.verticalScale(6),
  },
  subTitle: {
    marginTop: DIMENSIONS.verticalScale(8),
    color: COLORS.textSecondary || '#6B7280',
    fontSize: DIMENSIONS.FONT_SIZE_MEDIUM,
    lineHeight: DIMENSIONS.FONT_SIZE_MEDIUM * 1.4,
  },

  inputWrap: {
    height: INPUT_H,
    borderRadius: R,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    marginBottom: DIMENSIONS.verticalScale(13),
    paddingHorizontal: DIMENSIONS.moderateScale(18),
    justifyContent: 'center',
  },
  inputWrapError: {
    borderColor: '#DC2626', // red border on error
  },
  eye: {
    position: 'absolute',
    right: DIMENSIONS.moderateScale(16),
    height: INPUT_H,
    justifyContent: 'center',
  },
  input: {
    fontSize: DIMENSIONS.FONT_SIZE_LARGE,
    color: '#111827',
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
  },
  err: {
    color: '#DC2626',
    fontSize: DIMENSIONS.FONT_SIZE_SMALL,
    marginTop: DIMENSIONS.verticalScale(-10),
    marginBottom: DIMENSIONS.verticalScale(12),
    marginLeft: DIMENSIONS.moderateScale(6),
  },

  button: {
    height: DIMENSIONS.BUTTON_HEIGHT + DIMENSIONS.verticalScale(6),
    borderRadius: DIMENSIONS.moderateScale(34),
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: DIMENSIONS.FONT_SIZE_XLARGE,
    fontWeight: '500',
  },

  backWrap: {alignItems: 'center', marginTop: DIMENSIONS.verticalScale(14)},
  backLink: {
    color: '#2E6C94',
    fontWeight: '600',
    fontSize: DIMENSIONS.FONT_SIZE_XLARGE,
  },
});
