// src/features/auth/ForgotPasswordScreen.jsx
import React, {useEffect} from 'react';
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

import CurvedHeader from '@components/ui/CurvedHeader';
import {COLORS} from '@constants/colors';
import {DIMENSIONS} from '@constants/dimensions';
import {navigate} from '@utils/NavigationUtils';
import {extractErrorMessage} from '@utils/commonFn';
import {useAlert} from '@components/ui/AlertProvider';
import {
  useVerifyOTPMutation,
  useForgotPasswordMutation,
} from '@store/api/authApi';
import Toast from 'react-native-toast-message';

// --- validation ---
const Schema = z.object({
  otp: z.string().min(1),
});

/**
 * OTP Verification Screen
 *
 * Step 2 of Password Reset Flow.
 *
 * Logic:
 * - Accepts the One-Time Password sent to the user's email.
 * - Verifies the code via `useVerifyOTPMutation`.
 * - Allows Resending the OTP if expired/lost.
 * - Navigates to `ResetPasswordScreen` upon successful verification.
 */
export default function OtpScreen({navigation, route}) {
  const insets = useSafeAreaInsets();
  const {alert, confirm} = useAlert();
  const [verifyOTP, {isLoading, data, isSuccess, isError, error}] =
    useVerifyOTPMutation();
  const [
    forgotPassword,
    {
      isLoading: reSendIsLoading,
      data: resSendData,
      isError: reSendIsError,
      error: reSendError,
    },
  ] = useForgotPasswordMutation();

  const frozenBottom = React.useRef(insets.bottom || 0).current;
  const prevBody = route?.params?.body || {};

  const {
    control,
    handleSubmit,
    formState: {errors, isValid, isSubmitting},
  } = useForm({
    resolver: zodResolver(Schema),
    mode: 'onChange',
    defaultValues: {otp: ''},
  });

  const onSubmit = async ({otp}) => {
    // TODO: call your RTK Query "request OTP" mutation here
    // await requestOtp({ email }).unwrap();
    // Alert.alert('Success', 'OTP sent to your email.');
    // navigate to OTP screen if you have one
    try {
      let res = await verifyOTP({
        otp: otp,
        email: prevBody?.to?.email,
      }).unwrap();
      res = JSON.parse(res);
      console.log('otpVerify', res.status);
      if (res.status === 'success') {
        Toast.show({
          type: 'success',
          text1: 'OTP Verified',
          text2: 'Your OTP has been verified successfully.',
        });
        navigate('Auth', {
          screen: 'ResetPasswordScreen',
          params: {
            body: prevBody,
          },
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'OTP Verification Failed',
          text2: 'Invalid or expired OTP. Please request a new one.',
        });
      }

      // Alert.alert('Sign in failed', extractErrorMessage(err));
    } catch (error) {}
  };

  const reSendOTP = async () => {
    // TODO: call your RTK Query "request OTP" mutation here

    try {
      const body = prevBody;

      const res = await forgotPassword(body).unwrap();
      console.log('forgotPassword', res);
      if (res?.messageId) {
        Toast.show({
          type: 'success',
          text1: 'Email Sent',
          text2: 'We’ve sent a OTP to your email address.',
        });
        navigate('Auth', {
          screen: 'OtpScreen',
          params: {
            body,
          },
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Request Failed',
          text2: 'Unable to send OTP. Please check your email and try again.',
        });
      }

      // Alert.alert('Sign in failed', extractErrorMessage(err));
    } catch (error) {}
  };

  useEffect(() => {
    if (isError) {
      console.log('err', error);

      // Alert.alert('Sign in failed', extractErrorMessage(error));
      // alert({
      //   title: 'Failed',
      //   message: extractErrorMessage(error),
      //   variant: 'danger',
      //   actions: [{text: 'Try again', style: 'primary'}],
      // });
      alert({
        title: 'Verification Failed',
        message: 'Invalid or expired OTP. Please request a new one.',
        variant: 'danger',
        actions: [{text: 'Try again', style: 'primary'}],
      });
    }
  }, [isError, error]);

  useEffect(() => {
    if (reSendIsError) {
      console.log('err', reSendError);

      // Alert.alert('Sign in failed', extractErrorMessage(error));
      alert({
        title: 'Failed',
        message: extractErrorMessage(reSendError),
        variant: 'danger',
        actions: [{text: 'Try again', style: 'primary'}],
      });
    }
  }, [reSendIsError, reSendError]);

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
        <Text style={styles.title}>Enter OTP</Text>

        <Text style={styles.subTitle}>Enter the OTP sent to your email.</Text>

        {/* Email */}
        <Controller
          control={control}
          name="otp"
          render={({field: {onChange, onBlur, value}}) => (
            <>
              <View
                style={[
                  styles.inputWrap,
                  {marginTop: DIMENSIONS.verticalScale(18)},
                ]}>
                <TextInput
                  placeholder="Enter OTP"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit(onSubmit)}
                />
              </View>
              {errors.email && (
                <Text style={styles.err}>{errors.email.message}</Text>
              )}
            </>
          )}
        />
        <View style={styles.resendContainer}>
          <TouchableOpacity
            onPress={() => reSendOTP()}
            disabled={isLoading || reSendIsLoading}>
            <Text style={styles.resendText}>Resend OTP</Text>
          </TouchableOpacity>
        </View>

        {/* CTA */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleSubmit(onSubmit)}
          disabled={!isValid || isLoading || reSendIsLoading}
          style={{marginTop: DIMENSIONS.verticalScale(40)}}>
          <LinearGradient
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            colors={
              isValid && !reSendIsLoading
                ? ['#8EC6EA', '#234B67']
                : ['#C9D7E1', '#C9D7E1']
            }
            style={styles.button}>
            <Text style={styles.btnText}>
              {isLoading ? 'Please wait…' : 'Verify OTP'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Back link */}
        <View style={styles.backWrap}>
          <TouchableOpacity
            onPress={() => navigate('Auth', {screen: 'SignInScreen'})}>
            <Text style={styles.backLink}>Back to log in</Text>
          </TouchableOpacity>
        </View>
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
    fontWeight: '800',
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
    fontWeight: '700',
  },

  backWrap: {alignItems: 'center', marginTop: DIMENSIONS.verticalScale(14)},
  backLink: {
    color: '#2E6C94',
    fontWeight: '800',
    fontSize: DIMENSIONS.FONT_SIZE_XLARGE,
  },
  resendContainer: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  resendText: {
    fontWeight: '800',
    fontSize: DIMENSIONS.FONT_SIZE_MEDIUM,
    color: '#2E6C94',
  },
});
